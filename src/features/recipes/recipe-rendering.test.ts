import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { products, recipes } from "./catalog";
import { RecipeCatalog } from "./recipe-catalog";
import { RecipePhoto } from "./recipe-photo";
import { RecipeDetails } from "./recipe-details";
import { RecipeHeader } from "./recipe-ui";

it("keeps the family section, catalog link and skip link available in the shared navigation", () => {
  const html = renderToStaticMarkup(createElement(RecipeHeader, { section: "family" }));
  expect(html).toContain('href="#recipe-content"');
  expect(html).toContain('aria-label="Основная навигация"');
  expect(html).toMatch(/<a[^>]*aria-current="location"[^>]*href="\/family"/);
  expect(html).toContain('href="/recipes"');
});

describe("recipe read-only states", () => {
  it("labels catalog calories as one base serving and keeps each existing recipe reachable", () => {
    const html = renderToStaticMarkup(createElement(RecipeCatalog, { recipes, products }));
    expect(html).toContain("на 1 базовую порцию");
    for (const recipe of recipes) {
      expect(html).toContain(`href="/recipes/${recipe.id}"`);
      expect(html).toContain(recipe.name);
    }
    expect(html).toContain("478,3");
    expect(html).toContain("386");
    expect(html).toContain("611,3");
  });

  it("preserves fractional base servings in catalog cards", () => {
    const html = renderToStaticMarkup(createElement(RecipeCatalog, {
      recipes: [{ ...recipes[0], baseServings: 1.25 }],
      products,
    }));
    expect(html).toContain("Порций: 1,25");
  });
  it("does not round a fractional serving count to the nutrition display precision", () => {
    const html = renderToStaticMarkup(createElement(RecipeDetails, { recipe: { ...recipes[0], baseServings: 1.25 }, products }));
    expect(html).toContain("Порций: 1,25");
  });
  it("explains an empty catalog", () => {
    const html = renderToStaticMarkup(createElement(RecipeCatalog, { recipes: [], products }));
    expect(html).toContain("Рецептов пока нет");
    expect(html).not.toMatch(/href="\/recipes\//);
  });

  it("does not present totals for a recipe with missing product data", () => {
    const html = renderToStaticMarkup(createElement(RecipeDetails, { recipe: recipes[0], products: [] }));
    expect(html).toContain("Расчёт недоступен");
    expect(html).toContain("отсутствует в справочнике");
    expect(html).not.toContain("КБЖУ выбранного объёма");
    expect(html).not.toContain('aria-label="КБЖУ одной порции"');
    expect(html).not.toContain("На 100 г готового блюда");
    expect(html).toContain("при изменении порций оно может отличаться");
  });

  it("keeps calculated nutrition available without a cooked yield", () => {
    const html = renderToStaticMarkup(createElement(RecipeDetails, { recipe: recipes[0], products }));
    expect(html).toContain("956,6");
    expect(html).toContain("478,3");
    expect(html).toContain("Без данных о выходе");
    expect(html).not.toContain("Расчёт недоступен");
  });
  it("shows kitchen quantities, per-serving nutrition and expandable calculation details", () => {
    const html = renderToStaticMarkup(createElement(RecipeDetails, { recipe: recipes[0], products }));
    expect(html).toContain("2 средних банана");
    expect(html).toContain("500 мл");
    expect(html).toContain("На 1 базовую порцию");
    expect(html).toContain("<details");
    expect(html).not.toContain("<details open");
    expect(html).toContain("Расчёт и источники");
    expect(html).toContain("AI-иллюстрации");
    expect(html).not.toContain("Взвесьте мякоть банана");
    expect(html).toContain('for="recipe-servings"');
    expect(html).toContain('inputMode="decimal"');
    expect(html).toContain('value="2"');
    expect(html).toContain("Базовых порций");
    expect(html).not.toContain("Отмерьте 120 г");
  });

  it("explains the absence of a photo without producing a broken image", () => {
    const html = renderToStaticMarkup(createElement(RecipePhoto, { image: undefined }));
    expect(html).toContain("Изображения пока нет");
    expect(html).not.toContain("<img");
  });
});

it("places overall servings before the cooking columns and keeps manual family portions secondary", () => {
  const html = renderToStaticMarkup(createElement(RecipeDetails, { recipe: recipes[2], products }));
  const ingredients = html.slice(html.indexOf('aria-labelledby="ingredients-heading"'), html.indexOf('aria-labelledby="steps-heading"'));
  expect(html.indexOf('id="recipe-servings"')).toBeLessThan(html.indexOf('class="recipe-detail-grid"'));
  expect(ingredients).not.toContain('id="recipe-servings"');
  expect(ingredients).toContain("Сухой продукт");
  expect(ingredients).toContain("Сырой продукт");
  expect(html).toMatch(/<details class="recipe-family-details">/);
  expect(html.indexOf('class="recipe-family-details"')).toBeGreaterThan(html.indexOf("74 °C"));
  expect(html).toContain("Вспомогательный расчёт");
});

it("shows only known total and active times and keeps the scaling explanation in calculation details", () => {
  const html = renderToStaticMarkup(createElement(RecipeDetails, { recipe: recipes[0], products }));
  const hero = html.slice(html.indexOf('class="recipe-detail-heading"'), html.indexOf('class="recipe-detail-art"'));
  expect(hero).toContain("Всего ≈ 15 мин");
  expect(hero).toContain("Активная готовка ≈ 7 мин");
  expect(hero).not.toContain("Подготовка");
  expect(hero).not.toContain("при изменении порций");
  expect(html.slice(html.indexOf('<details class="recipe-calculation-details"'))).toContain("при изменении порций оно может отличаться");
  const unknown = renderToStaticMarkup(createElement(RecipeDetails, { recipe: { ...recipes[0], totalMinutes: undefined, activeMinutes: undefined }, products }));
  expect(unknown).not.toContain('class="recipe-time-chips"');
});

describe("compound recipe display", () => {
  it("keeps known component data visible without presenting unknown yields as ingredient errors", () => {
    const original = recipes.find((recipe) => recipe.id === "chicken-rice-vegetables");
    if (!original) throw new Error("Missing compound recipe");
    const recipe = { ...original, components: original.components.map((component, index) => index === 0 ? { ...component, expectedYieldGrams: 300 } : component) };
    const html = renderToStaticMarkup(createElement(RecipeDetails, { recipe, products }));
    const mainIngredients = html.split('<details')[0];
    expect(mainIngredients).toContain("Куриная грудка");
    expect(mainIngredients).toContain("Запечённая брокколи");
    expect(mainIngredients).toContain("Ожидаемый выход: 300 г");
    expect(mainIngredients).not.toContain("Выход неизвестен");
    expect(mainIngredients).not.toContain("Расчёт недоступен");
    expect(html).toContain('aria-label="КБЖУ компонента: Куриная грудка"');
    expect(html).toContain('aria-label="КБЖУ на 100 г компонента: Куриная грудка"');
    expect(html).not.toContain('aria-label="КБЖУ на 100 г компонента: Рис"');
    expect(html).toContain("Компоненты без данных о выходе: Рис, Запечённая брокколи");
  });
});

describe("home recipe information", () => {
  it("shows unmeasured seasonings and explains the nutrition estimate", () => {
    const html = renderToStaticMarkup(createElement(RecipeDetails, { recipe: recipes[0], products }));
    expect(html).toContain("Корица");
    expect(html).toContain("по вкусу");
    expect(html).toContain("небольшие количества обычных приправ не учитываются");
    const text = html.replace(/<[^>]*>/g, " ");
    expect(text).toMatch(/Корица\s+по вкусу/);
    expect(text).toMatch(/Соль\s+по вкусу/);
  });

  it("identifies walnuts and milk without claiming complete allergen safety", () => {
    const html = renderToStaticMarkup(createElement(RecipeDetails, { recipe: recipes[1], products }));
    expect(html).toContain("Известные аллергены");
    expect(html).toContain("Грецкие орехи");
    expect(html).toContain("Молоко");
    expect(html).toContain("не подтверждает отсутствие других аллергенов");
  });

  it("keeps the safety note visible when ingredient calculation is unavailable", () => {
    const html = renderToStaticMarkup(createElement(RecipeDetails, { recipe: recipes[2], products: [] }));
    expect(html).toContain("Расчёт недоступен");
    expect(html).toContain("Безопасное приготовление");
    expect(html).toContain("74 °C");
  });
});
