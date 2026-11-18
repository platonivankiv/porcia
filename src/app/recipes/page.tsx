import type { Metadata } from "next";
import { products, recipes } from "@/features/recipes/catalog";
import { RecipeCatalog } from "@/features/recipes/recipe-catalog";

export const metadata: Metadata = { title: "Рецепты — Порция", description: "Каталог рецептов с ингредиентами, способом приготовления и расчётными КБЖУ." };

export default function RecipesPage() {
  return <RecipeCatalog recipes={recipes} products={products} />;
}
