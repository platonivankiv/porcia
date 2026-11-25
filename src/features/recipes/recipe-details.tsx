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
    <div className="recipe-app recipe-detail-app">
      <RecipeHeader />
      <main className="recipe-container recipe-main" id="recipe-content">
        <Link className="recipe-back" href="/recipes"><span aria-hidden="true">←</span> Все рецепты</Link>
        <RecipePortions key={recipe.id} recipe={recipe} products={recipeProducts}
          tone={heroTones[recipe.id] ?? "green"}
          hero={<>
            <div className="recipe-detail-heading">
              <div className="recipe-detail-meta">
                <span className="recipe-detail-category">{recipe.category ? categoryLabels[recipe.category] : "Рецепт"}</span>
                {recipe.totalMinutes !== undefined && <span>◷ ≈ {recipe.totalMinutes} мин</span>}
              </div>
              <h1>{recipe.name}</h1>
              <p className="recipe-intro">{recipe.description}</p>
              <p className="recipe-detail-time">
                {recipe.activeMinutes !== undefined && <>Активная готовка ≈ {recipe.activeMinutes} мин · </>}
                Базовых порций: {formatServings(recipe.baseServings)}.
                {(recipe.totalMinutes !== undefined || recipe.activeMinutes !== undefined) && <> Время — оценка для базового объёма; при изменении порций оно может отличаться.</>}
              </p>
            </div>
            <div className="recipe-detail-art"><RecipePhoto image={recipe.image} priority
              sizes="(max-width: 760px) calc(100vw - 96px), (max-width: 1150px) 35vw, 500px" />
              {recipe.image?.origin === "ai" && <span className="recipe-detail-image-note">AI-иллюстрация блюда</span>}
            </div>
          </>}
          allergens={<aside className="recipe-detail-allergens" aria-label="Аллергены">
            <p><strong>{allergens.length > 0 ? `Известные аллергены: ${allergens.map((allergen) => allergenLabels[allergen]).join(", ")}.` : "Известные аллергены в справочнике не указаны."}</strong></p>
            <p>Список не подтверждает отсутствие других аллергенов. Проверяйте состав и предупреждения на упаковке.</p>
          </aside>}>
          <section className="recipe-preparation" aria-labelledby="steps-heading">
            <h2 id="steps-heading">Как приготовить</h2>
            <ol className="recipe-steps">
              {recipe.steps.map((step, index) => <li key={index}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}
            </ol>
            {recipe.safetyNote && <aside className="recipe-safety" aria-labelledby="safety-heading">
              <h3 id="safety-heading">Безопасное приготовление</h3>
              <p>{recipe.safetyNote}</p>
            </aside>}
          </section>
        </RecipePortions>
        <details className="recipe-family-details">
          <summary><span>Ручные порции семьи <small>Вспомогательный расчёт</small></span><span aria-hidden="true">＋</span></summary>
          <FamilyRecipePortions key={`family-${recipe.id}`} recipe={recipe} products={products} />
        </details>
      </main>
      {recipe.image?.origin === "ai" && <ImageCredits />}
    </div>
  );
}
