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
