import Link from "next/link";
import type { Nutrition, Product, ProductState, Recipe, RecipeIngredient } from "./model";

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
const quantityFormat = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 20 });
const pluralRules = new Intl.PluralRules("ru-RU");
export const formatAmount = (value: number) => numberFormat.format(value);

export function formatIngredientQuantity(ingredient: RecipeIngredient, product: Product) {
  const conversion = product.gramsPerUnit?.find(
    (item) => item.state === ingredient.state && item.unit === ingredient.unit,
  );
  if (ingredient.unit === "piece" && conversion?.pieceLabels) {
    if (!Number.isInteger(ingredient.quantity)) {
      return `${quantityFormat.format(ingredient.quantity)} шт. (${conversion.pieceLabels[0]})`;
    }
    const form = pluralRules.select(ingredient.quantity);
    const label = conversion.pieceLabels[form === "one" ? 0 : form === "few" ? 1 : 2];
    return `${quantityFormat.format(ingredient.quantity)} ${label}`;
  }
  const unit = { g: "г", ml: "мл", piece: "шт." }[ingredient.unit];
  return `${quantityFormat.format(ingredient.quantity)} ${unit}`;
}

export function recipeCategoryLabel(category: Recipe["category"]) {
  return category ? categoryLabels[category] : "Рецепты";
}

export function RecipeHeader() {
  return (
    <>
      <a className="recipe-skip" href="#recipe-content">Перейти к содержимому</a>
      <header className="recipe-header">
        <div className="recipe-container recipe-header-inner">
          <Link className="recipe-brand" href="/recipes" aria-label="Порция — каталог рецептов">
            <span className="recipe-brand-mark" aria-hidden="true">п</span>
            Порция<span className="recipe-brand-note">Семейное питание</span>
          </Link>
          <nav aria-label="Основная навигация">
            <Link className="recipe-nav-link" href="/recipes">Рецепты</Link>
          </nav>
        </div>
      </header>
    </>
  );
}

export function NutritionFacts({ value, label }: { value: Nutrition; label: string }) {
  const rows = [
    { key: "calories", label: "Энергия", unit: "ккал" },
    { key: "protein", label: "Белки", unit: "г" },
    { key: "fat", label: "Жиры", unit: "г" },
    { key: "carbohydrates", label: "Углеводы", unit: "г" },
  ] as const;
  return (
    <dl className="recipe-nutrients" aria-label={label}>
      {rows.map(({ key, label, unit }) => (
        <div key={key}>
          <dt>{label}</dt>
          <dd><strong>{formatAmount(value[key])}</strong> <span>{unit}</span></dd>
        </div>
      ))}
    </dl>
  );
}

export function ImageCredits() {
  return (
    <footer className="recipe-container recipe-footer">
      <p>Изображения блюд — AI-иллюстрации. <a href="/recipes/CREDITS.md">Происхождение изображений</a></p>
    </footer>
  );
}
