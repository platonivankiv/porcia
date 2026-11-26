import type { MealPlanTemplate } from "./model";

export const mealPlanTemplates: readonly MealPlanTemplate[] = [
  {
    id: "home-meals-two-days",
    name: "Домашние блюда на два дня",
    description: "Шесть домашних блюд на два дня. Индивидуальные количества и баланс КБЖУ ещё не рассчитаны; меню не означает приготовление всей еды заранее.",
    days: [
      {
        id: "day-1",
        meals: [
          { id: "breakfast", label: "Завтрак", items: [{ id: "main", kind: "recipe", recipeId: "banana-porridge" }] },
          { id: "lunch", label: "Обед", items: [{ id: "main", kind: "recipe", recipeId: "chicken-rice-vegetables" }] },
          { id: "dinner", label: "Ужин", items: [{ id: "main", kind: "recipe", recipeId: "lentil-vegetable-stew" }] },
        ],
      },
      {
        id: "day-2",
        meals: [
          { id: "breakfast", label: "Завтрак", items: [{ id: "main", kind: "recipe", recipeId: "banana-yoghurt" }] },
          { id: "lunch", label: "Обед", items: [{ id: "main", kind: "recipe", recipeId: "pasta-beef-tomato" }] },
          { id: "dinner", label: "Ужин", items: [{ id: "main", kind: "recipe", recipeId: "cod-potatoes-broccoli" }] },
        ],
      },
    ],
  },
];
