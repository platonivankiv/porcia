import type { Product, ProductState, Recipe, RecipeIngredient } from "./model";

export const stateLabels: Record<ProductState, string> = {
  dry: "Сухой продукт",
  raw: "Сырой продукт",
  ready: "Готовый к употреблению",
  cooked: "После приготовления",
};

export const categoryLabels = {
  breakfast: "Завтраки", lunch: "Обеды", dinner: "Ужины", snack: "Перекусы",
} as const;

const numberFormat = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 });
const servingsFormat = new Intl.NumberFormat("ru-RU", { maximumSignificantDigits: 21 });
const quantityFormat = new Intl.NumberFormat("ru-RU", { maximumSignificantDigits: 12 });
const pluralRules = new Intl.PluralRules("ru-RU");
export const formatAmount = (value: number) => numberFormat.format(value);
export const formatServings = (value: number) => servingsFormat.format(value);

export function formatIngredientQuantity(ingredient: RecipeIngredient, product: Product) {
  const displayedQuantity = Number(ingredient.quantity.toPrecision(12));
  const amount = `${displayedQuantity !== ingredient.quantity ? "≈ " : ""}${quantityFormat.format(displayedQuantity)}`;
  const conversion = product.gramsPerUnit?.find(
    (item) => item.state === ingredient.state && item.unit === ingredient.unit,
  );
  if (ingredient.unit === "piece" && conversion?.pieceLabels) {
    if (!Number.isInteger(ingredient.quantity)) {
      return `${amount} шт. (${conversion.pieceLabels[0]})`;
    }
    const form = pluralRules.select(ingredient.quantity);
    const label = conversion.pieceLabels[form === "one" ? 0 : form === "few" ? 1 : 2];
    return `${amount} ${label}`;
  }
  const unit = { g: "г", ml: "мл", piece: "шт." }[ingredient.unit];
  return `${amount} ${unit}`;
}

export function recipeCategoryLabel(category: Recipe["category"]) {
  return category ? categoryLabels[category] : "Рецепты";
}
