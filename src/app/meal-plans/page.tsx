import type { Metadata } from "next";
import { mealPlanTemplates } from "@/features/meal-plans/catalog";
import { MealPlanCatalog } from "@/features/meal-plans/meal-plan-catalog";
import { products, recipes } from "@/features/recipes/catalog";

export const metadata: Metadata = {
  title: "Готовые рационы — Порция",
  description: "Готовые меню домашних блюд на несколько дней с переходами к рецептам.",
};

export default function MealPlansPage() {
  return <MealPlanCatalog templates={mealPlanTemplates} recipes={recipes} products={products} />;
}
