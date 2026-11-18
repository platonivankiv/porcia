import { describe, expect, it } from "vitest";
import { products, recipes } from "./catalog";
import { calculateRecipe } from "./calculate-recipe";

describe("demonstration catalog", () => {
  it.each(recipes)("$id has complete, calculable source data", (recipe) => {
    expect(calculateRecipe(recipe, products).ok).toBe(true);
    expect(recipe.steps.length).toBeGreaterThan(0);
    expect(recipe.components).toHaveLength(1);
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
        expect(profile.source.checkedAt).toBe("2026-11-17");
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
    expect(ingredients.find(({ product }) => product.id === "milk")?.grams).toBeCloseTo(412);
    expect(result.total.calories).toBeCloseTo(835.88);
    expect(result.perServing).toMatchObject({
      protein: expect.closeTo(17.998), fat: expect.closeTo(6.728), carbohydrates: expect.closeTo(66.836),
    });
  });

  it("uses two medium bananas in the yoghurt recipe as well", () => {
    const result = calculateRecipe(recipes[1], products);
    if (!result.ok) throw new Error(result.reason);
    expect(result.components[0].ingredients.find(({ product }) => product.id === "banana")?.grams).toBe(236);
    expect(result.perServing.calories).toBeCloseTo(318.04);
  });

  it("matches the equivalent gram-based recipe without altering the calculator", () => {
    const gramRecipe = {
      ...recipes[0],
      components: recipes[0].components.map((component) => ({
        ...component,
        ingredients: component.ingredients.map((ingredient) => ({
          ...ingredient,
          unit: "g" as const,
          quantity: ingredient.productId === "banana" ? 236 : ingredient.productId === "milk" ? 412 : ingredient.quantity,
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
