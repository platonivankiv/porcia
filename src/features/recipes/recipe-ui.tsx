import styles from "./recipe-ui.module.scss";
import shell from "../../shared/ui/app-shell.module.scss";
import Link from "next/link";
import type { Nutrition } from "./model";
import { formatAmount } from "./recipe-format";

export function RecipeHeader({ section = "recipes" }: { section?: "recipes" | "meal-plans" | "family" }) {
  return (
    <>
      <a className={shell.skip} href="#recipe-content">Перейти к содержимому</a>
      <header className={shell.header}>
        <div className={shell.headerInner}>
          <Link className={shell.brand} href="/recipes" aria-label="Порция — каталог рецептов">
            Порция
            <span className={shell.brandMark}><NavigationIcon kind="fork" /></span>
          </Link>
          <nav aria-label="Основная навигация">
            <Link className={shell.navLink} href="/recipes" aria-current={section === "recipes" ? "location" : undefined}><NavigationIcon kind="recipes" />Рецепты</Link>
            <Link className={shell.navLink} href="/meal-plans" aria-current={section === "meal-plans" ? "location" : undefined}><NavigationIcon kind="meal-plans" />Рационы</Link>
            <Link className={shell.navLink} href="/family" aria-current={section === "family" ? "location" : undefined}><NavigationIcon kind="family" />Семья</Link>
          </nav>
          <p className={shell.sidebarNote}>Общая еда.<br />Своя порция каждому.</p>
        </div>
      </header>
    </>
  );
}

function NavigationIcon({ kind }: { kind: "fork" | "recipes" | "meal-plans" | "family" }) {
  return <svg className={shell.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === "fork" ? <path d="M6 3v7m-3-7v5a3 3 0 0 0 6 0V3M6 11v10M16 3v18m0-18c5 2 5 8 0 9" />
      : kind === "recipes" ? <path d="M5 11a4 4 0 0 1-1-8 4 4 0 0 1 7-1 4 4 0 0 1 7 1 4 4 0 0 1 1 8v9H5zM5 15h14" transform="translate(0 1) scale(.95)" />
        : kind === "meal-plans" ? <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M7 2v4m10-4v4M3 10h18m-13 4h2m4 0h2m-8 3h2" /></>
          : <><circle cx="9" cy="7" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3m1-17a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v3" /></>}
  </svg>;
}

export function NutritionFacts({ value, label, className = "" }: { value: Nutrition; label: string; className?: string }) {
  const rows = [
    { key: "calories", label: "Энергия", unit: "ккал" },
    { key: "protein", label: "Белки", unit: "г" },
    { key: "fat", label: "Жиры", unit: "г" },
    { key: "carbohydrates", label: "Углеводы", unit: "г" },
  ] as const;
  return (
    <dl className={`${styles.nutrients} ${className}`} aria-label={label}>
      {rows.map(({ key, label, unit }) => (
        <div key={key}>
          <dt>{label}</dt>
          <dd><strong>{formatAmount(value[key])}</strong> <span>{unit}</span></dd>
        </div>
      ))}
    </dl>
  );
}

export function ImageCredits({ className = "" }: { className?: string }) {
  return (
    <footer className={`${styles.container} ${styles.footer} ${className}`}>
      <p>AI-иллюстрации · <a href="/recipes/CREDITS.md">Изображения и источники</a></p>
    </footer>
  );
}
