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
  dailyTargets: DailyTargets;
}>;
export type Household = Readonly<{ id: string; displayName: string }>;
export type FamilyStorageDocument = Readonly<{
  version: 1;
  household: Household;
  members: readonly FamilyMember[];
}>;
