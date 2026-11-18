import Link from "next/link";
import { calculateRecipe } from "./calculate-recipe";
import type { Product, Recipe } from "./model";
import { formatAmount, NutritionFacts, RecipeHeader, stateLabels } from "./recipe-ui";

const unitLabels = { g: "г", ml: "мл", piece: "шт." };

export function RecipeDetails({ recipe, products }: { recipe: Recipe; products: readonly Product[] }) {
  const result = calculateRecipe(recipe, products);
  return (
    <div className="recipe-app">
      <RecipeHeader />
      <main className="recipe-container recipe-main" id="recipe-content">
        <Link className="recipe-back" href="/recipes"><span aria-hidden="true">←</span> Все рецепты</Link>
        <div className="recipe-detail-heading">
          <p className="recipe-eyebrow">Завтрак для общего стола</p>
          <h1>{recipe.name}</h1>
          <p className="recipe-intro">{recipe.description}</p>
          <div className="recipe-detail-meta">
            <span>Базовых порций: <strong>{formatAmount(recipe.baseServings)}</strong></span>
            {recipe.activeMinutes !== undefined && <span>Активное время: <strong>≈ {recipe.activeMinutes} мин</strong></span>}
            {recipe.totalMinutes !== undefined && <span>Общее время: <strong>≈ {recipe.totalMinutes} мин</strong></span>}
          </div>
          {(recipe.activeMinutes !== undefined || recipe.totalMinutes !== undefined) && <p className="recipe-small">Время — ориентировочная оценка для этого объёма.</p>}
        </div>
        {!result.ok ? (
          <section className="recipe-empty recipe-data-error" aria-labelledby="data-error-heading">
            <h2 id="data-error-heading">Расчёт недоступен</h2>
            <p>{result.reason}</p>
            <p>Полные КБЖУ нельзя показать, пока исходные данные не исправлены.</p>
          </section>
        ) : (
          <>
            <div className="recipe-detail-grid">
              <aside className="recipe-summary" aria-labelledby="nutrition-heading">
                <p className="recipe-eyebrow">Пищевая ценность</p>
                <h2 id="nutrition-heading">Что в порции</h2>
                <NutritionFacts total={result.total} perServing={result.perServing} />
                <div className="recipe-yield">
                  <h3>Ожидаемый выход</h3>
                  <p>{result.expectedYieldGrams === null ? "Не указан" : `${formatAmount(result.expectedYieldGrams)} г`}</p>
                  {result.per100g === null ? (
                    <p className="recipe-small">Без данных о выходе КБЖУ на 100 г готового блюда недоступны. КБЖУ рецепта и порции рассчитаны по ингредиентам.</p>
                  ) : (
                    <dl className="recipe-per100">
                      <dt>На 100 г готового блюда</dt>
                      <dd>{formatAmount(result.per100g.calories)} ккал · Б {formatAmount(result.per100g.protein)} г · Ж {formatAmount(result.per100g.fat)} г · У {formatAmount(result.per100g.carbohydrates)} г</dd>
                    </dl>
                  )}
                </div>
                <p className="recipe-method-note">Расчёт по исходным ингредиентам, без учёта потерь нутриентов при приготовлении. Значения на экране округлены.</p>
              </aside>
              <div className="recipe-body">
                <section className="recipe-section" aria-labelledby="ingredients-heading">
                  <div className="recipe-section-heading"><h2 id="ingredients-heading">Ингредиенты</h2><span>На исходный объём</span></div>
                  {result.components.map(({ component, ingredients }) => (
                    <div key={component.id}>
                      {result.components.length > 1 && <h3>{component.name}</h3>}
                      <table className="recipe-ingredients-table">
                        <caption className="sr-only">Ингредиенты компонента «{component.name}»</caption>
                        <thead><tr><th scope="col">Продукт</th><th scope="col">Состояние</th><th scope="col">Количество</th></tr></thead>
                        <tbody>{ingredients.map(({ ingredient, product }, index) => (
                          <tr key={`${product.id}-${index}`}>
                            <th scope="row">{product.name}</th><td>{stateLabels[ingredient.state]}</td><td>{formatAmount(ingredient.quantity)} {unitLabels[ingredient.unit]}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  ))}
                  <p className="recipe-small">Указана масса продуктов в состоянии измерения. Банан взвешивается без кожуры.</p>
                </section>
                <section className="recipe-section" aria-labelledby="steps-heading">
                  <h2 id="steps-heading">Как приготовить</h2>
                  <ol className="recipe-steps">{recipe.steps.map((step, index) => <li key={index}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol>
                </section>
              </div>
            </div>
            <section className="recipe-section recipe-sources" aria-labelledby="sources-heading">
              <div className="recipe-section-heading"><h2 id="sources-heading">Источники пищевой ценности</h2><span>На 100 г исходного продукта</span></div>
              <p className="recipe-small">Значения из конкретных записей норвежской таблицы состава продуктов Matvaretabellen. Они относятся к указанному продукту, его состоянию и жирности.</p>
              <ul className="recipe-source-list">{result.components.flatMap(({ component, ingredients }) => ingredients.map(({ product, profile }, index) => (
                <li key={`${component.id}-${product.id}-${index}`}>
                  <div><h3>{product.name}</h3><p className="recipe-small">{stateLabels[profile.state]} · Запись {profile.source.recordId}</p></div>
                  <div className="recipe-source-values"><span>{formatAmount(profile.per100g.calories)} ккал</span><span>Б {formatAmount(profile.per100g.protein)} г</span><span>Ж {formatAmount(profile.per100g.fat)} г</span><span>У {formatAmount(profile.per100g.carbohydrates)} г</span></div>
                  <div><a className="recipe-source-link" href={profile.source.url}>Открыть запись <span className="sr-only">{product.name} в Matvaretabellen</span><span aria-hidden="true"> ↗</span></a><p className="recipe-small">Проверено: <time dateTime={profile.source.checkedAt}>{profile.source.checkedAt}</time></p></div>
                </li>
              )))}</ul>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
