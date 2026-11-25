"use client";

import styles from "./recipe-details.module.scss";

import { useState, type ReactNode } from "react";
import { calculateRecipe } from "./calculate-recipe";
import type { Product, Recipe } from "./model";
import { parseServingsInput } from "./servings-input";
import { NutritionFacts } from "./recipe-ui";
import { formatAmount, formatIngredientQuantity, formatServings, stateLabels } from "./recipe-format";

export function RecipePortions({ recipe, products, hero, allergens, calculationNotes, tone, children }: {
  recipe: Recipe;
  products: readonly Product[];
  hero: ReactNode;
  allergens: ReactNode;
  calculationNotes: ReactNode;
  tone: string;
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
    <div className={styles.portions}>
      <header className={`${styles.detailHero} ${styles[`tone-${tone}`]}`}>
        {hero}
        <section className={styles.nutrition} aria-label="Пищевая ценность базовой порции">
          {result?.ok ? <>
            <div><h2 id="nutrition-heading">На 1 базовую порцию</h2></div>
            <NutritionFacts className={styles.nutrients} value={result.perServing} label="КБЖУ одной порции" />
          </> : <p className={styles.small}>{input.status === "valid" ? "КБЖУ недоступны до уточнения пищевых данных." : "КБЖУ текущего расчёта недоступны. Исправьте количество порций."}</p>}
        </section>
      </header>
      {allergens}
      <div className={styles.servingsControl}>
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
        <p id="recipe-servings-feedback" className={styles.servingsFeedback} aria-live="polite">{feedback}</p>
        {result?.ok && <p className={styles.volumeNote}>Всего: {formatAmount(result.total.calories)} ккал</p>}
      </div>
      <div className={styles.detailGrid}>
        <section className={styles.ingredients} aria-labelledby="ingredients-heading">
          <h2 id="ingredients-heading">Ингредиенты</h2>
          {!result?.ok ? <section className={styles.dataError} aria-labelledby="data-error-heading" role="status">
            <h3 id="data-error-heading">{input.status === "empty" ? "Укажите количество порций" : "Расчёт недоступен"}</h3>
            <p>{result?.reason ?? "Исправьте количество порций, чтобы увидеть актуальные ингредиенты и КБЖУ."}</p>
            {result && <p>Полные КБЖУ нельзя показать, пока исходные данные не исправлены.</p>}
            {calculationNotes}
          </section> : <>
            {result.components.map(({ component, ingredients, expectedYieldGrams }) => (
              <div className={styles.ingredientGroup} key={component.id}>
                {result.components.length > 1 && <h3>{component.name}</h3>}
                {expectedYieldGrams !== null && <p className={styles.small}>Ожидаемый выход: {formatAmount(expectedYieldGrams)} г</p>}
                <ul className={styles.ingredientList}>
                  {ingredients.map(({ ingredient, product }, index) => (
                    <li key={`${product.id}-${index}`}><span>{product.name}<small>{stateLabels[ingredient.state]}</small></span><strong>{formatIngredientQuantity(ingredient, product)}</strong></li>
                  ))}
                  {component.seasonings?.map((seasoning) => (
                    <li key={seasoning}><span>{seasoning}</span><strong>по вкусу</strong></li>
                  ))}
                </ul>
              </div>
            ))}
          </>}
        </section>
        {children}
      </div>
      {result?.ok && (
        <details className={styles.calculationDetails}>
          <summary>Расчёт и источники <span aria-hidden="true">+</span></summary>
          <div className={styles.calculationContent}>
            {calculationNotes}
            <h2>КБЖУ выбранного объёма</h2>
            <p className={styles.small}>Порций: {formatServings(result.servings)}</p>
            <NutritionFacts className={styles.nutrients} value={result.total} label="КБЖУ выбранного объёма" />
            <h3>Выход готового блюда</h3>
            {result.expectedYieldGrams === null ? (
              <p>Без данных о выходе КБЖУ на 100 г готового блюда недоступны. КБЖУ рецепта и порции рассчитаны по ингредиентам.</p>
            ) : (
              <p>Ожидаемый выход: {formatAmount(result.expectedYieldGrams)} г.
                {result.per100g && <> На 100 г готового блюда: {formatAmount(result.per100g.calories)} ккал · Б {formatAmount(result.per100g.protein)} г · Ж {formatAmount(result.per100g.fat)} г · У {formatAmount(result.per100g.carbohydrates)} г.</>}
              </p>
            )}
            {result.expectedYieldGrams === null && result.components.length > 1 && (
              <p>Компоненты без данных о выходе: {result.components.filter((item) => item.expectedYieldGrams === null).map((item) => item.component.name).join(", ")}. Общий выход нельзя определить по части компонентов.</p>
            )}
            {result.components.length > 1 && result.components.map(({ component, nutrition, expectedYieldGrams, per100g }) => (
              <div className={styles.componentCalculation} key={component.id}>
                <h3>{component.name}</h3>
                <p className={styles.small}>КБЖУ компонента для выбранного объёма</p>
                <NutritionFacts className={styles.nutrients} value={nutrition} label={`КБЖУ компонента: ${component.name}`} />
                {expectedYieldGrams === null ? (
                  <p>Ожидаемый выход не задан. КБЖУ компонента рассчитаны по ингредиентам; показатель на 100 г готового компонента недоступен.</p>
                ) : (
                  <p>Ожидаемый выход: {formatAmount(expectedYieldGrams)} г.</p>
                )}
                {per100g && <>
                  <h4>На 100 г готового компонента</h4>
                  <NutritionFacts className={styles.nutrients} value={per100g} label={`КБЖУ на 100 г компонента: ${component.name}`} />
                </>}
              </div>
            ))}
            {result.expectedYieldGrams !== null && result.components.length > 1 && <p>Общие показатели на 100 г относятся к составу и соотношению компонентов этого рецепта.</p>}
            <h3>Методика расчёта</h3>
            <p>КБЖУ рассчитаны по массе исходных ингредиентов и соответствующим их состоянию профилям на 100 г. Это оценка: небольшие количества обычных приправ не учитываются. Масло, орехи и другие калорийные добавки включены в расчёт. Потери нутриентов при приготовлении не учитываются. Значения округлены только для отображения. Штучные продукты рассчитаны по среднему размеру. Средние массы и плотность — бытовые оценки.</p>
            <h3>Источники пищевой ценности и переводов единиц</h3>
            <ul className={styles.sourceList}>
              {result.components.flatMap(({ component, ingredients }) => ingredients.map(({ ingredient, product, profile, grams }, index) => {
                const conversion = product.gramsPerUnit?.find((item) => item.state === ingredient.state && item.unit === ingredient.unit);
                return (
                  <li key={`${component.id}-${product.id}-${index}`}>
                    <h4>{product.name}</h4>
                    <p>{stateLabels[profile.state]} · Расчётная масса: {formatAmount(grams)} г</p>
                    <p>На 100 г продукта: {formatAmount(profile.per100g.calories)} ккал · Б {formatAmount(profile.per100g.protein)} г · Ж {formatAmount(profile.per100g.fat)} г · У {formatAmount(profile.per100g.carbohydrates)} г</p>
                    <p><a href={profile.source.url}>{profile.source.title}</a> · Запись {profile.source.recordId} · Проверено: <time dateTime={profile.source.checkedAt}>{profile.source.checkedAt}</time></p>
                    {conversion?.source && <div className={styles.conversionSource}><p>{conversion.source.note}</p><p><a href={conversion.source.url}>{conversion.source.title}</a> · Проверено: <time dateTime={conversion.source.checkedAt}>{conversion.source.checkedAt}</time></p></div>}
                  </li>
                );
              }))}
            </ul>
          </div>
        </details>
      )}
    </div>
  );
}
