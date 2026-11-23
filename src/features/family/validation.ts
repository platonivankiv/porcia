import { emptyCalculationSettings, type FamilyMember, type NutritionGoal, type FoodSubject, type FamilyStorageDocument, type DailyTargets, type Household } from "./model";
import type { CalculationInputs } from "./calculate-targets";

type MemberValues = Omit<FamilyMember, "id" | "householdId" | "legacyDailyTargets">;
type Result<T> = { ok: true; value: T } | { ok: false; errors: Record<string, string> };
export type MemberFormResult = Result<MemberValues>;
export const goalLabels: Record<NutritionGoal, string> = {
  "weight-loss": "Похудение", maintenance: "Поддержание", "muscle-gain": "Набор массы", recomposition: "Рекомпозиция",
};
export const calculationOptions = {
  sexForEquation: { male: "Мужская", female: "Женская" },
  activity: { inactive: "Обычная бытовая активность", "low-active": "Дополнительно много хожу", active: "Активный день с физической нагрузкой", "very-active": "Очень высокая суммарная нагрузка" },
  training: { none: "Без регулярных тренировок", "regular-other": "Регулярные тренировки без силовых", "regular-strength": "Регулярные силовые тренировки" },
} as const;
const compatibilityCalculationOptions = {
  pregnancyOrLactation: { no: "Нет", yes: "Да", unknown: "Не знаю" },
  specialNutritionNeeds: { no: "Нет", yes: "Да", unknown: "Не знаю" },
  eatingOrUnderfuellingConcerns: { no: "Нет", yes: "Да", unknown: "Не знаю" },
} as const;

export function parseCalculationInputs(form: FormData): Result<CalculationInputs> {
  const errors: Record<string, string> = {};
  const text = (key: string) => String(form.get(key) ?? "").trim();
  function number(key: string, integer = false): number | null {
    const input = text(key);
    if (!input) return null;
    const value = Number(input.replace(",", "."));
    if (!/^(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(input) || !Number.isFinite(value)
      || (integer ? value < 0 || !Number.isSafeInteger(value) : value <= 0)) {
      errors[key] = integer ? "Введите целое число полных лет от 0." : "Введите положительное число, например 25 или 25,5.";
      return null;
    }
    return value;
  }
  function choice<T extends string>(key: string, labels: Record<T, string>): T | null {
    const input = text(key);
    if (!input) return null;
    if (Object.hasOwn(labels, input)) return input as T;
    errors[key] = "Выберите значение из списка.";
    return null;
  }
  const value: CalculationInputs = {
    ageYears: number("ageYears", true), heightCm: number("heightCm"), weightKg: number("weightKg"),
    goal: choice("goal", goalLabels),
    calculation: {
      sexForEquation: choice("sexForEquation", calculationOptions.sexForEquation),
      activity: choice("activity", calculationOptions.activity), training: choice("training", calculationOptions.training),
    },
  };
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value };
}

