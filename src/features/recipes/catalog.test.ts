import { describe, expect, it } from "vitest";
import { products, recipes } from "./catalog";
import { calculateRecipe } from "./calculate-recipe";

describe("demonstration catalog", () => {
  it.each(recipes)("$id has complete, calculable source data", (recipe) => {
    expect(calculateRecipe(recipe, products).ok).toBe(true);
    expect(recipe.steps.length).toBeGreaterThan(0);
    expect(recipe.components.length).toBeGreaterThan(0);
  });

  it("has unique recipe and product identifiers", () => {
    expect(new Set(recipes.map((recipe) => recipe.id)).size).toBe(recipes.length);
    expect(new Set(products.map((product) => product.id)).size).toBe(products.length);
  });

  it("links nutrition to concrete food records, not dictionary homepages", () => {
    for (const product of products) {
      for (const profile of product.nutrition) {
        expect(profile.source.recordId).toMatch(/^\d{2}\.\d{3}$/);
        expect(new URL(profile.source.url).pathname).toMatch(/^\/en\/[^/]+\/$/);
        expect(profile.source.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("does not assert an undocumented cooked yield", () => {
    for (const recipe of recipes) {
      const result = calculateRecipe(recipe, products);
      expect(result).toMatchObject({ ok: true, expectedYieldGrams: null, per100g: null });
    }
  });
});

describe("kitchen measures", () => {
  it("calculates exactly the masses specified by the kitchen quantities", () => {
    const result = calculateRecipe(recipes[0], products);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.reason);
    const ingredients = result.components[0].ingredients;
    expect(ingredients.find(({ product }) => product.id === "banana")?.grams).toBe(236);
    expect(ingredients.find(({ product }) => product.id === "milk")?.grams).toBeCloseTo(515);
    expect(result.total.calories).toBeCloseTo(956.63);
    expect(result.perServing).toMatchObject({
      protein: expect.closeTo(20.108), fat: expect.closeTo(11.446), carbohydrates: expect.closeTo(69.1785),
    });
  });

  it("uses two medium bananas in the yoghurt recipe as well", () => {
    const result = calculateRecipe(recipes[1], products);
    if (!result.ok) throw new Error(result.reason);
    expect(result.components[0].ingredients.find(({ product }) => product.id === "banana")?.grams).toBe(236);
    expect(result.perServing.calories).toBeCloseTo(386.04);
  });

  it("matches the equivalent gram-based recipe without altering the calculator", () => {
    const gramRecipe = {
      ...recipes[0],
      components: recipes[0].components.map((component) => ({
        ...component,
        ingredients: component.ingredients.map((ingredient) => ({
          ...ingredient,
          unit: "g" as const,
          quantity: ingredient.productId === "banana" ? 236 : ingredient.productId === "milk" ? 515 : ingredient.quantity,
        })),
      })),
    };
    const kitchenResult = calculateRecipe(recipes[0], products);
    const gramResult = calculateRecipe(gramRecipe, products);
    if (!kitchenResult.ok || !gramResult.ok) throw new Error("Expected complete nutrition");
    expect(kitchenResult.total).toEqual(gramResult.total);
  });

  it("does not produce nutrition when a required kitchen conversion is missing", () => {
    const withoutBananaConversion = products.map((product) => product.id === "banana" ? { ...product, gramsPerUnit: undefined } : product);
    expect(calculateRecipe(recipes[0], withoutBananaConversion)).toMatchObject({ ok: false });
  });

  it("records a separate source and scope for every catalog conversion", () => {
    for (const product of products) {
      for (const conversion of product.gramsPerUnit ?? []) {
        expect(conversion.source?.url).toMatch(/^https:\/\//);
        expect(conversion.source?.note).toBeTruthy();
        expect(conversion.source?.checkedAt).toBe("2026-11-18");
      }
    }
  });
});

describe("chicken, rice and vegetables", () => {
  it("provides three components with complete raw/dry profiles and no invented cooked mass", () => {
    const recipe = recipes.find((item) => item.id === "chicken-rice-vegetables");
    expect(recipe).toBeDefined();
    if (!recipe) throw new Error("Missing compound demonstration recipe");
    expect(recipe.components).toHaveLength(3);
    const result = calculateRecipe(recipe, products);
    expect(result).toMatchObject({
      ok: true, total: { calories: expect.closeTo(1222.6), protein: expect.closeTo(116.11), fat: expect.closeTo(24.37), carbohydrates: expect.closeTo(129.44) },
      perServing: { calories: expect.closeTo(611.3), protein: expect.closeTo(58.055), fat: expect.closeTo(12.185), carbohydrates: expect.closeTo(64.72) },
      expectedYieldGrams: null, per100g: null,
      components: [
        { ingredients: [{ ingredient: { state: "raw" }, grams: 400 }, { ingredient: { quantity: 10 }, grams: 10 }], nutrition: { calories: 533.2 }, expectedYieldGrams: null },
        { ingredients: [{ ingredient: { state: "dry" }, grams: 160 }], nutrition: { calories: expect.closeTo(548.8) }, expectedYieldGrams: null },
        { ingredients: [{ ingredient: { state: "raw" }, grams: 400 }, { ingredient: { quantity: 5 }, grams: 5 }], nutrition: { calories: 140.6 }, expectedYieldGrams: null },
      ],
    });
  });
});

// POR-006: worked totals include all oil/nuts and exclude unmeasured seasonings.
describe("approved home recipes", () => {
  it.each([
    ["banana-porridge", 956.63, 40.216, 22.892, 138.357],
    ["banana-yoghurt", 772.08, 25.876, 27.992, 98.172],
    ["chicken-rice-vegetables", 1222.6, 116.11, 24.37, 129.44],
  ])("calculates the complete approved composition of %s", (id, calories, protein, fat, carbohydrates) => {
    const recipe = recipes.find((item) => item.id === id);
    if (!recipe) throw new Error(`Missing recipe ${id}`);
    expect(calculateRecipe(recipe, products)).toMatchObject({
      ok: true,
      total: { calories: expect.closeTo(Number(calories)), protein: expect.closeTo(Number(protein)), fat: expect.closeTo(Number(fat)), carbohydrates: expect.closeTo(Number(carbohydrates)) },
      expectedYieldGrams: null, per100g: null,
    });
  });
});

describe("home recipe scaling", () => {
  it.each(recipes)("scales $id from its original composition", (recipe) => {
    const original = structuredClone({ recipe, products });
    const base = calculateRecipe(recipe, products, 2);
    if (!base.ok) throw new Error(base.reason);
    for (const servings of [4, 1, 2, 1.25]) {
      const result = calculateRecipe(recipe, products, servings);
      if (!result.ok) throw new Error(result.reason);
      expect(result.total.calories).toBeCloseTo(base.total.calories * servings / 2);
      expect(result.perServing).toMatchObject({
        calories: expect.closeTo(base.perServing.calories),
        protein: expect.closeTo(base.perServing.protein),
        fat: expect.closeTo(base.perServing.fat),
        carbohydrates: expect.closeTo(base.perServing.carbohydrates),
      });
      result.components.forEach((component, c) => component.ingredients.forEach((item, i) => {
        expect(item.ingredient.quantity).toBeCloseTo(base.components[c].ingredients[i].ingredient.quantity * servings / 2);
      }));
    }
    expect({ recipe, products }).toEqual(original);
    expect(calculateRecipe(recipe, products, 2)).toEqual(base);
  });

  it("keeps the cooking oil in the independently portioned chicken and broccoli", () => {
    const result = calculateRecipe(recipes[2], products, 4);
    if (!result.ok) throw new Error(result.reason);
    const oil = result.components.map((component) => component.ingredients.filter((item) => item.product.id === "rapeseed-oil").map((item) => item.grams));
    expect(oil).toEqual([[20], [], [10]]);
  });
});
