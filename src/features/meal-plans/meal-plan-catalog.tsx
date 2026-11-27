import Link from "next/link";
import Image from "next/image";
import type { Product, Recipe } from "../recipes/model";
import { isMealPlanTemplate } from "./validation";
import { RecipePhoto } from "../recipes/recipe-photo";
import { formatDays, formatDishes, MealPlanArrow, MealPlanLayout, MealPlanNotice } from "./meal-plan-ui";
import styles from "./meal-plan-ui.module.scss";

export function MealPlanCatalog({ templates, recipes, products }: {
  templates: readonly unknown[];
  recipes: readonly Recipe[];
  products: readonly Product[];
}) {
  const validTemplates = templates.filter((template) => isMealPlanTemplate(template, recipes, products));
  return (
    <MealPlanLayout>
      <div className={styles.heading}>
        <p className={styles.eyebrow}>Вкусная общая еда</p>
        <h1>Готовые рационы</h1>
        <Image className={styles.headingArt} src="/meal-plans/tomato.svg" alt="" aria-hidden="true" width={180} height={140} />
        <p className={styles.intro}>Домашние блюда, уже собранные в меню по дням.</p>
      </div>
      <div className={styles.summary}>
        <p className={styles.summaryLabel}>Все рационы <span>{String(validTemplates.length).padStart(2, "0")}</span></p>
        <span>Меню на несколько дней</span>
      </div>
      {templates.length === 0 && <section className={styles.empty} aria-labelledby="empty-heading">
        <h2 id="empty-heading">Рационов пока нет</h2>
        <p>Когда в каталоге появятся готовые меню, они будут здесь.</p>
      </section>}
      <ul className={styles.catalogList}>
        {templates.map((template, index) => {
          if (!isMealPlanTemplate(template, recipes, products)) return (
            <li key={`unavailable-${index}`} className={styles.empty}>
              <h2>Рацион временно недоступен</h2>
              <p>В данных меню обнаружена ошибка. Этот рацион нельзя открыть до исправления.</p>
            </li>
          );
          const menuRecipes = template.days.flatMap((day) => day.meals.flatMap((meal) => meal.items.flatMap(
            (item) => item.kind === "recipe" ? recipes.filter((recipe) => recipe.id === item.recipeId) : [],
          )));
          // The approved cover shows both lunches, the first breakfast and the last dinner.
          const cover = [1, 4, 0, 5, 2, 3].flatMap((index) => menuRecipes[index] ? [menuRecipes[index]] : []).slice(0, 4);
          return (
            <li key={template.id}>
              <article className={styles.planCard}>
                <div className={styles.cardCopy}>
                  <div className={styles.cardStats}><span className={styles.pill}>{formatDays(template.days.length)}</span><span className={styles.statBadge}>{formatDishes(template)}</span></div>
                  <h2>{template.name}</h2>
                  <p>{template.description.split(/(?<=[.!?])\s/)[0]}</p>
                  <Link className={styles.button} href={`/meal-plans/${encodeURIComponent(template.id)}`}>Посмотреть рацион <span className={styles.buttonArrow} aria-hidden="true"><MealPlanArrow /></span></Link>
                </div>
                <div className={styles.foodWall} aria-label="Блюда из рациона">
                  {cover.map((recipe, index) => <RecipePhoto key={index} className={styles.photo} image={recipe.image} priority={index === 0} sizes="(max-width: 760px) 45vw, 22vw" />)}
                </div>
              </article>
            </li>
          );
        })}
      </ul>
      <MealPlanNotice />
    </MealPlanLayout>
  );
}