export function parseMemberForm(form: FormData, productIds: readonly string[]): MemberFormResult {
  const parameters = parseCalculationInputs(form);
  if (!parameters.ok) return parameters;
  const errors: Record<string, string> = {};
  const text = (key: string) => String(form.get(key) ?? "").trim();
  const displayName = text("displayName");
  if (!displayName) errors.displayName = "Укажите имя участника.";
  function subjects(prefix: string): FoodSubject[] {
    const ids = [...new Set(form.getAll(`${prefix}Products`).map(String))];
    if (ids.some((id) => !productIds.includes(id))) errors[`${prefix}Products`] = "Выберите продукт из каталога.";
    return [
      ...ids.map((productId): FoodSubject => ({ kind: "product", productId })),
      ...[...new Set(text(`${prefix}Descriptions`).split("\n").map((line) => line.trim()).filter(Boolean))]
        .map((label): FoodSubject => ({ kind: "description", label })),
    ];
  }
  const allergies = subjects("allergy");
  const exclusions = subjects("exclusion");
  const restrictions: FamilyMember["restrictions"] = form.has("restrictionsRecorded") || allergies.length || exclusions.length
    ? { status: "recorded", items: [
      ...allergies.map((subject) => ({ kind: "allergy" as const, subject })),
      ...exclusions.map((subject) => ({ kind: "exclusion" as const, subject })),
    ] }
    : { status: "not-specified" };
  const preferences = [
    ...subjects("like").map((subject) => ({ preference: "like" as const, subject })),
    ...subjects("dislike").map((subject) => ({ preference: "dislike" as const, subject })),
  ];
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value: {
    displayName, ...parameters.value, restrictions, preferences,
  } };
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function nonempty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
function optionalNumber(value: unknown, allowZero: boolean, integer = false) {
  return value === null || (typeof value === "number" && Number.isFinite(value)
    && (allowZero ? value >= 0 : value > 0) && (!integer || Number.isSafeInteger(value)));
}
function legacyTargets(value: unknown): value is DailyTargets {
  if (!record(value)) return false;
  return ["calories", "protein", "fat", "carbohydrates"].every((key) => {
    const target = value[key];
    return target === null || (record(target) && target.source === "manual" && target.value !== null
      && optionalNumber(target.value, key !== "calories"));
  });
}
function validDocument(value: unknown, productIds: readonly string[], version: 1 | 2): boolean {
  if (!record(value) || value.version !== version || !record(value.household)
    || !nonempty(value.household.id) || !nonempty(value.household.displayName) || !Array.isArray(value.members)) return false;
  const householdId = value.household.id;
  const ids = new Set<string>();
  function subject(value: unknown) {
    return record(value) && ((value.kind === "product" && typeof value.productId === "string" && productIds.includes(value.productId))
      || (value.kind === "description" && nonempty(value.label)));
  }
  return value.members.every((member: unknown) => {
    if (!record(member) || !nonempty(member.id) || ids.has(member.id) || member.householdId !== householdId
      || !nonempty(member.displayName) || !optionalNumber(member.ageYears, true, true)
      || !optionalNumber(member.heightCm, false) || !optionalNumber(member.weightKg, false)
      || !(member.goal === null || (typeof member.goal === "string" && Object.hasOwn(goalLabels, member.goal)))
      || !record(member.restrictions) || !Array.isArray(member.preferences)) return false;
    ids.add(member.id);
    if (version === 1) {
      if (!legacyTargets(member.dailyTargets)) return false;
    } else {
      const settings = member.calculation;
      if (!record(settings) || "dailyTargets" in member || !Object.entries(calculationOptions).every(([key, labels]) =>
        settings[key] === null || (typeof settings[key] === "string" && Object.hasOwn(labels, settings[key])))
        || !Object.entries(compatibilityCalculationOptions).every(([key, labels]) =>
          !Object.hasOwn(settings, key) || settings[key] === null
          || (typeof settings[key] === "string" && Object.hasOwn(labels, settings[key])))) return false;
      if (member.legacyDailyTargets !== undefined && !legacyTargets(member.legacyDailyTargets)) return false;
    }
    const restrictions = member.restrictions;
    if (!(restrictions.status === "not-specified" || (restrictions.status === "recorded" && Array.isArray(restrictions.items)
      && restrictions.items.every((item: unknown) => record(item) && (item.kind === "allergy" || item.kind === "exclusion") && subject(item.subject))))) return false;
    return member.preferences.every((item: unknown) => record(item) && (item.preference === "like" || item.preference === "dislike") && subject(item.subject));
  });
}
export function isFamilyStorageDocument(value: unknown, productIds: readonly string[]): value is FamilyStorageDocument {
  return validDocument(value, productIds, 2);
}
type LegacyDocument = { version: 1; household: Household; members: readonly (Omit<FamilyMember, "calculation" | "legacyDailyTargets"> & {dailyTargets: DailyTargets})[] };
function isLegacyDocument(value: unknown, productIds: readonly string[]): value is LegacyDocument {
  return validDocument(value, productIds, 1);
}
export function decodeFamilyDocument(value: unknown, productIds: readonly string[]): FamilyStorageDocument | null {
  if (isFamilyStorageDocument(value, productIds)) return value;
  if (!isLegacyDocument(value, productIds)) return null;
  return { version: 2, household: value.household, members: value.members.map(({dailyTargets, ...member}) => ({
    ...member, calculation: { ...emptyCalculationSettings }, legacyDailyTargets: dailyTargets,
  })) };
}
