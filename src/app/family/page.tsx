import "@/app/family.css";
import type { Metadata } from "next";
import { products } from "@/features/recipes/catalog";
import { RecipeHeader } from "@/features/recipes/recipe-ui";
import { FamilyProfiles } from "@/features/family/family-profiles";

export const metadata: Metadata = { title: "Семья — Порция", description: "Участники семьи и индивидуальные ориентиры питания." };

export default function FamilyPage() {
  return <div className="recipe-app family-app">
    <RecipeHeader section="family" />
    <main className="recipe-container recipe-main family-main" id="recipe-content">
      <FamilyProfiles products={products.map(({ id, name }) => ({ id, name }))} />
      <p className="family-credits">AI-иллюстрации · <a href="/family/CREDITS.md">Изображения и источники</a></p>
    </main>
  </div>;
}
