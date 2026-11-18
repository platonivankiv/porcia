import { describe, expect, it } from "vitest";
import { calculateRecipe } from "./calculate-recipe";
import type { Product, Recipe } from "./model";

// Synthetic fixture from POR-002 C-EX01, not a real food profile.
const product: Product = {
  id: "test-product",
  name: "Тестовый продукт",
  nutrition: [{
    state: "dry",
    per100g: { calories: 200, protein: 10, fat: 5, carbohydrates: 20 },
    source: { title: "Synthetic fixture", url: "https://example.test/food/1", recordId: "1", checkedAt: "2026-11-17" },
  }],
};

const recipe: Recipe = {
  id: "test-recipe",
  name: "Тестовый рецепт",
  description: "Синтетические данные для проверки арифметики",
  baseServings: 4,
  steps: [],
  components: [{
    id: "base",
    name: "Основа",
    expectedYieldGrams: 800,
    ingredients: [{ productId: "test-product", state: "dry", quantity: 200, unit: "g" }],
  }],
};

describe("calculateRecipe", () => {
  it("calculates all nutrition values for the original volume and one base serving", () => {
    const result = calculateRecipe(recipe, [product]);
    expect(result).toMatchObject({
      ok: true,
      total: { calories: 400, protein: 20, fat: 10, carbohydrates: 40 },
      perServing: { calories: 100, protein: 5, fat: 2.5, carbohydrates: 10 },
    });
  });

  it.each([0, -1, NaN, Infinity])("rejects invalid base servings: %s", (baseServings) => {
    expect(calculateRecipe({ ...recipe, baseServings }, [product])).toMatchObject({
      ok: false,
      reason: expect.any(String),
    });
  });

  it("does not use a profile for a different product state", () => {
    const wrongState: Product = { ...product, nutrition: [{ ...product.nutrition[0], state: "cooked", per100g: { calories: 20, protein: 1, fat: 0.5, carbohydrates: 2 }, source: product.nutrition[0].source }] };
    expect(calculateRecipe(recipe, [wrongState])).toMatchObject({ ok: false, reason: expect.any(String) });
  });

  it("selects the matching state when other nutrition profiles exist", () => {
    const severalStates: Product = {
      ...product,
      nutrition: [
        { ...product.nutrition[0], state: "cooked", per100g: { calories: 20, protein: 1, fat: 0.5, carbohydrates: 2 } },
        product.nutrition[0],
      ],
    };
    expect(calculateRecipe(recipe, [severalStates])).toMatchObject({
      ok: true,
      total: { calories: 400, protein: 20, fat: 10, carbohydrates: 40 },
    });
  });

  it("does not mutate the recipe or its source profiles", () => {
    const original = structuredClone({ recipe, product });
    calculateRecipe(recipe, [product]);
    expect({ recipe, product }).toEqual(original);
  });

  it("rejects a numeric overflow instead of returning infinite nutrition", () => {
    const huge: Recipe = { ...recipe, components: [{ ...recipe.components[0], ingredients: [{ ...recipe.components[0].ingredients[0], quantity: Number.MAX_VALUE }] }] };
    expect(calculateRecipe(huge, [product])).toMatchObject({ ok: false });
  });

  it("does not report a partial sum when another ingredient has no product", () => {
    const missingIngredient: Recipe = { ...recipe, components: [{ ...recipe.components[0], ingredients: [...recipe.components[0].ingredients, { productId: "missing", state: "raw", quantity: 100, unit: "g" }] }] };
    const result = calculateRecipe(missingIngredient, [product]);
    expect(result).toMatchObject({ ok: false, reason: expect.any(String) });
    expect(result).not.toHaveProperty("total");
  });

  it("does not replace a missing nutrient with zero", () => {
    const incomplete: Product = { ...product, nutrition: [{ state: "dry", per100g: { calories: 200, protein: 10, fat: 5 }, source: product.nutrition[0].source }] };
    expect(calculateRecipe(recipe, [incomplete])).toMatchObject({ ok: false, reason: expect.any(String) });
  });

  it("requires a product-specific conversion for millilitres", () => {
    const liquidRecipe: Recipe = { ...recipe, components: [{ ...recipe.components[0], ingredients: [{ productId: product.id, state: "dry", quantity: 50, unit: "ml" }] }] };
    expect(calculateRecipe(liquidRecipe, [product])).toMatchObject({ ok: false, reason: expect.any(String) });
    const converted: Product = { ...product, gramsPerUnit: [{ state: "dry", unit: "ml", grams: 0.8 }] };
    expect(calculateRecipe(liquidRecipe, [converted])).toMatchObject({ ok: true, total: { calories: 80, protein: 4, fat: 2, carbohydrates: 8 } });
  });

  it.each([-10, NaN, Infinity])("rejects invalid ingredient quantities: %s", (quantity) => {
    const invalid: Recipe = { ...recipe, components: [{ ...recipe.components[0], ingredients: [{ ...recipe.components[0].ingredients[0], quantity }] }] };
    expect(calculateRecipe(invalid, [product])).toMatchObject({ ok: false });
  });

  it.each([-1, NaN, Infinity])("rejects invalid nutrient values: %s", (protein) => {
    const invalid: Product = { ...product, nutrition: [{ ...product.nutrition[0], per100g: { ...product.nutrition[0].per100g, protein } }] };
    expect(calculateRecipe(recipe, [invalid])).toMatchObject({ ok: false });
  });

  it("rejects recipes without ingredients", () => {
    expect(calculateRecipe({ ...recipe, components: [] }, [product])).toMatchObject({ ok: false });
    expect(calculateRecipe({ ...recipe, components: [{ ...recipe.components[0], ingredients: [] }] }, [product])).toMatchObject({ ok: false });
  });

  it("provides per-100g nutrition only for a known positive yield", () => {
    expect(calculateRecipe(recipe, [product])).toMatchObject({ ok: true, expectedYieldGrams: 800, per100g: { calories: 50, protein: 2.5, fat: 1.25, carbohydrates: 5 } });
    const unknown: Recipe = { ...recipe, components: [{ ...recipe.components[0], expectedYieldGrams: undefined }] };
    expect(calculateRecipe(unknown, [product])).toMatchObject({ ok: true, total: { calories: 400 }, expectedYieldGrams: null, per100g: null });
    const zeroYield: Recipe = { ...recipe, components: [{ ...recipe.components[0], expectedYieldGrams: 0 }] };
    expect(calculateRecipe(zeroYield, [product])).toMatchObject({ ok: false });
  });
});
