import Link from "next/link";
import { calculateRecipe } from "./calculate-recipe";
import type { Product, Recipe } from "./model";
import { RecipePhoto } from "./recipe-photo";
import { formatAmount, formatIngredientQuantity, ImageCredits, NutritionFacts, RecipeHeader, recipeCategoryLabel, stateLabels } from "./recipe-ui";

export function RecipeDetails({ recipe, products }: { recipe: Recipe; products: readonly Product[] }) {
  const result = calculateRecipe(recipe, products);
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
              <div><dt>Порций</dt><dd>{formatAmount(recipe.baseServings)}</dd></div>
            </dl>
            <p className="recipe-small">Время приготовления указано ориентировочно.</p>
            {recipe.image?.origin === "ai" && <p className="recipe-small recipe-ai-label">AI-иллюстрация блюда</p>}
          </div>
        </div>
        {!result.ok ? (
          <section className="recipe-empty recipe-data-error" aria-labelledby="data-error-heading">
            <h2 id="data-error-heading">Расчёт недоступен</h2>
            <p>{result.reason}</p>
            <p>Полные КБЖУ нельзя показать, пока исходные данные не исправлены.</p>
          </section>
        ) : (
          <>
            <section className="recipe-nutrition" aria-labelledby="nutrition-heading">
              <div><h2 id="nutrition-heading">На одну порцию</h2><p className="recipe-small">Расчётная оценка по ингредиентам</p></div>
              <NutritionFacts value={result.perServing} label="КБЖУ одной порции" />
            </section>
            <div className="recipe-detail-grid">
              <section className="recipe-ingredients" aria-labelledby="ingredients-heading">
                <div className="recipe-section-heading"><h2 id="ingredients-heading">Ингредиенты</h2><span>Порций: {formatAmount(recipe.baseServings)}</span></div>
                {result.components.map(({ component, ingredients }) => (
                  <div key={component.id}>
                    {result.components.length > 1 && <h3>{component.name}</h3>}
                    <ul className="recipe-ingredient-list">
                      {ingredients.map(({ ingredient, product }, index) => (
                        <li key={`${product.id}-${index}`}><span>{product.name}</span><strong>{formatIngredientQuantity(ingredient, product)}</strong></li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
              <section className="recipe-preparation" aria-labelledby="steps-heading">
                <h2 id="steps-heading">Как приготовить</h2>
                <ol className="recipe-steps">
                  {recipe.steps.map((step, index) => <li key={index}><span aria-hidden="true">{index + 1}</span><p>{step}</p></li>)}
                </ol>
              </section>
            </div>
            <details className="recipe-calculation-details">
              <summary>Расчёт и источники <span aria-hidden="true">+</span></summary>
              <div className="recipe-calculation-content">
                <h2>КБЖУ всего рецепта</h2>
                <NutritionFacts value={result.total} label="КБЖУ всего рецепта" />
                <h3>Выход готового блюда</h3>
                {result.expectedYieldGrams === null ? (
                  <p>Без данных о выходе КБЖУ на 100 г готового блюда недоступны. КБЖУ рецепта и порции рассчитаны по ингредиентам.</p>
                ) : (
                  <p>Ожидаемый выход: {formatAmount(result.expectedYieldGrams)} г.
                    {result.per100g && <> На 100 г готового блюда: {formatAmount(result.per100g.calories)} ккал · Б {formatAmount(result.per100g.protein)} г · Ж {formatAmount(result.per100g.fat)} г · У {formatAmount(result.per100g.carbohydrates)} г.</>}
                  </p>
                )}
                <h3>Методика расчёта</h3>
                <p>КБЖУ рассчитаны по массе исходных ингредиентов и соответствующим их состоянию профилям на 100 г. Потери нутриентов при приготовлении не учитываются. Значения округлены только для отображения. Штучные продукты рассчитаны по среднему размеру. Средние массы и плотность — бытовые оценки.</p>
                <h3>Источники пищевой ценности и переводов единиц</h3>
                <ul className="recipe-source-list">
                  {result.components.flatMap(({ component, ingredients }) => ingredients.map(({ ingredient, product, profile, grams }, index) => {
                    const conversion = product.gramsPerUnit?.find((item) => item.state === ingredient.state && item.unit === ingredient.unit);
                    return (
                      <li key={`${component.id}-${product.id}-${index}`}>
                        <h4>{product.name}</h4>
                        <p>{stateLabels[profile.state]} · Расчётная масса: {formatAmount(grams)} г</p>
                        <p>На 100 г продукта: {formatAmount(profile.per100g.calories)} ккал · Б {formatAmount(profile.per100g.protein)} г · Ж {formatAmount(profile.per100g.fat)} г · У {formatAmount(profile.per100g.carbohydrates)} г</p>
                        <p><a href={profile.source.url}>{profile.source.title}</a> · Запись {profile.source.recordId} · Проверено: <time dateTime={profile.source.checkedAt}>{profile.source.checkedAt}</time></p>
                        {conversion?.source && <div className="recipe-conversion-source"><p>{conversion.source.note}</p><p><a href={conversion.source.url}>{conversion.source.title}</a> · Проверено: <time dateTime={conversion.source.checkedAt}>{conversion.source.checkedAt}</time></p></div>}
                      </li>
                    );
                  }))}
                </ul>
              </div>
            </details>
          </>
        )}
      </main>
      {recipe.image?.origin === "ai" && <ImageCredits />}
    </div>
  );
}
