import Link from "next/link";
import type { Nutrition } from "./model";
import { formatAmount } from "./recipe-format";

export function RecipeHeader({ section = "recipes" }: { section?: "recipes" | "family" }) {
  return (
    <>
      <a className="recipe-skip" href="#recipe-content">Перейти к содержимому</a>
      <header className="recipe-header">
        <div className="recipe-header-inner">
          <Link className="recipe-brand" href="/recipes" aria-label="Порция — каталог рецептов">
            Порция
            <span className="recipe-brand-mark"><NavigationIcon kind="fork" /></span>
          </Link>
          <nav aria-label="Основная навигация">
            <Link className="recipe-nav-link" href="/recipes" aria-current={section === "recipes" ? "location" : undefined}><NavigationIcon kind="recipes" />Рецепты</Link>
            <Link className="recipe-nav-link" href="/family" aria-current={section === "family" ? "location" : undefined}><NavigationIcon kind="family" />Семья</Link>
          </nav>
          <p className="recipe-sidebar-note">Общая еда.<br />Своя порция каждому.</p>
        </div>
      </header>
    </>
  );
}

function NavigationIcon({ kind }: { kind: "fork" | "recipes" | "family" }) {
  return <svg className="recipe-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === "fork" ? <path d="M6 3v7m-3-7v5a3 3 0 0 0 6 0V3M6 11v10M16 3v18m0-18c5 2 5 8 0 9" />
      : kind === "recipes" ? <path d="M5 11a4 4 0 0 1-1-8 4 4 0 0 1 7-1 4 4 0 0 1 7 1 4 4 0 0 1 1 8v9H5zM5 15h14" transform="translate(0 1) scale(.95)" />
        : <><circle cx="9" cy="7" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3m1-17a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v3" /></>}
  </svg>;
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
      <p>AI-иллюстрации · <a href="/recipes/CREDITS.md">Изображения и источники</a></p>
    </footer>
  );
}
