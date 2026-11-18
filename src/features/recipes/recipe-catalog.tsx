import Link from "next/link";
import { calculateRecipe } from "./calculate-recipe";
import type { Product, Recipe } from "./model";
import { RecipePhoto } from "./recipe-photo";
import { formatAmount, ImageCredits, RecipeHeader, recipeCategoryLabel } from "./recipe-ui";

export function RecipeCatalog({ recipes, products }: { recipes: readonly Recipe[]; products: readonly Product[] }) {
  const categories = [...new Set(recipes.map((recipe) => recipe.category))];
  return (
    <div className="recipe-app">
      <RecipeHeader />
      <main className="recipe-container recipe-main" id="recipe-content">
        <div className="recipe-page-heading">
          <p className="recipe-eyebrow">Для общего стола</p>
          <h1>Рецепты для семьи</h1>
          <p className="recipe-intro">Выберите блюдо для семьи. Ингредиенты, порции и пищевая ценность — уже в рецепте.</p>
        </div>
        {recipes.length === 0 ? (
          <section className="recipe-empty" aria-labelledby="empty-heading">
            <h2 id="empty-heading">Рецептов пока нет</h2>
            <p>Когда в каталоге появятся рецепты, они будут доступны здесь.</p>
          </section>
        ) : categories.map((category) => (
          <section className="recipe-category" key={category ?? "other"} aria-labelledby={`category-${category ?? "other"}`}>
            <div className="recipe-section-heading">
              <h2 id={`category-${category ?? "other"}`}>{recipeCategoryLabel(category)}</h2>
              <span>Рецептов: {recipes.filter((recipe) => recipe.category === category).length}</span>
            </div>
            <ul className="recipe-card-grid">
              {recipes.filter((recipe) => recipe.category === category).map((recipe, index) => {
                const result = calculateRecipe(recipe, products);
                return (
                  <li key={recipe.id}>
                    <Link className="recipe-card" href={`/recipes/${recipe.id}`}>
                      <RecipePhoto
                        image={recipe.image}
                        priority={index === 0}
                        sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 1099px) 50vw, (max-width: 1224px) 33vw, 373px"
                      />
                      <div className="recipe-card-content">
                        <h3>{recipe.name}</h3>
                        <p>{recipe.description}</p>
                        <div className="recipe-card-meta">
                          {recipe.totalMinutes !== undefined && <span>≈ {recipe.totalMinutes} мин</span>}
                          <span>Порций: {formatAmount(recipe.baseServings)}</span>
                        </div>
                        <div className="recipe-card-bottom">
                          <span>{result.ok ? <><strong>{formatAmount(result.perServing.calories)}</strong> ккал / порция</> : "Расчёт КБЖУ недоступен"}</span>
                          <span className="recipe-card-action">Смотреть рецепт <span aria-hidden="true">→</span></span>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </main>
      {recipes.some((recipe) => recipe.image?.origin === "ai") && <ImageCredits />}
    </div>
  );
}
