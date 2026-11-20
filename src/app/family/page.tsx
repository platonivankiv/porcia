import type { Metadata } from "next";
import { products } from "@/features/recipes/catalog";
import { RecipeHeader } from "@/features/recipes/recipe-ui";
import { FamilyProfiles } from "@/features/family/family-profiles";

export const metadata: Metadata = { title: "Семья — Порция", description: "Участники семьи и индивидуальные ориентиры питания." };

export default function FamilyPage() {
  return <div className="recipe-app">
    <RecipeHeader section="family" />
    <main className="recipe-container recipe-main family-main" id="recipe-content">
      <div className="recipe-page-heading">
        <p className="recipe-eyebrow">Для общего стола</p>
        <h1>Ваша семья</h1>
        <p className="recipe-intro">У каждого — свои цели и предпочтения. Соберите их здесь, чтобы подготовиться к общему планированию питания.</p>
      </div>
      <aside className="family-local-note" aria-label="Хранение данных">
        <p>Временный прототип: используйте вымышленные данные. Профили хранятся только в этом браузере и могут исчезнуть при очистке его данных. Доступа с других устройств нет.</p>
      </aside>
      <FamilyProfiles products={products.map(({ id, name }) => ({ id, name }))} />
    </main>
  </div>;
}
