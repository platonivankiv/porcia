"use client";

import { useState, type ReactNode } from "react";
import { calculateRecipe } from "./calculate-recipe";
import type { Product, Recipe } from "./model";
import { parseServingsInput } from "./servings-input";
import { formatAmount, formatIngredientQuantity, formatServings, NutritionFacts, stateLabels } from "./recipe-ui";

export function RecipePortions({ recipe, products, children }: {
  recipe: Recipe;
  products: readonly Product[];
  children: ReactNode;
}) {
  const [servingsInput, setServingsInput] = useState(String(recipe.baseServings));
  const input = parseServingsInput(servingsInput);
  const result = input.status === "valid" ? calculateRecipe(recipe, products, input.value) : null;
  const feedback = input.status === "invalid"
    ? input.message
    : input.status === "empty"
      ? "Укажите количество порций, чтобы увидеть актуальный расчёт."
      : "Можно вводить дробные порции, например 1,25.";

  return (
    <div className="recipe-portions">
      <div className="recipe-servings-control">
        <label htmlFor="recipe-servings">Количество порций</label>
        <input
          id="recipe-servings"
          type="text"
          inputMode="decimal"
          value={servingsInput}
          onChange={(event) => setServingsInput(event.target.value)}
          aria-invalid={input.status === "invalid"}
          aria-describedby="recipe-servings-feedback"
          autoComplete="off"
          spellCheck={false}
        />
        <p id="recipe-servings-feedback" className="recipe-servings-feedback" aria-live="polite">{feedback}</p>
      </div>
      {!result?.ok ? (
        <>
          <section className="recipe-empty recipe-data-error" aria-labelledby="data-error-heading">
            <h2 id="data-error-heading">{input.status === "empty" ? "Укажите количество порций" : "Расчёт недоступен"}</h2>
            <p>{result?.reason ?? "Исправьте количество порций, чтобы увидеть актуальные ингредиенты и КБЖУ."}</p>
            {result && <p>Полные КБЖУ нельзя показать, пока исходные данные не исправлены.</p>}
          </section>
          {children}
        </>
      ) : (
        <>
          <section className="recipe-nutrition" aria-labelledby="nutrition-heading">
            <div><h2 id="nutrition-heading">На одну порцию</h2><p className="recipe-small">Расчётная оценка по ингредиентам</p></div>
            <NutritionFacts value={result.perServing} label="КБЖУ одной порции" />
          </section>
          <div className="recipe-detail-grid">
            <section className="recipe-ingredients" aria-labelledby="ingredients-heading">
              <div className="recipe-section-heading"><h2 id="ingredients-heading">Ингредиенты</h2><span>Порций: {formatServings(result.servings)}</span></div>
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
            {children}
          </div>
          <details className="recipe-calculation-details">
            <summary>Расчёт и источники <span aria-hidden="true">+</span></summary>
            <div className="recipe-calculation-content">
              <h2>КБЖУ выбранного объёма</h2>
              <NutritionFacts value={result.total} label="КБЖУ выбранного объёма" />
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
    </div>
  );
}
