import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { products, recipes } from "./catalog";
import { calculateRecipe } from "./calculate-recipe";
import { calculateMemberPortions } from "./calculate-member-portions";
import { RecipeDetails } from "./recipe-details";

// Matvaretabellen records rechecked 2026-11-26; values per 100 g edible part.
describe("POR-011 food profiles", () => {
  it.each([
    ["red-lentils", "dry", "06.184", 274, 22.5, 2.2, 31.9],
    ["onion", "raw", "06.042", 30, 1, 0, 4.4],
    ["carrot", "raw", "06.036", 25, 0, 0, 5.3],
    ["garlic", "raw", "06.038", 106, 7.9, 0.6, 16.3],
    ["canned-tomatoes", "ready", "06.070", 21, 0.8, 0.2, 3.3],
    ["wheat-pasta", "dry", "05.016", 347, 11.9, 1.3, 69.8],
    ["ground-beef-4-5", "raw", "03.126", 123, 20.7, 4.5, 0],
    ["wild-cod", "raw", "04.038", 79, 17.4, 1, 0],
    ["potatoes", "raw", "06.004", 80, 1.9, 0.1, 17.1],
  ])("preserves the source profile for %s", (id, state, recordId, calories, protein, fat, carbohydrates) => {
    const product = products.find((item) => item.id === id);
    expect(product?.nutrition).toEqual([{
      state, per100g: { calories, protein, fat, carbohydrates },
      source: expect.objectContaining({ recordId, checkedAt: "2026-11-26" }),
    }]);
    expect(product?.gramsPerUnit).toBeUndefined();
  });
});

describe("POR-011 approved recipes", () => {
  // Independently worked ingredient sums, including all oil, divided by two.
  it.each([
    ["lentil-vegetable-stew", 1, 354.53, 19.952, 9.503, 37.134],
    ["pasta-beef-tomato", 2, 579.38, 42.917, 13.158, 67.779],
    ["cod-potatoes-broccoli", 3, 483.2, 43.92, 12.15, 45.75],
  ])("calculates %s from its approved ingredients without a cooked yield", (id, count, calories, protein, fat, carbohydrates) => {
    const recipe = recipes.find((item) => item.id === id);
    expect(recipe).toBeDefined();
    if (!recipe) throw new Error(`Missing recipe ${id}`);
    expect(recipe.baseServings).toBe(2);
    expect(recipe.components).toHaveLength(Number(count));
    expect(calculateRecipe(recipe, products)).toMatchObject({
      ok: true, expectedYieldGrams: null, per100g: null,
      perServing: { calories: expect.closeTo(Number(calories)), protein: expect.closeTo(Number(protein)),
        fat: expect.closeTo(Number(fat)), carbohydrates: expect.closeTo(Number(carbohydrates)) },
    });
  });

  it.each([
    ["pasta-beef-tomato", "Пшеница", "71 °C"],
    ["cod-potatoes-broccoli", "Рыба", "63 °C"],
  ])("shows allergens and safety for %s even when calculations are unavailable", (id, allergen, temperature) => {
    const recipe = recipes.find((item) => item.id === id)!;
    const html = renderToStaticMarkup(createElement(RecipeDetails, { recipe, products }));
    expect(html).toContain(`Известные аллергены: ${allergen}`);
    expect(html).toContain(temperature);
    expect(html).toContain("предварительная оценка без контрольной готовки");
    expect(html).toContain("Ограничения участников автоматически не проверяются");
    expect(html).not.toContain("undefined");
    const missingData = renderToStaticMarkup(createElement(RecipeDetails, { recipe, products: [] }));
    expect(missingData).toContain("Расчёт недоступен");
    expect(missingData).toContain(temperature);
  });

  it.each([
    { id: "lentil-vegetable-stew", servings: [0.5], quantities: [[40, 37.5, 25, 1.5, 75, 3.75]] },
    { id: "pasta-beef-tomato", servings: [0.5, 1.5], quantities: [[40], [225, 300, 75, 75, 4.5, 7.5]] },
    { id: "cod-potatoes-broccoli", servings: [0.5, 1.5, 0], quantities: [[100, 1.25], [375, 7.5], [0, 0]] },
  ])("scales real independently served components of $id", ({ id, servings, quantities }) => {
    const recipe = recipes.find((item) => item.id === id)!;
    const portions = [{ memberId: "test-member", components: recipe.components.map((component, index) => ({
      componentId: component.id, baseServings: servings[index],
    })) }];
    const before = structuredClone({ recipe, products, portions });
    const result = calculateMemberPortions(recipe, products, portions);
    if (!result.ok) throw new Error(result.reason);
    expect(result.components.map((component) => component.ingredients.map(({ ingredient }) => ingredient.quantity))).toEqual(quantities);
    expect({ recipe, products, portions }).toEqual(before);
  });
});
