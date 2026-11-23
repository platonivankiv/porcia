export type NutritionGoal = "weight-loss" | "maintenance" | "muscle-gain" | "recomposition";
export type FoodSubject =
  | Readonly<{ kind: "product"; productId: string }>
  | Readonly<{ kind: "description"; label: string }>;
export type FoodRestriction = Readonly<{ kind: "allergy" | "exclusion"; subject: FoodSubject }>;
export type Restrictions =
  | Readonly<{ status: "not-specified" }>
  | Readonly<{ status: "recorded"; items: readonly FoodRestriction[] }>;
export type FoodPreference = Readonly<{ subject: FoodSubject; preference: "like" | "dislike" }>;
export type ManualTarget = Readonly<{ value: number; source: "manual" }>;
export type DailyTargets = Readonly<{
  calories: ManualTarget | null;
  protein: ManualTarget | null;
  fat: ManualTarget | null;
  carbohydrates: ManualTarget | null;
}>;
export type ApplicabilityAnswer = "yes" | "no" | "unknown" | null;
export type NutritionCalculationSettings = Readonly<{
  sexForEquation: "male" | "female" | null;
  activity: "inactive" | "low-active" | "active" | "very-active" | null;
  training: "none" | "regular-other" | "regular-strength" | null;
  // Compatibility data from POR-008; never displayed or used in calculations.
  pregnancyOrLactation?: ApplicabilityAnswer;
  specialNutritionNeeds?: ApplicabilityAnswer;
  eatingOrUnderfuellingConcerns?: ApplicabilityAnswer;
}>;
export const emptyCalculationSettings: NutritionCalculationSettings = {
  sexForEquation: null, activity: null, training: null,
};
export type FamilyMember = Readonly<{
  id: string;
  householdId: string;
  displayName: string;
  ageYears: number | null;
  heightCm: number | null;
  weightKg: number | null;
  goal: NutritionGoal | null;
  restrictions: Restrictions;
  preferences: readonly FoodPreference[];
  calculation: NutritionCalculationSettings;
  // Archive from POR-007, never an input to the automatic recommendation.
  legacyDailyTargets?: DailyTargets;
}>;
export type Household = Readonly<{ id: string; displayName: string }>;
export type FamilyStorageDocument = Readonly<{
  version: 2;
  household: Household;
  members: readonly FamilyMember[];
}>;
