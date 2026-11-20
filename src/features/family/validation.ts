import type { FamilyMember, NutritionGoal, FoodSubject } from "./model";

type MemberValues = Omit<FamilyMember, "id" | "householdId">;
export type MemberFormResult =
  | { ok: true; value: MemberValues }
  | { ok: false; errors: Record<string, string> };

export const goalLabels: Record<NutritionGoal, string> = {
  "weight-loss": "Похудение", maintenance: "Поддержание", "muscle-gain": "Набор массы", recomposition: "Рекомпозиция",
};

export function parseMemberForm(form: FormData, productIds: readonly string[]): MemberFormResult {
  const errors: Record<string, string> = {};
  const text = (key: string) => String(form.get(key) ?? "").trim();
  const displayName = text("displayName");
  if (!displayName) errors.displayName = "Укажите имя участника.";
  function number(key: string, allowZero: boolean, integer = false): number | null {
    const input = text(key);
    if (!input) return null;
    const value = Number(input.replace(",", "."));
    if (!/^(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(input) || !Number.isFinite(value)
      || (allowZero ? value < 0 : value <= 0) || (integer && !Number.isSafeInteger(value))) {
      errors[key] = integer ? "Введите целое число полных лет от 0." : `Введите ${allowZero ? "неотрицательное" : "положительное"} число, например 25 или 25,5.`;
      return null;
    }
    return value;
  }
  const ageYears = number("ageYears", true, true);
  const heightCm = number("heightCm", false);
  const weightKg = number("weightKg", false);
  const goalInput = text("goal");
  const goal = Object.hasOwn(goalLabels, goalInput) ? goalInput as NutritionGoal : null;
  if (goalInput && !goal) errors.goal = "Выберите цель из списка.";
  function target(key: string) {
    const value = number(key, key !== "calories");
    return value === null ? null : { value, source: "manual" as const };
  }
  const dailyTargets = { calories: target("calories"), protein: target("protein"), fat: target("fat"), carbohydrates: target("carbohydrates") };
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
    displayName, ageYears, heightCm, weightKg, goal,
    restrictions, preferences, dailyTargets,
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

/** Checks the persisted boundary, including household membership and product references. */
export function isFamilyStorageDocument(value: unknown, productIds: readonly string[]): value is import("./model").FamilyStorageDocument {
  if (!record(value) || value.version !== 1 || !record(value.household)
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
      || !record(member.dailyTargets) || !record(member.restrictions) || !Array.isArray(member.preferences)) return false;
    ids.add(member.id);
    const targets = member.dailyTargets;
    if (!["calories", "protein", "fat", "carbohydrates"].every((key) => {
      const target = targets[key];
      return target === null || (record(target) && target.source === "manual" && target.value !== null
        && optionalNumber(target.value, key !== "calories"));
    })) return false;
    const restrictions = member.restrictions;
    if (!(restrictions.status === "not-specified" || (restrictions.status === "recorded" && Array.isArray(restrictions.items)
      && restrictions.items.every((item: unknown) => record(item) && (item.kind === "allergy" || item.kind === "exclusion") && subject(item.subject))))) return false;
    return member.preferences.every((item: unknown) => record(item) && (item.preference === "like" || item.preference === "dislike") && subject(item.subject));
  });
}
