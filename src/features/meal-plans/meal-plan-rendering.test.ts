import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { products, recipes } from "../recipes/catalog";
import { mealPlanTemplates } from "./catalog";
import { MealPlanCatalog } from "./meal-plan-catalog";
import { MealPlanDetails } from "./meal-plan-details";

const template = mealPlanTemplates[0];

describe("prepared meal plan catalog", () => {
  it("explains an empty catalog without offering a fictional menu", () => {
    const html = renderToStaticMarkup(createElement(MealPlanCatalog, { templates: [], recipes, products }));
    expect(html).toContain("Рационов пока нет");
    expect(html).not.toContain("Посмотреть рацион");
  });

  it("withholds a damaged template instead of publishing a partial menu", () => {
    for (const input of [null, { ...template, days: [] }, template]) {
      const html = renderToStaticMarkup(createElement(MealPlanCatalog, { templates: [input], recipes: [], products }));
      expect(html).toContain("Рацион временно недоступен");
      expect(html).not.toContain("Посмотреть рацион");
      expect(html).not.toContain(template.name);
    }
  });

  it("offers the existing menu with a duration derived from its days", () => {
    const html = renderToStaticMarkup(createElement(MealPlanCatalog, { templates: mealPlanTemplates, recipes, products }));
    expect(html).toContain(template.name);
    expect(html).toContain('href="/meal-plans/home-meals-two-days"');
    expect(html).toContain("2 дня");
    expect(html).toContain("Посмотреть рацион");
    expect(html).toContain("Совместимость с аллергиями и ограничениями семьи не проверяется");
    expect(html.match(/Посмотреть рацион/g)).toHaveLength(1);
  });
});

describe("prepared meal plan menu", () => {
  it("does not reveal a partial menu when a direct or ingredient reference is broken", () => {
    for (const data of [
      { template: null, recipes, products },
      { template, recipes: recipes.slice(1), products },
      { template, recipes, products: products.filter((product) => product.id !== "red-lentils") },
      { template: { ...template, days: [] }, recipes, products },
    ]) {
      const html = renderToStaticMarkup(createElement(MealPlanDetails, data));
      expect(html).toContain("Рацион временно недоступен");
      expect(html).not.toContain("Меню по дням");
      for (const recipe of recipes) expect(html).not.toContain(`href="/recipes/${recipe.id}"`);
    }
  });
  it("preserves day and meal order and links all six recipes from the source catalog", () => {
    const html = renderToStaticMarkup(createElement(MealPlanDetails, { template, recipes, products }));
    expect(html).toContain(template.description);
    expect(html).toContain("2 дня");
    expect(html.indexOf("День 1")).toBeLessThan(html.indexOf("День 2"));
    const orderedIds = ["banana-porridge", "chicken-rice-vegetables", "lentil-vegetable-stew", "banana-yoghurt", "pasta-beef-tomato", "cod-potatoes-broccoli"];
    let previous = -1;
    for (const id of orderedIds) {
      const position = html.indexOf(`href="/recipes/${id}"`);
      expect(position).toBeGreaterThan(previous);
      previous = position;
      expect(html).toContain(recipes.find((recipe) => recipe.id === id)?.name);
    }
    expect(html).toContain('href="/meal-plans"');
  });
});

it("keeps missing photos and unknown times honest while retaining the recipe links", () => {
  const withoutMediaOrTimes = recipes.map((recipe) => ({ ...recipe, image: undefined, totalMinutes: undefined }));
  const catalog = renderToStaticMarkup(createElement(MealPlanCatalog, { templates: [template], recipes: withoutMediaOrTimes, products }));
  const detail = renderToStaticMarkup(createElement(MealPlanDetails, { template, recipes: withoutMediaOrTimes, products }));
  expect(catalog).toContain("Изображения пока нет");
  expect(detail.match(/Изображения пока нет/g)).toHaveLength(6);
  expect(detail).not.toContain(" мин");
  for (const recipe of recipes) expect(detail).toContain(`href="/recipes/${recipe.id}"`);
});

it("derives the duration from the array and keeps named meals and direct products intact", () => {
  const oneDay = { ...template, days: [{ ...template.days[0], meals: [{
    id: "snack", label: "Перекус", items: [{ id: "fruit", kind: "product", productId: "banana", state: "raw" }],
  }] }] };
  const html = renderToStaticMarkup(createElement(MealPlanDetails, { template: oneDay, recipes, products }));
  expect(html).toContain("1 день");
  expect(html).toContain("Перекус");
  expect(html).toContain("Банан");
  expect(html).toContain("Сырой продукт");
  expect(html).not.toContain("День 2");
});
