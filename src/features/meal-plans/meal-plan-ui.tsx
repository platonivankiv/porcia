import type { ReactNode } from "react";
import Link from "next/link";
import type { MealPlanTemplate } from "./model";
import { ImageCredits, RecipeHeader } from "../recipes/recipe-ui";
import styles from "./meal-plan-ui.module.scss";

export function MealPlanLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.app}>
      <RecipeHeader section="meal-plans" />
      <main className={styles.main} id="recipe-content">{children}</main>
      <div className={styles.footer}>
        <p>Общая еда. Своя порция каждому.</p>
        <ImageCredits className={styles.credits} />
      </div>
    </div>
  );
}

export function MealPlanNotice() {
  return (
    <aside className={styles.notice}>
      <svg className={styles.noticeIcon} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="16" cy="16" r="12" /><path d="M16 14v9m0-14v1" /></svg>
      <div><strong>Готовое меню</strong>
      <p>Индивидуальные граммовки и баланс КБЖУ пока не рассчитываются. Совместимость с аллергиями и ограничениями семьи не проверяется.</p></div>
    </aside>
  );
}

export function MealPlanUnavailable({ notFound = false }: { notFound?: boolean }) {
  return (
    <MealPlanLayout>
      <div className={`${styles.heading} ${styles.empty}`}>
        <h1>{notFound ? "Рацион не найден" : "Рацион временно недоступен"}</h1>
        <p>{notFound ? "В каталоге нет рациона с таким адресом." : "В данных меню обнаружена ошибка. Этот рацион нельзя открыть до исправления."}</p>
        <Link className={styles.button} href="/meal-plans">К каталогу рационов <span aria-hidden="true">→</span></Link>
      </div>
    </MealPlanLayout>
  );
}

export function formatDays(count: number) {
  const form = new Intl.PluralRules("ru-RU").select(count);
  return `${count} ${form === "one" ? "день" : form === "few" ? "дня" : "дней"}`;
}

export function MealPlanArrow() {
  return <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 14c6-.5 12-.5 20 0m-8-8 8 8-8 8" /></svg>;
}

export function formatDishes(template: MealPlanTemplate) {
  const count = template.days.reduce((total, day) => total + day.meals.reduce(
    (sum, meal) => sum + meal.items.filter((item) => item.kind === "recipe").length, 0,
  ), 0);
  const form = new Intl.PluralRules("ru-RU").select(count);
  return `${count} ${form === "one" ? "блюдо" : form === "few" ? "блюда" : "блюд"}`;
}
