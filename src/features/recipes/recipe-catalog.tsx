import Link from "next/link";
import { calculateRecipe } from "./calculate-recipe";
import type { Product, Recipe } from "./model";
import { RecipePhoto } from "./recipe-photo";
import { ImageCredits, RecipeHeader } from "./recipe-ui";
import { formatAmount, formatServings } from "./recipe-format";

const mealLabels = {
  breakfast: ["Завтрак", "завтрак", "завтрака", "завтраков"],
  lunch: ["Обед", "обед", "обеда", "обедов"],
  dinner: ["Ужин", "ужин", "ужина", "ужинов"],
  snack: ["Перекус", "перекус", "перекуса", "перекусов"],
} as const;
const pluralRules = new Intl.PluralRules("ru-RU");

export function RecipeCatalog({ recipes, products }: { recipes: readonly Recipe[]; products: readonly Product[] }) {
  const categories = [...new Set(recipes.map((recipe) => recipe.category))];
  const summary = categories.flatMap((category) => {
    if (!category) return [];
    const count = recipes.filter((recipe) => recipe.category === category).length;
    const form = pluralRules.select(count);
    const label = mealLabels[category][form === "one" ? 1 : form === "few" ? 2 : 3];
    return [`${count} ${label}`];
  }).join(" · ");

  return (
    <div className="recipe-app recipe-catalog-app">
      <RecipeHeader />
      <main className="recipe-container recipe-main catalog-main" id="recipe-content">
        <div className="catalog-heading">
          <div>
            <p className="catalog-eyebrow">Вкусная общая еда</p>
            <h1>Рецепты<br />для семьи</h1>
          </div>
          <p className="catalog-intro">{recipes.length === 3 ? <>Три блюда.<br /></> : null}Ингредиенты и КБЖУ внутри.</p>
        </div>
        {recipes.length === 0 ? (
          <section className="recipe-empty" aria-labelledby="empty-heading">
            <h2 id="empty-heading">Рецептов пока нет</h2>
            <p>Когда в каталоге появятся рецепты, они будут доступны здесь.</p>
          </section>
        ) : (
          <>
            <div className="catalog-summary">
              <h2>Все рецепты <span>{String(recipes.length).padStart(2, "0")}</span></h2>
              <p>{summary}</p>
            </div>
            <ul className="catalog-grid">
              {recipes.map((recipe, index) => {
                const result = calculateRecipe(recipe, products);
                return (
                  <li key={recipe.id}>
                    <Link className="catalog-card" href={`/recipes/${recipe.id}`}>
                      <div className="catalog-card-meta">
                        <span className="catalog-meal">{recipe.category ? mealLabels[recipe.category][0] : "Рецепт"}</span>
                        {recipe.totalMinutes !== undefined && <span className="catalog-time"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 2" /></svg>≈ {recipe.totalMinutes} мин</span>}
                      </div>
                      <RecipePhoto image={recipe.image} priority={index === 0} sizes="(max-width: 760px) 160px, (max-width: 1150px) 350px, 340px" />
                      <h3>{recipe.name}</h3>
                      <span className="sr-only">Базовый объём рецепта. Порций: {formatServings(recipe.baseServings)}.</span>
                      <div className="catalog-card-bottom">
                        <div>{result.ok ? <><strong>{formatAmount(result.perServing.calories)}</strong> ккал<span>на 1 базовую порцию</span></> : <span className="catalog-data-error">Расчёт КБЖУ недоступен</span>}</div>
                        <span className="catalog-card-arrow" aria-hidden="true">↗</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </main>
      <div className="catalog-footer">
        {recipes.some((recipe) => recipe.image?.origin === "ai") && <ImageCredits />}
        <p>Время — оценка для базового объёма.</p>
      </div>
    </div>
  );
}
