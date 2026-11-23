import { describe, expect, it } from "vitest";
import { products, recipes } from "./catalog";
import { calculateRecipe } from "./calculate-recipe";
import { calculateMemberPortions } from "./calculate-member-portions";
import type { MemberRecipePortion, Recipe } from "./model";

const recipe = recipes.find((item) => item.id === "chicken-rice-vegetables")!;
const portion = (memberId: string, chicken = 1, rice = 1, vegetables = 1): MemberRecipePortion => ({
  memberId, components: [
    { componentId: "chicken", baseServings: chicken },
    { componentId: "rice", baseServings: rice },
    { componentId: "vegetables", baseServings: vegetables },
  ],
});

describe("manual component portions", () => {
  it("calculates independent plates and scales all ingredients, including oil", () => {
    const result = calculateMemberPortions(recipe, products, [portion("a", 1, 0.5, 1.5), portion("b", 0.5, 1, 0)]);
    if (!result.ok) throw new Error(result.reason);
    // Known catalog calories: chicken 266.6, rice 274.4, vegetables 70.3 per base serving.
    expect(result.members[0].nutrition.calories).toBeCloseTo(266.6 + 137.2 + 105.45);
    expect(result.members[1].nutrition.calories).toBeCloseTo(133.3 + 274.4);
    expect(result.components.map((component) => component.ingredients.map(({ ingredient }) => ingredient.quantity))).toEqual([[300, 7.5], [120], [300, 3.75]]);
    const base = calculateRecipe(recipe, products);
    if (!base.ok) throw new Error(base.reason);
    for (const key of ["calories", "protein", "fat", "carbohydrates"] as const) {
      const expected = base.components.reduce((sum, component) => sum + component.nutrition[key] * 0.75, 0);
      expect(result.members.reduce((sum, member) => sum + member.nutrition[key], 0)).toBeCloseTo(expected);
    }
  });

  it("changes only the edited member's rice and never mutates inputs", () => {
    const assignments = [portion("a"), portion("b")];
    const snapshot = structuredClone({ recipe, products, assignments });
    const before = calculateMemberPortions(recipe, products, assignments);
    const after = calculateMemberPortions(recipe, products, [portion("a", 1, 0.5, 1), assignments[1]]);
    if (!before.ok || !after.ok) throw new Error("Expected valid calculations");
    expect(after.members[1]).toEqual(before.members[1]);
    expect(after.components[0]).toEqual(before.components[0]);
    expect(after.components[2]).toEqual(before.components[2]);
    expect(after.members[0].nutrition.calories).toBeCloseTo(before.members[0].nutrition.calories - 137.2);
    expect({ recipe, products, assignments }).toEqual(snapshot);
    expect(calculateMemberPortions(recipe, products, assignments)).toEqual(before);
  });

  it("supports all-zero assignments and does not invent a cooked yield", () => {
    const result = calculateMemberPortions(recipe, products, [portion("a", 0, 0, 0)]);
    if (!result.ok) throw new Error(result.reason);
    expect(result.members[0].nutrition).toEqual({ calories: 0, protein: 0, fat: 0, carbohydrates: 0 });
    expect(result.components.every((component) => component.ingredients.every(({ ingredient }) => ingredient.quantity === 0))).toBe(true);
    expect(result.components[0]).not.toHaveProperty("expectedYieldGrams");
    expect(result.components[0]).not.toHaveProperty("per100g");
  });

  it("supports a mixed component and preserves product-specific conversions", () => {
    const mixed = recipes[0];
    const result = calculateMemberPortions(mixed, products, [{ memberId: "a", components: [{ componentId: mixed.components[0].id, baseServings: 0.5 }] }]);
    const base = calculateRecipe(mixed, products, 1);
    if (!result.ok || !base.ok) throw new Error("Expected valid calculations");
    expect(result.members[0].nutrition.calories).toBeCloseTo(base.total.calories / 2);
    expect(result.components[0].ingredients.find(({ product }) => product.id === "milk")?.ingredient).toMatchObject({ quantity: 125, unit: "ml" });
  });

  it.each([-1, NaN, Infinity])("rejects invalid quantities %s", (value) => {
    expect(calculateMemberPortions(recipe, products, [portion("a", 1, value)])).toMatchObject({ ok: false });
  });
  it("rejects missing, unknown and duplicate assignments instead of returning partial nutrition", () => {
    const assigned = portion("a");
    for (const components of [assigned.components.slice(1), [...assigned.components, assigned.components[0]], assigned.components.map(() => assigned.components[0]), assigned.components.map((item) => ({ ...item, componentId: "unknown" }))]) {
      expect(calculateMemberPortions(recipe, products, [{ memberId: "a", components }])).toMatchObject({ ok: false });
    }
    expect(calculateMemberPortions(recipe, products, [assigned, assigned])).toMatchObject({ ok: false });
    const duplicate: Recipe = { ...recipe, components: [recipe.components[0], recipe.components[0]] };
    expect(calculateMemberPortions(duplicate, products, [assigned])).toMatchObject({ ok: false });
  });
  it("does not replace missing food data or conversions with zero", () => {
    expect(calculateMemberPortions(recipe, [], [portion("a")])).toMatchObject({ ok: false });
    const incomplete = products.map((product) => ({ ...product, nutrition: product.nutrition.map((profile) => ({ ...profile, per100g: { calories: 1 } })) }));
    expect(calculateMemberPortions(recipe, incomplete, [portion("a")])).toMatchObject({ ok: false });
    const mixed = recipes[0];
    expect(calculateMemberPortions(mixed, products.map((product) => ({ ...product, gramsPerUnit: undefined })), [{ memberId: "a", components: [{ componentId: mixed.components[0].id, baseServings: 1 }] }])).toMatchObject({ ok: false });
  });
  it("rejects numeric overflow in nutrition and aggregate ingredients", () => {
    expect(calculateMemberPortions(recipe, products, [portion("a", Number.MIN_VALUE)])).toMatchObject({ ok: false });
    expect(calculateMemberPortions(recipe, products, [portion("a", Number.MAX_VALUE)])).toMatchObject({ ok: false });
    const zeroNutrition = products.map((product) => ({ ...product, nutrition: product.nutrition.map((profile) => ({ ...profile, per100g: { calories: 0, protein: 0, fat: 0, carbohydrates: 0 } })) }));
    expect(calculateMemberPortions(recipe, zeroNutrition, [portion("a", Number.MAX_VALUE), portion("b", Number.MAX_VALUE)])).toMatchObject({ ok: false });
  });
});
