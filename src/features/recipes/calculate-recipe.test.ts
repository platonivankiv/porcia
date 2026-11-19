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
  it("recalculates 2 → 4 → 1 → 2 servings without changing its source recipe", () => {
    const source: Recipe = { ...recipe, baseServings: 2 };
    const before = structuredClone({ source, product });
    const results = [2, 4, 1, 2].map((servings) => calculateRecipe(source, [product], servings));
    expect(results.map((result) => result.ok ? result.total.calories : null)).toEqual([400, 800, 200, 400]);
    expect(results[3]).toEqual(results[0]);
    expect({ source, product }).toEqual(before);
  });

  it("supports fractional servings without rounding the calculation", () => {
    const result = calculateRecipe(recipe, [product], 1.25);
    expect(result).toMatchObject({ ok: true, servings: 1.25, total: { calories: 125, protein: 6.25, fat: 3.125, carbohydrates: 12.5 }, expectedYieldGrams: 250, perServing: { calories: 100 } });
    if (!result.ok) throw new Error(result.reason);
    expect(result.components[0].ingredients[0]).toMatchObject({ ingredient: { quantity: 62.5 }, grams: 62.5 });
  });

  it("keeps scaled nutrition available when cooked yield is unknown", () => {
    const unknown: Recipe = { ...recipe, components: [{ ...recipe.components[0], expectedYieldGrams: undefined }] };
    expect(calculateRecipe(unknown, [product], 8)).toMatchObject({ ok: true, total: { calories: 800 }, perServing: { calories: 100 }, expectedYieldGrams: null, per100g: null });
  });

  it.each([0, -1, NaN, Infinity, -Infinity])("rejects invalid requested servings: %s", (servings) => {
    expect(calculateRecipe(recipe, [product], servings)).toMatchObject({
      ok: false,
      reason: "Количество порций должно быть положительным конечным числом.",
    });
  });

  it("scales ingredients, total nutrition and known yield from the base recipe", () => {
    const result = calculateRecipe(recipe, [product], 8);
    expect(result).toMatchObject({
      ok: true,
      servings: 8,
      total: { calories: 800, protein: 40, fat: 20, carbohydrates: 80 },
      perServing: { calories: 100, protein: 5, fat: 2.5, carbohydrates: 10 },
      expectedYieldGrams: 1600,
      per100g: { calories: 50, protein: 2.5, fat: 1.25, carbohydrates: 5 },
    });
    if (!result.ok) throw new Error(result.reason);
    expect(result.components[0].ingredients[0]).toMatchObject({ ingredient: { quantity: 400 }, grams: 400 });
  });

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

// Synthetic C-EX02 extends C-EX01 with a separately portioned component.
const secondProduct: Product = {
  ...product,
  id: "second-product",
  nutrition: [{ ...product.nutrition[0], per100g: { calories: 100, protein: 5, fat: 2, carbohydrates: 10 } }],
};
const compound: Recipe = {
  ...recipe,
  components: [...recipe.components, {
    id: "side",
    name: "Гарнир",
    ingredients: [{ productId: secondProduct.id, state: "dry", quantity: 100, unit: "g" }],
  }],
};

describe("component yields", () => {
  it("keeps the known component yield and nutrition available in C-EX02", () => {
    const result = calculateRecipe(compound, [product, secondProduct]);
    expect(result).toMatchObject({
      ok: true,
      total: { calories: 500, protein: 25, fat: 12, carbohydrates: 50 },
      perServing: { calories: 125, protein: 6.25, fat: 3, carbohydrates: 12.5 },
      expectedYieldGrams: null,
      per100g: null,
      components: [
        { nutrition: { calories: 400, protein: 20, fat: 10, carbohydrates: 40 }, expectedYieldGrams: 800,
          per100g: { calories: 50, protein: 2.5, fat: 1.25, carbohydrates: 5 } },
        { nutrition: { calories: 100, protein: 5, fat: 2, carbohydrates: 10 }, expectedYieldGrams: null, per100g: null },
      ],
    });
  });
});

describe("component numeric range", () => {
  it("rejects an overflowing component yield even when another yield is unknown", () => {
    const extreme: Recipe = { ...compound, components: [compound.components[1], { ...compound.components[0], expectedYieldGrams: Number.MAX_VALUE }] };
    expect(calculateRecipe(extreme, [product, secondProduct], 8)).toMatchObject({ ok: false });
  });
});

