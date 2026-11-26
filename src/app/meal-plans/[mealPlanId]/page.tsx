import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { mealPlanTemplates } from "@/features/meal-plans/catalog";
import { MealPlanDetails } from "@/features/meal-plans/meal-plan-details";
import { isMealPlanTemplate } from "@/features/meal-plans/validation";
import { products, recipes } from "@/features/recipes/catalog";

type Props = { params: Promise<{ mealPlanId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mealPlanId } = await params;
  const template = mealPlanTemplates.find((item) => item.id === mealPlanId);
  return { title: template && isMealPlanTemplate(template, recipes, products) ? `${template.name} — Порция` : "Рацион недоступен — Порция" };
}

export default async function MealPlanPage({ params }: Props) {
  const { mealPlanId } = await params;
  const template = mealPlanTemplates.find((item) => item.id === mealPlanId);
  if (!template) notFound();
  return <MealPlanDetails template={template} recipes={recipes} products={products} />;
}
