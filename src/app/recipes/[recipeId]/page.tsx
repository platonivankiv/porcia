import "@/app/recipe-details.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { products, recipes } from "@/features/recipes/catalog";
import { RecipeDetails } from "@/features/recipes/recipe-details";

type Props = { params: Promise<{ recipeId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { recipeId } = await params;
  const recipe = recipes.find((item) => item.id === recipeId);
  return { title: recipe ? `${recipe.name} — Порция` : "Рецепт не найден — Порция" };
}

export default async function RecipePage({ params }: Props) {
  const { recipeId } = await params;
  const recipe = recipes.find((item) => item.id === recipeId);
  if (!recipe) notFound();
  return <RecipeDetails recipe={recipe} products={products} />;
}
