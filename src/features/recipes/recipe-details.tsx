import Link from "next/link";
import type { Allergen, Product, Recipe } from "./model";
import { RecipePhoto } from "./recipe-photo";
import { ImageCredits, RecipeHeader } from "./recipe-ui";
import { formatServings, recipeCategoryLabel } from "./recipe-format";
import { RecipePortions } from "./recipe-portions";
import { FamilyRecipePortions } from "./family-recipe-portions";

const allergenLabels: Record<Allergen, string> = { milk: "Молоко", walnut: "Грецкие орехи" };

export function RecipeDetails({ recipe, products }: { recipe: Recipe; products: readonly Product[] }) {
  const productIds = new Set(recipe.components.flatMap((component) => component.ingredients.map((ingredient) => ingredient.productId)));
  const recipeProducts = products.filter((product) => productIds.has(product.id));
  const allergens = [...new Set(recipeProducts.flatMap((product) => product.allergens ?? []))];
  return (
    <div className="recipe-app">
      <RecipeHeader />
      <main className="recipe-container recipe-main" id="recipe-content">
        <Link className="recipe-back" href="/recipes"><span aria-hidden="true">←</span> Все рецепты</Link>
        <div className="recipe-hero">
          <RecipePhoto image={recipe.image} priority />
          <div className="recipe-detail-heading">
            <p className="recipe-eyebrow">{recipeCategoryLabel(recipe.category)}</p>
            <h1>{recipe.name}</h1>
            <p className="recipe-intro">{recipe.description}</p>
            <dl className="recipe-detail-meta">
              {recipe.totalMinutes !== undefined && <div><dt>Общее время</dt><dd>≈ {recipe.totalMinutes} мин</dd></div>}
              {recipe.activeMinutes !== undefined && <div><dt>Активная готовка</dt><dd>≈ {recipe.activeMinutes} мин</dd></div>}
              <div><dt>Базовых порций</dt><dd>{formatServings(recipe.baseServings)}</dd></div>
            </dl>
            <p className="recipe-small">Время — оценка для базового объёма; при изменении порций оно может отличаться.</p>
            {allergens.length > 0 && <div className="recipe-small">
              <p><strong>Известные аллергены:</strong> {allergens.map((allergen) => allergenLabels[allergen]).join(", ")}.</p>
              <p>Список не подтверждает отсутствие других аллергенов. Проверяйте состав и предупреждения на упаковке.</p>
            </div>}
            {recipe.image?.origin === "ai" && <p className="recipe-small recipe-ai-label">AI-иллюстрация блюда</p>}
          </div>
        </div>
        <RecipePortions key={recipe.id} recipe={recipe} products={recipeProducts}>
          <section className="recipe-preparation" aria-labelledby="steps-heading">
            <h2 id="steps-heading">Как приготовить</h2>
            <ol className="recipe-steps">
              {recipe.steps.map((step, index) => <li key={index}><span aria-hidden="true">{index + 1}</span><p>{step}</p></li>)}
            </ol>
            {recipe.safetyNote && <aside className="recipe-small" aria-labelledby="safety-heading">
              <h3 id="safety-heading">Безопасное приготовление</h3>
              <p>{recipe.safetyNote}</p>
            </aside>}
          </section>
        </RecipePortions>
        <FamilyRecipePortions key={`family-${recipe.id}`} recipe={recipe} products={products} />
      </main>
      {recipe.image?.origin === "ai" && <ImageCredits />}
    </div>
  );
}