describe("compound calculation contract", () => {
  const allKnown: Recipe = {
    ...compound,
    components: [compound.components[0], { ...compound.components[1], expectedYieldGrams: 200 }],
  };

  it("sums known cooked yields and uses the combined composition for per-100g values", () => {
    expect(calculateRecipe(allKnown, [product, secondProduct])).toMatchObject({
      ok: true, expectedYieldGrams: 1000,
      per100g: { calories: 50, protein: 2.5, fat: 1.2, carbohydrates: 5 },
      components: [{ expectedYieldGrams: 800 }, { expectedYieldGrams: 200,
        per100g: { calories: 50, protein: 2.5, fat: 1, carbohydrates: 5 } }],
    });
  });

  it("scales every component for 2 → 4 → 1 → 2 and keeps the source unchanged", () => {
    const before = structuredClone({ allKnown, product, secondProduct });
    const results = [2, 4, 1, 2].map((servings) => calculateRecipe(allKnown, [product, secondProduct], servings));
    expect(results.map((r) => r.ok ? r.components.map((c) => c.expectedYieldGrams) : null))
      .toEqual([[400, 100], [800, 200], [200, 50], [400, 100]]);
    expect(results.map((r) => r.ok ? r.total.calories : null)).toEqual([250, 500, 125, 250]);
    for (const result of results) {
      if (!result.ok) throw new Error(result.reason);
      expect(result.perServing).toEqual({ calories: 125, protein: 6.25, fat: 3, carbohydrates: 12.5 });
      expect(result.components[0].per100g).toEqual({ calories: 50, protein: 2.5, fat: 1.25, carbohydrates: 5 });
      expect(result.components[1].per100g).toEqual({ calories: 50, protein: 2.5, fat: 1, carbohydrates: 5 });
    }
    expect(results[0]).toEqual(results[3]);
    expect({ allKnown, product, secondProduct }).toEqual(before);
  });

  it("scales C-EX02 to eight and fractional servings without intermediate rounding", () => {
    expect(calculateRecipe(compound, [product, secondProduct], 8)).toMatchObject({
      ok: true, total: { calories: 1000, protein: 50, fat: 24, carbohydrates: 100 },
      components: [{ expectedYieldGrams: 1600 }, { expectedYieldGrams: null }],
    });
    expect(calculateRecipe(compound, [product, secondProduct], 1.25)).toMatchObject({
      ok: true, expectedYieldGrams: null,
      total: { calories: 156.25, protein: 7.8125, fat: 3.75, carbohydrates: 15.625 },
      components: [
        { expectedYieldGrams: 250, ingredients: [{ grams: 62.5 }] },
        { expectedYieldGrams: null, per100g: null, ingredients: [{ grams: 31.25 }] },
      ],
    });
  });

  it("preserves known yields after an unknown component and with all yields unknown", () => {
    const reversed: Recipe = { ...compound, components: [...compound.components].reverse() };
    expect(calculateRecipe(reversed, [product, secondProduct])).toMatchObject({
      ok: true, expectedYieldGrams: null, per100g: null,
      components: [{ expectedYieldGrams: null }, { expectedYieldGrams: 800, per100g: { calories: 50 } }],
    });
    const unknown: Recipe = { ...compound, components: compound.components.map((c) => ({ ...c, expectedYieldGrams: undefined })) };
    expect(calculateRecipe(unknown, [product, secondProduct])).toMatchObject({
      ok: true, total: { calories: 500 }, perServing: { calories: 125 }, expectedYieldGrams: null, per100g: null,
      components: [{ expectedYieldGrams: null, per100g: null }, { expectedYieldGrams: null, per100g: null }],
    });
  });

  it("changing only cooked mass changes density, not ingredient nutrition", () => {
    const changed: Recipe = { ...compound, components: [{ ...compound.components[0], expectedYieldGrams: 1000 }, compound.components[1]] };
    expect(calculateRecipe(changed, [product, secondProduct])).toMatchObject({
      ok: true, total: { calories: 500, protein: 25, fat: 12, carbohydrates: 50 },
      components: [{ nutrition: { calories: 400 }, expectedYieldGrams: 1000,
        per100g: { calories: 40, protein: 2, fat: 1, carbohydrates: 4 } }, { expectedYieldGrams: null }],
    });
  });

  it.each([0, -1, NaN, Infinity, -Infinity])("rejects an invalid yield in any component: %s", (expectedYieldGrams) => {
    const invalid: Recipe = { ...compound, components: [compound.components[1], { ...compound.components[0], expectedYieldGrams }] };
    expect(calculateRecipe(invalid, [product, secondProduct])).toMatchObject({ ok: false, reason: expect.stringContaining("выход") });
  });

  it("does not return the first component's nutrition as a complete recipe when the second profile is missing", () => {
    const incomplete: Product = { ...secondProduct, nutrition: [{ ...secondProduct.nutrition[0], per100g: { calories: 100 } }] };
    const result = calculateRecipe(compound, [product, incomplete]);
    expect(result).toMatchObject({ ok: false });
    expect(result).not.toHaveProperty("total");
    expect(result).not.toHaveProperty("components");
  });

  it("rejects per-100g overflow or a scaled yield that underflows to zero", () => {
    const tinyYield: Recipe = { ...compound, components: [compound.components[1], { ...compound.components[0], expectedYieldGrams: Number.MIN_VALUE }] };
    expect(calculateRecipe(tinyYield, [product, secondProduct])).toMatchObject({ ok: false });
    expect(calculateRecipe(tinyYield, [product, secondProduct], 1)).toMatchObject({ ok: false });
  });
});
