import type { ReactNode } from "react";
import Link from "next/link";
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
      <strong>Пока только меню</strong>
      <p>Индивидуальные граммовки и баланс КБЖУ пока не рассчитываются. Совместимость с аллергиями и ограничениями семьи не проверяется.</p>
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
