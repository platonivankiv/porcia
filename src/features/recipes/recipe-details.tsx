import styles from "./recipe-details.module.scss";
import Link from "next/link";
import type { Allergen, Product, Recipe } from "./model";
import { RecipePhoto } from "./recipe-photo";
import { ImageCredits, RecipeHeader } from "./recipe-ui";
import { formatServings } from "./recipe-format";
import { RecipePortions } from "./recipe-portions";
import { FamilyRecipePortions } from "./family-recipe-portions";

const categoryLabels = { breakfast: "Завтрак", lunch: "Обед", dinner: "Ужин", snack: "Перекус" } as const;
const heroTones: Record<string, string> = { "banana-porridge": "green", "banana-yoghurt": "lavender", "chicken-rice-vegetables": "coral" };

const allergenLabels: Record<Allergen, string> = { milk: "Молоко", walnut: "Грецкие орехи" };

export function RecipeDetails({ recipe, products }: { recipe: Recipe; products: readonly Product[] }) {
  const productIds = new Set(recipe.components.flatMap((component) => component.ingredients.map((ingredient) => ingredient.productId)));
  const recipeProducts = products.filter((product) => productIds.has(product.id));
  const allergens = [...new Set(recipeProducts.flatMap((product) => product.allergens ?? []))];
  return (
    <div className={styles.detailApp}>
      <RecipeHeader />
      <main className={styles.container + " " + styles.main} id="recipe-content">
        <Link className={styles.back} href="/recipes"><span aria-hidden="true">←</span> Все рецепты</Link>
        <RecipePortions key={recipe.id} recipe={recipe} products={recipeProducts}
          tone={heroTones[recipe.id] ?? "green"}
          hero={<>
            <div className={styles.detailHeading}>
              <div className={styles.detailMeta}>
                <span className={styles.detailCategory}>{recipe.category ? categoryLabels[recipe.category] : "Рецепт"}</span>
              </div>
              <h1>{recipe.name}</h1>
              <p className={styles.intro}>{recipe.description}</p>
              {(recipe.totalMinutes !== undefined || recipe.activeMinutes !== undefined) && <div className={styles.timeChips}>
                {recipe.totalMinutes !== undefined && <span>Всего ≈ {recipe.totalMinutes} мин</span>}
                {recipe.activeMinutes !== undefined && <span>Активная готовка ≈ {recipe.activeMinutes} мин</span>}
              </div>}
            </div>
            <div className={styles.detailArt}><RecipePhoto className={styles.photo} imageClassName={styles.photoImage} image={recipe.image} priority
              sizes="(max-width: 760px) calc(100vw - 96px), (max-width: 1150px) 35vw, 500px" />
            </div>
          </>}
          calculationNotes={<p className={styles.detailTime}>
            {recipe.activeMinutes !== undefined && <>Активная готовка ≈ {recipe.activeMinutes} мин · </>}
            Базовых порций: {formatServings(recipe.baseServings)}.
            {(recipe.totalMinutes !== undefined || recipe.activeMinutes !== undefined) && <> Время — оценка для базового объёма; при изменении порций оно может отличаться.</>}
          </p>}
          allergens={<aside className={styles.detailAllergens} aria-label="Аллергены">
            <p><strong>{allergens.length > 0 ? `Известные аллергены: ${allergens.map((allergen) => allergenLabels[allergen]).join(", ")}.` : "Известные аллергены в справочнике не указаны."}</strong></p>
            <p>Список не подтверждает отсутствие других аллергенов. Проверяйте состав и предупреждения на упаковке.</p>
          </aside>}>
          <section className={styles.preparation} aria-labelledby="steps-heading">
            <h2 id="steps-heading">Как приготовить</h2>
            <ol className={styles.steps}>
              {recipe.steps.map((step, index) => <li key={index}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}
            </ol>
            {recipe.safetyNote && <aside className={styles.safety} aria-labelledby="safety-heading">
              <h3 id="safety-heading">Безопасное приготовление</h3>
              <p>{recipe.safetyNote}</p>
            </aside>}
          </section>
        </RecipePortions>
        <details className={styles.familyDetails}>
          <summary><span>Ручные порции семьи <small>Вспомогательный расчёт</small></span><span aria-hidden="true">＋</span></summary>
          <FamilyRecipePortions key={`family-${recipe.id}`} recipe={recipe} products={products} />
        </details>
      </main>
      {recipe.image?.origin === "ai" && <ImageCredits className={styles.footer} />}
    </div>
  );
}
