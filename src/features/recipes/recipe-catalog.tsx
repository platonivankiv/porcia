import Link from "next/link";
import { calculateRecipe } from "./calculate-recipe";
import type { Product, Recipe } from "./model";
import { formatAmount, RecipeHeader } from "./recipe-ui";

export function RecipeCatalog({ recipes, products }: { recipes: readonly Recipe[]; products: readonly Product[] }) {
  return (
    <div className="recipe-app">
      <RecipeHeader />
      <main className="recipe-container recipe-main" id="recipe-content">
        <div className="recipe-page-heading">
          <div><p className="recipe-eyebrow">Общий стол</p><h1>Каталог рецептов</h1></div>
          <p className="recipe-intro">Знакомые продукты, понятный состав.<br />Выберите блюдо и посмотрите, что понадобится для приготовления.</p>
        </div>
        {recipes.length === 0 ? (
          <section className="recipe-empty" aria-labelledby="empty-heading">
            <h2 id="empty-heading">Рецептов пока нет</h2>
            <p>Когда в каталоге появятся рецепты, они будут доступны здесь.</p>
          </section>
        ) : (
          <>
            <p className="recipe-catalog-count">Рецептов в каталоге: {recipes.length}</p>
            <ul className="recipe-card-grid">
              {recipes.map((recipe, index) => {
                const result = calculateRecipe(recipe, products);
                return (
                  <li key={recipe.id}>
                    <Link className="recipe-card" href={`/recipes/${recipe.id}`}>
                      <div className="recipe-card-top"><span>Завтрак</span><span className="recipe-card-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span></div>
                      <div className="recipe-card-content">
                        <div className="recipe-card-meta"><span>Базовых порций: {formatAmount(recipe.baseServings)}</span>{recipe.totalMinutes !== undefined && <span>≈ {recipe.totalMinutes} мин</span>}</div>
                        <h2>{recipe.name}</h2>
                        <p>{recipe.description}</p>
                        <div className="recipe-card-bottom">
                          <span>{result.ok ? <><strong>{formatAmount(result.perServing.calories)}</strong> ккал на порцию</> : "Расчёт КБЖУ недоступен"}</span>
                          <span className="recipe-card-action">Открыть рецепт <span aria-hidden="true">↗</span></span>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="recipe-catalog-note">КБЖУ рассчитаны по ингредиентам. Источники данных указаны в каждом рецепте.</p>
          </>
        )}
      </main>
    </div>
  );
}
