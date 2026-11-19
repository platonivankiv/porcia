import Link from "next/link";
import type { Nutrition } from "./model";
import { formatAmount } from "./recipe-format";

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
