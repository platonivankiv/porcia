import type { FamilyMember } from "./model";

export const METHOD_VERSION = "porcia-eer2023-v1";
export type CalculationInputs = Pick<FamilyMember, "ageYears" | "heightCm" | "weightKg" | "goal" | "calculation">;
type Values = Readonly<{ calories: number; protein: number; fat: number; carbohydrates: number }>;
export type NutritionRecommendation =
  | Readonly<{ status: "unavailable"; reason: string }>
  | Readonly<{ status: "partial"; maintenanceCalories: number; calories: number | null; reason: string }>
  | Readonly<{ status: "complete"; maintenanceCalories: number; values: Values; proteinPerKg: number; energyFactor: number; warnings: readonly string[] }>;

// EER 2023, adults 19+: intercept, age, height (cm), weight (kg).
// https://www.canada.ca/en/health-canada/services/food-nutrition/healthy-eating/dietary-reference-intakes/tables/equations-estimate-energy-requirement.html
const equations = {
  male: {
    inactive: [753.07, -10.83, 6.50, 14.10],
    "low-active": [581.47, -10.83, 8.30, 14.94],
    active: [1004.82, -10.83, 6.52, 15.91],
    "very-active": [-517.88, -10.83, 15.61, 19.11],
  },
  female: {
    inactive: [584.90, -7.01, 5.72, 11.71],
    "low-active": [575.77, -7.01, 6.60, 12.14],
    active: [710.25, -7.01, 6.54, 12.34],
    "very-active": [511.83, -7.01, 9.07, 12.56],
  },
} as const;

export function calculateNutritionRecommendation(input: CalculationInputs): NutritionRecommendation {
  const { ageYears, heightCm, weightKg, calculation } = input;
  if (ageYears === null || heightCm === null || weightKg === null || !calculation.sexForEquation || !calculation.activity) {
    return { status: "unavailable", reason: "Для оценки энергии укажите возраст, рост, вес, половую категорию и общую активность." };
  }
  if (!Number.isSafeInteger(ageYears) || ageYears < 19) return { status: "unavailable", reason: "Взрослый расчёт EER доступен только с 19 лет. Для детей и подростков он не применяется." };
  if (![heightCm, weightKg].every((value) => Number.isFinite(value) && value > 0)) return { status: "unavailable", reason: "Проверьте рост и вес: нужны положительные конечные значения." };
  if ([calculation.pregnancyOrLactation, calculation.specialNutritionNeeds, calculation.eatingOrUnderfuellingConcerns].some((answer) => answer !== "no")) {
    return { status: "unavailable", reason: "Уточните применимость взрослого сценария. При беременности, лактации, особых потребностях в питании или сомнениях нужны индивидуальные ориентиры; обычный расчёт недоступен." };
  }
  const bmi = weightKg / ((heightCm / 100) ** 2);
  if (!Number.isFinite(bmi) || bmi <= 0) return { status: "unavailable", reason: "Соотношение роста и веса выходит за расчётный диапазон. Проверьте введённые параметры." };
  const [base, age, height, weight] = equations[calculation.sexForEquation][calculation.activity];
  const maintenanceCalories = base + age * ageYears + height * heightCm + weight * weightKg;
  if (!Number.isFinite(maintenanceCalories) || maintenanceCalories <= 0) return { status: "unavailable", reason: "Не удалось получить положительную конечную оценку энергии. Проверьте параметры." };
  const { goal } = input;
  const strength = calculation.training === "regular-strength";
  if (!goal || !calculation.training) return { status: "partial", maintenanceCalories, calories: null, reason: "Выберите цель и тренировочный контекст для расчёта КБЖУ." };
  if ((goal === "muscle-gain" || goal === "recomposition") && !strength) {
    return { status: "partial", maintenanceCalories, calories: null, reason: "Для рекомендации по набору мышц или рекомпозиции нужны регулярные силовые тренировки. Показана только оценка поддержания." };
  }
  const energyFactor = goal === "weight-loss" ? 0.90 : goal === "muscle-gain" ? 1.05 : 1;
  const calories = maintenanceCalories * energyFactor;
  if (!Number.isFinite(calories)) return { status: "partial", maintenanceCalories, calories: null, reason: "Целевая энергия выходит за числовой диапазон. Проверьте параметры профиля." };
  if (calories <= 1200) return { status: "partial", maintenanceCalories, calories: null, reason: "Целевая энергия 1200 ккал/день или ниже не предлагается обычным автоматическим расчётом. Нужен индивидуальный подход; показана только оценка поддержания, а не назначение питания." };
  if (goal === "weight-loss" && bmi < 18.5) return { status: "partial", maintenanceCalories, calories: null, reason: "При низком соотношении массы и роста автоматический дефицит не предлагается. Это ограничение расчёта, а не диагноз." };
  // Compare the boundary with machine precision; do not round BMI or nutrient calculations.
  if (bmi >= 30 || 30 - bmi <= 30 * Number.EPSILON * 2) return { status: "partial", maintenanceCalories, calories, reason: "При ИМТ от 30 белок по фактической массе автоматически не рассчитывается. Полное КБЖУ недоступно; поправка массы и нулевой белок не подставляются." };
  const proteinPerKg = goal === "weight-loss" ? (strength ? 1.8 : 1.4)
    : goal === "recomposition" ? 1.8 : calculation.training === "none" ? 1.2 : 1.6;
  const protein = proteinPerKg * weightKg;
  const fat = calories * 0.30 / 9;
  const carbohydrates = (calories - 4 * protein - 9 * fat) / 4;
  if (![protein, fat].every((value) => Number.isFinite(value) && value > 0) || !Number.isFinite(carbohydrates) || carbohydrates < 0) {
    return { status: "partial", maintenanceCalories, calories, reason: "При выбранных параметрах распределение БЖУ невозможно: белок и жиры превышают доступную энергию либо результат выходит за числовой диапазон." };
  }
  const warnings: string[] = [];
  const proteinShare = 4 * protein / calories;
  const carbohydrateShare = 4 * carbohydrates / calories;
  if (proteinShare < 0.10 || proteinShare > 0.35) warnings.push("Доля белка вне общего справочного диапазона 10–35% энергии. Значения автоматически не изменены.");
  if (carbohydrateShare < 0.45 || carbohydrateShare > 0.65) warnings.push("Доля углеводов вне общего справочного диапазона 45–65% энергии. Это пояснение, а не ошибка расчёта; белок и жиры не уменьшены.");
  return { status: "complete", maintenanceCalories, values: { calories, protein, fat, carbohydrates }, proteinPerKg, energyFactor, warnings };
}
