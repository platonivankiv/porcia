import { calculateRecipe } from "./calculate-recipe";
import type { MemberRecipePortion, Nutrition, Product, Recipe, RecipeIngredient } from "./model";

const keys = ["calories", "protein", "fat", "carbohydrates"] as const;
const emptyNutrition = (): Nutrition => ({ calories: 0, protein: 0, fat: 0, carbohydrates: 0 });

export type MemberPortionsCalculation =
  | Readonly<{ ok: false; reason: string }>
  | Readonly<{
      ok: true;
      members: readonly Readonly<{ memberId: string; nutrition: Nutrition }>[];
      components: readonly Readonly<{
        componentId: string;
        baseServings: number;
        ingredients: readonly Readonly<{ ingredient: RecipeIngredient; product: Product }>[];
      }>[];
    }>;

/** Assignments scale whole components; recipe composition and daily targets are not changed. */
export function calculateMemberPortions(
  recipe: Recipe,
  products: readonly Product[],
  portions: readonly MemberRecipePortion[],
): MemberPortionsCalculation {
  const base = calculateRecipe(recipe, products);
  if (!base.ok) return base;
  const componentIds = new Set(recipe.components.map((component) => component.id));
  if (componentIds.size !== recipe.components.length || new Set(portions.map((portion) => portion.memberId)).size !== portions.length) {
    return { ok: false, reason: "Идентификаторы компонентов и участников не должны повторяться." };
  }
  const totals = new Map(recipe.components.map((component) => [component.id, 0]));
  const members: { memberId: string; nutrition: Nutrition }[] = [];
  for (const portion of portions) {
    if (!portion.memberId || portion.components.length !== componentIds.size
      || new Set(portion.components.map((item) => item.componentId)).size !== componentIds.size
      || portion.components.some((item) => !componentIds.has(item.componentId) || !Number.isFinite(item.baseServings) || item.baseServings < 0)) {
      return { ok: false, reason: "Задайте корректное количество каждого компонента участника, включая 0 для отсутствующего." };
    }
    const nutrition = { ...emptyNutrition() };
    for (const assignment of portion.components) {
      const component = base.components.find((item) => item.component.id === assignment.componentId)!;
      const scale = assignment.baseServings / recipe.baseServings;
      if (assignment.baseServings > 0 && scale === 0) return { ok: false, reason: "Количество порций выходит за допустимый числовой диапазон." };
      for (const key of keys) nutrition[key] += component.nutrition[key] * scale;
      totals.set(assignment.componentId, totals.get(assignment.componentId)! + assignment.baseServings);
    }
    if (keys.some((key) => !Number.isFinite(nutrition[key]))) return { ok: false, reason: "КБЖУ выходят за допустимый числовой диапазон." };
    members.push({ memberId: portion.memberId, nutrition });
  }
  const components = base.components.map(({ component, ingredients }) => {
    const baseServings = totals.get(component.id)!;
    return {
      componentId: component.id, baseServings,
      ingredients: ingredients.map(({ ingredient, product }) => ({
        product, ingredient: { ...ingredient, quantity: ingredient.quantity * (baseServings / recipe.baseServings) },
      })),
    };
  });
  if (components.some((component) => !Number.isFinite(component.baseServings)
    || component.ingredients.some(({ ingredient }) => !Number.isFinite(ingredient.quantity)))) {
    return { ok: false, reason: "Количество ингредиентов выходит за допустимый числовой диапазон." };
  }
  return { ok: true, members, components };
}
