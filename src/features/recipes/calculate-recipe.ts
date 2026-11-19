import type { Nutrition, Product, ProductNutrition, Recipe, RecipeComponent, RecipeIngredient } from "./model";

type CalculatedIngredient = Readonly<{
  ingredient: RecipeIngredient;
  product: Product;
  profile: ProductNutrition & Readonly<{ per100g: Nutrition }>;
  grams: number;
}>;

type CalculatedComponent = Readonly<{
  component: RecipeComponent;
  ingredients: readonly CalculatedIngredient[];
  nutrition: Nutrition;
}>;

export type RecipeCalculation =
  | Readonly<{
      ok: true;
      servings: number;
      total: Nutrition;
      perServing: Nutrition;
      expectedYieldGrams: number | null;
      per100g: Nutrition | null;
      components: readonly CalculatedComponent[];
    }>
  | Readonly<{ ok: false; reason: string }>;

const nutritionKeys = ["calories", "protein", "fat", "carbohydrates"] as const;

function isCompleteNutrition(value: Partial<Nutrition>): value is Nutrition {
  return nutritionKeys.every((key) => {
    const number = value[key];
    return typeof number === "number" && Number.isFinite(number) && number >= 0;
  });
}

function emptyNutrition() {
  return { calories: 0, protein: 0, fat: 0, carbohydrates: 0 };
}

function divideNutrition(value: Nutrition, divisor: number): Nutrition {
  return {
    calories: value.calories / divisor,
    protein: value.protein / divisor,
    fat: value.fat / divisor,
    carbohydrates: value.carbohydrates / divisor,
  };
}

/** Always calculates from the original recipe; never from a previous result. */
export function calculateRecipe(
  recipe: Recipe,
  products: readonly Product[],
  servings = recipe.baseServings,
): RecipeCalculation {
  if (!Number.isFinite(recipe.baseServings) || recipe.baseServings <= 0) {
    return { ok: false, reason: "Базовое количество порций должно быть положительным конечным числом." };
  }
  if (!Number.isFinite(servings) || servings <= 0) {
    return { ok: false, reason: "Количество порций должно быть положительным конечным числом." };
  }
  if (recipe.components.length === 0) {
    return { ok: false, reason: "В рецепте нет компонентов." };
  }

  const total = emptyNutrition();
  const scale = servings / recipe.baseServings;
  const components: CalculatedComponent[] = [];
  let expectedYieldGrams: number | null = 0;

  for (const component of recipe.components) {
    if (component.ingredients.length === 0) {
      return { ok: false, reason: `В компоненте «${component.name}» нет ингредиентов.` };
    }
    const nutrition = emptyNutrition();
    const ingredients: CalculatedIngredient[] = [];
    let componentGrams = 0;

    for (const originalIngredient of component.ingredients) {
      const ingredient = { ...originalIngredient, quantity: originalIngredient.quantity * scale };
      if (!Number.isFinite(originalIngredient.quantity) || originalIngredient.quantity < 0
        || !Number.isFinite(ingredient.quantity)) {
        return { ok: false, reason: `Некорректное количество ингредиента в компоненте «${component.name}».` };
      }
      const product = products.find((item) => item.id === ingredient.productId);
      if (!product) {
        return { ok: false, reason: `Продукт «${ingredient.productId}» отсутствует в справочнике.` };
      }
      const profile = product.nutrition.find((item) => item.state === ingredient.state);
      if (!profile || !isCompleteNutrition(profile.per100g)) {
        return { ok: false, reason: `Нет полных данных КБЖУ для «${product.name}» в указанном состоянии.` };
      }

      let grams = ingredient.quantity;
      if (ingredient.unit !== "g") {
        const conversion = product.gramsPerUnit?.find(
          (item) => item.state === ingredient.state && item.unit === ingredient.unit,
        );
        if (!conversion || !Number.isFinite(conversion.grams) || conversion.grams <= 0) {
          return { ok: false, reason: `Нет корректного перевода единицы в граммы для «${product.name}».` };
        }
        grams *= conversion.grams;
      }
      componentGrams += grams;
      for (const key of nutritionKeys) nutrition[key] += grams / 100 * profile.per100g[key];
      ingredients.push({ ingredient, product, profile: { ...profile, per100g: profile.per100g }, grams });
    }

    if (!Number.isFinite(componentGrams) || componentGrams <= 0 || !isCompleteNutrition(nutrition)) {
      return { ok: false, reason: `Невозможно рассчитать компонент «${component.name}»: проверьте количества и КБЖУ.` };
    }
    const yieldGrams = component.expectedYieldGrams;
    if (yieldGrams !== undefined && (!Number.isFinite(yieldGrams) || yieldGrams <= 0)) {
      return { ok: false, reason: `Некорректный ожидаемый выход компонента «${component.name}».` };
    }
    expectedYieldGrams = expectedYieldGrams !== null && yieldGrams !== undefined
      ? expectedYieldGrams + yieldGrams * scale
      : null;
    for (const key of nutritionKeys) total[key] += nutrition[key];
    components.push({ component, ingredients, nutrition });
  }

  const perServing = divideNutrition(total, servings);
  const per100g = expectedYieldGrams === null ? null : divideNutrition(total, expectedYieldGrams / 100);
  if (!isCompleteNutrition(total) || !isCompleteNutrition(perServing)
    || (per100g !== null && !isCompleteNutrition(per100g))
    || (expectedYieldGrams !== null && !Number.isFinite(expectedYieldGrams))) {
    return { ok: false, reason: "Результат выходит за допустимый числовой диапазон." };
  }
  return { ok: true, servings, total, perServing, per100g, expectedYieldGrams, components };
}
