import type { Product, Recipe } from "../recipes/model";
import type { MealPlanTemplate } from "./model";

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonempty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function identifiedList(value: unknown): value is Record<string, unknown>[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  const ids = new Set<string>();
  for (const item of value) {
    if (!record(item) || !nonempty(item.id) || ids.has(item.id)) return false;
    ids.add(item.id);
  }
  return true;
}

/** Validates template structure and catalog references, not suitability for a family. */
export function isMealPlanTemplate(
  value: unknown,
  recipes: readonly Recipe[],
  products: readonly Product[],
): value is MealPlanTemplate {
  function productState(productId: unknown, state: unknown): boolean {
    const matches = products.filter((product) => product.id === productId);
    return matches.length === 1
      && matches[0].nutrition.filter((profile) => profile.state === state).length === 1;
  }
  function recipeReference(recipeId: string): boolean {
    const matches = recipes.filter((recipe) => recipe.id === recipeId);
    return matches.length === 1 && matches[0].components.every((component) => component.ingredients.every(
      (ingredient) => productState(ingredient.productId, ingredient.state),
    ));
  }
  if (!record(value) || !nonempty(value.id) || !nonempty(value.name)
    || !nonempty(value.description) || !identifiedList(value.days)) return false;
  return value.days.every((day) => identifiedList(day.meals)
    && day.meals.every((meal) => nonempty(meal.label) && identifiedList(meal.items)
      && meal.items.every((item) =>
        (item.kind === "recipe" && !("productId" in item) && !("state" in item)
          && nonempty(item.recipeId) && recipeReference(item.recipeId))
        || (item.kind === "product" && !("recipeId" in item)
          && nonempty(item.productId) && productState(item.productId, item.state)),
      ),
    ),
  );
}
