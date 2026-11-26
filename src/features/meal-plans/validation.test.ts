import { describe, expect, it } from "vitest";
import { products, recipes } from "../recipes/catalog";
import type { MealPlanTemplate } from "./model";
import { isMealPlanTemplate } from "./validation";

// Structural fixture, not a complete menu for publication or dietary advice.
const template = {
  id: "structure-example",
  name: "Пример структуры",
  description: "Проверка ссылок на существующие рецепты и продукты.",
  days: [
    { id: "first", meals: [{ id: "morning", label: "Завтрак", items: [
      { id: "main", kind: "recipe", recipeId: "banana-porridge" },
      { id: "fruit", kind: "product", productId: "banana", state: "raw" },
    ] }] },
    { id: "second", meals: [{ id: "evening", label: "Поздний ужин", items: [
      { id: "main", kind: "recipe", recipeId: "chicken-rice-vegetables" },
    ] }] },
  ],
} satisfies MealPlanTemplate;

describe("meal plan template validation", () => {
  it("accepts ordered days and meals referencing existing recipes and product states", () => {
    expect(isMealPlanTemplate(template, recipes, products)).toBe(true);
  });

  it.each([
    { id: "missing", kind: "recipe", recipeId: "absent-recipe" },
    { id: "missing", kind: "product", productId: "absent-product", state: "raw" },
    { id: "missing", kind: "product", productId: "banana", state: "cooked" },
  ])("rejects an unresolved food reference: $kind $id", (item) => {
    const input = { ...template, days: [{ id: "day", meals: [{ id: "meal", label: "Еда", items: [item] }] }] };
    expect(isMealPlanTemplate(input, recipes, products)).toBe(false);
  });

  it("rejects missing product states inside a referenced recipe", () => {
    expect(isMealPlanTemplate(template, recipes, products.filter((product) => product.id !== "milk"))).toBe(false);
    const withoutDryRice = products.map((product) => product.id === "white-rice" ? { ...product, nutrition: [] } : product);
    expect(isMealPlanTemplate(template, recipes, withoutDryRice)).toBe(false);
  });

  it("rejects ambiguous referenced catalog records", () => {
    expect(isMealPlanTemplate(template, [...recipes, recipes[0]], products)).toBe(false);
    expect(isMealPlanTemplate(template, recipes, [...products, products[0]])).toBe(false);
    const duplicateState = products.map((product) => product.id === "banana"
      ? { ...product, nutrition: [...product.nutrition, product.nutrition[0]] } : product);
    expect(isMealPlanTemplate(template, recipes, duplicateState)).toBe(false);
  });

  it.each(["day", "meal", "item"])("rejects duplicate sibling %s identifiers", (level) => {
    const input = structuredClone(template);
    if (level === "day") input.days.push(structuredClone(input.days[0]));
    if (level === "meal") input.days[0].meals.push(structuredClone(input.days[0].meals[0]));
    if (level === "item") input.days[0].meals[0].items.push(structuredClone(input.days[0].meals[0].items[0]));
    expect(isMealPlanTemplate(input, recipes, products)).toBe(false);
  });

  it.each(["recipe", "product"])("rejects a %s position containing both references", (kind) => {
    const item = { id: "item", kind, recipeId: "banana-porridge", productId: "banana", state: "raw" };
    const input = { ...template, days: [{ id: "day", meals: [{ id: "meal", label: "Еда", items: [item] }] }] };
    expect(isMealPlanTemplate(input, recipes, products)).toBe(false);
  });

  it.each([
    null, undefined, [], "menu", {},
    { ...template, id: " " }, { ...template, name: "" }, { ...template, description: null },
    { ...template, days: [] }, { ...template, days: {} }, { ...template, days: [null] },
    { ...template, days: Array(1) },
    { ...template, days: [{ id: " ", meals: template.days[0].meals }] },
    { ...template, days: [{ id: "day", meals: [{ ...template.days[0].meals[0], id: "" }] }] },
    { ...template, days: [{ id: "day", meals: [] }] },
    { ...template, days: [{ id: "day", meals: "breakfast" }] },
    { ...template, days: [{ id: "day", meals: [null] }] },
    { ...template, days: [{ id: "day", meals: [{ ...template.days[0].meals[0], label: " " }] }] },
    { ...template, days: [{ id: "day", meals: [{ id: "meal", label: " ", items: [] }] }] },
  ])("rejects malformed or empty structure %#", (input: unknown) => {
    expect(isMealPlanTemplate(input, recipes, products)).toBe(false);
  });

  it.each([
    [], null, {}, [null], ["banana"],
    [{ id: " ", kind: "recipe", recipeId: "banana-porridge" }],
    [{ id: "item", kind: "unknown", recipeId: "banana-porridge" }],
    [{ id: "item", kind: "recipe" }],
    [{ id: "item", kind: "product", productId: "banana" }],
    [{ id: "item", kind: "product", productId: "banana", state: "unknown" }],
  ])("rejects malformed positions %#", (items: unknown) => {
    const input = { ...template, days: [{ id: "day", meals: [{ id: "meal", label: "Еда", items }] }] };
    expect(isMealPlanTemplate(input, recipes, products)).toBe(false);
  });

  it("preserves order and permits repeated recipes, meal labels and locally scoped identifiers", () => {
    const input = structuredClone(template);
    input.days.reverse();
    input.days[1].meals = structuredClone(input.days[0].meals);
    input.days[0].meals.push({ ...structuredClone(input.days[0].meals[0]), id: "another" });
    input.days[0].meals[0].items.push({ ...input.days[0].meals[0].items[0], id: "another" });
    const before = structuredClone({ input, recipes, products });
    expect(isMealPlanTemplate(input, recipes, products)).toBe(true);
    expect({ input, recipes, products }).toEqual(before);
    expect(input.days.map((day) => day.id)).toEqual(["second", "first"]);
  });

  it("ignores ambiguity in unused catalog entries", () => {
    const unusedRecipe = { ...recipes[0], id: "unused-recipe" };
    const unusedProduct = { ...products[0], id: "unused-product" };
    expect(isMealPlanTemplate(template,
      [...recipes, unusedRecipe, unusedRecipe],
      [...products, unusedProduct, unusedProduct],
    )).toBe(true);
  });

  it("accepts recipes without cooked yields", () => {
    const withoutYields = recipes.map((recipe) => ({
      ...recipe, components: recipe.components.map((component) => ({ ...component, expectedYieldGrams: undefined })),
    }));
    expect(isMealPlanTemplate(template, withoutYields, products)).toBe(true);
  });

  it("does not equate valid references with complete nutrition or unit conversions", () => {
    const incompleteNutrition = products.map((product) => ({
      ...product, nutrition: product.nutrition.map((profile) => ({ ...profile, per100g: {} })),
    }));
    expect(isMealPlanTemplate(template, recipes, incompleteNutrition)).toBe(true);
    const withoutConversions = products.map((product) => ({ ...product, gramsPerUnit: undefined }));
    expect(isMealPlanTemplate(template, recipes, withoutConversions)).toBe(true);
    expect(isMealPlanTemplate(template, recipes, products)).toBe(true);
  });
});
