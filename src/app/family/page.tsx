import styles from "../../features/family/family-profiles.module.scss";
import type { Metadata } from "next";
import { products } from "@/features/recipes/catalog";
import { RecipeHeader } from "@/features/recipes/recipe-ui";
import { FamilyProfiles } from "@/features/family/family-profiles";

export const metadata: Metadata = { title: "Семья — Порция", description: "Участники семьи и индивидуальные ориентиры питания." };

export default function FamilyPage() {
  return <div className={styles.app}>
    <RecipeHeader section="family" />
    <main className={styles.main} id="recipe-content">
      <FamilyProfiles products={products.map(({ id, name }) => ({ id, name }))} />
      <p className={styles.credits}>AI-иллюстрации · <a href="/family/CREDITS.md">Изображения и источники</a></p>
    </main>
  </div>;
}
