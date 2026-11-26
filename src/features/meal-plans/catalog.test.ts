import { describe, expect, it } from "vitest";
import { products, recipes } from "../recipes/catalog";
import { mealPlanTemplates } from "./catalog";
import { isMealPlanTemplate } from "./validation";

describe("first prepared meal plan template", () => {
  it("contains the approved two-day menu without family assignments", () => {
    expect(mealPlanTemplates).toHaveLength(1);
    const template = mealPlanTemplates[0];
    expect(template.name).toBe("Домашние блюда на два дня");
    expect(template.days.map((day) => day.meals.map((meal) => ({ label: meal.label, items: meal.items })))).toEqual([
      [
        { label: "Завтрак", items: [{ id: "main", kind: "recipe", recipeId: "banana-porridge" }] },
        { label: "Обед", items: [{ id: "main", kind: "recipe", recipeId: "chicken-rice-vegetables" }] },
        { label: "Ужин", items: [{ id: "main", kind: "recipe", recipeId: "lentil-vegetable-stew" }] },
      ],
      [
        { label: "Завтрак", items: [{ id: "main", kind: "recipe", recipeId: "banana-yoghurt" }] },
        { label: "Обед", items: [{ id: "main", kind: "recipe", recipeId: "pasta-beef-tomato" }] },
        { label: "Ужин", items: [{ id: "main", kind: "recipe", recipeId: "cod-potatoes-broccoli" }] },
      ],
    ]);
    expect(isMealPlanTemplate(template, recipes, products)).toBe(true);
  });

  it("rejects broken recipe and ingredient references in the real menu", () => {
    const template = mealPlanTemplates[0];
    for (const recipe of recipes) {
      expect(isMealPlanTemplate(template, recipes.filter((item) => item.id !== recipe.id), products)).toBe(false);
    }
    expect(isMealPlanTemplate(template, recipes, products.filter((item) => item.id !== "red-lentils"))).toBe(false);
    expect(new Set(mealPlanTemplates.map((template) => template.id)).size).toBe(mealPlanTemplates.length);
  });
});
