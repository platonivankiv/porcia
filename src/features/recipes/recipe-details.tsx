import Link from "next/link";
import type { Product, Recipe } from "./model";
import { RecipePhoto } from "./recipe-photo";
import { ImageCredits, RecipeHeader } from "./recipe-ui";
import { formatServings, recipeCategoryLabel } from "./recipe-format";
import { RecipePortions } from "./recipe-portions";

export function RecipeDetails({ recipe, products }: { recipe: Recipe; products: readonly Product[] }) {
  const productIds = new Set(recipe.components.flatMap((component) => component.ingredients.map((ingredient) => ingredient.productId)));
  const recipeProducts = products.filter((product) => productIds.has(product.id));
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
            {recipe.image?.origin === "ai" && <p className="recipe-small recipe-ai-label">AI-иллюстрация блюда</p>}
          </div>
        </div>
        <RecipePortions key={recipe.id} recipe={recipe} products={recipeProducts}>
          <section className="recipe-preparation" aria-labelledby="steps-heading">
            <h2 id="steps-heading">Как приготовить</h2>
            <ol className="recipe-steps">
              {recipe.steps.map((step, index) => <li key={index}><span aria-hidden="true">{index + 1}</span><p>{step}</p></li>)}
            </ol>
          </section>
        </RecipePortions>
      </main>
      {recipe.image?.origin === "ai" && <ImageCredits />}
    </div>
  );
}
