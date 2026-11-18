import Link from "next/link";
import type { Nutrition, ProductState } from "./model";

export const stateLabels: Record<ProductState, string> = {
  dry: "Сухой продукт",
  raw: "Сырой продукт",
  ready: "Готовый к употреблению",
  cooked: "После приготовления",
};

const numberFormat = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 });
export const formatAmount = (value: number) => numberFormat.format(value);

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

export function NutritionFacts({ total, perServing }: { total: Nutrition; perServing: Nutrition }) {
  const rows = [
    { key: "calories", label: "Энергия", unit: "ккал" },
    { key: "protein", label: "Белки", unit: "г" },
    { key: "fat", label: "Жиры", unit: "г" },
    { key: "carbohydrates", label: "Углеводы", unit: "г" },
  ] as const;
  return (
    <table className="recipe-nutrition-table">
      <caption className="sr-only">КБЖУ всего рецепта и одной базовой порции</caption>
      <thead><tr><th scope="col">Показатель</th><th scope="col">Весь рецепт</th><th scope="col">1 порция</th></tr></thead>
      <tbody>{rows.map(({ key, label, unit }) => (
        <tr key={key}>
          <th scope="row">{label}</th>
          <td>{formatAmount(total[key])}<span>{unit}</span></td>
          <td>{formatAmount(perServing[key])}<span>{unit}</span></td>
        </tr>
      ))}</tbody>
    </table>
  );
}
