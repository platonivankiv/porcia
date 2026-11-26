import type { ProductState } from "../recipes/model";

export type MealPlanItem =
  | Readonly<{ id: string; kind: "recipe"; recipeId: string }>
  | Readonly<{ id: string; kind: "product"; productId: string; state: ProductState }>;

export type TemplateMeal = Readonly<{
  id: string;
  label: string;
  items: readonly MealPlanItem[];
}>;

export type MealPlanDay = Readonly<{
  id: string;
  meals: readonly TemplateMeal[];
}>;

export type MealPlanTemplate = Readonly<{
  id: string;
  name: string;
  description: string;
  days: readonly MealPlanDay[];
}>;
