import Link from "next/link";
import type { Product, Recipe } from "../recipes/model";
import { isMealPlanTemplate } from "./validation";
import { RecipePhoto } from "../recipes/recipe-photo";
import { stateLabels } from "../recipes/recipe-format";
import { formatDays, MealPlanLayout, MealPlanNotice, MealPlanUnavailable } from "./meal-plan-ui";
import styles from "./meal-plan-ui.module.scss";

export function MealPlanDetails({ template, recipes, products }: {
  template: unknown;
  recipes: readonly Recipe[];
  products: readonly Product[];
}) {
  if (!isMealPlanTemplate(template, recipes, products)) return <MealPlanUnavailable />;
  return (
    <MealPlanLayout>
      <Link className={styles.back} href="/meal-plans">← Все рационы</Link>
      <div className={`${styles.heading} ${styles.detailHeading}`}>
        <p className={styles.eyebrow}>Готовый рацион · {formatDays(template.days.length)}</p>
        <h1>{template.name}</h1>
        <p className={styles.intro}>{template.description}</p>
      </div>
      <MealPlanNotice />
      <div className={styles.menuHeading}>
        <h2 id="menu-heading">Меню по дням</h2>
        <p>Откройте блюдо, чтобы посмотреть рецепт</p>
      </div>
      <div className={styles.days} aria-labelledby="menu-heading">
        {template.days.map((day, index) => (
          <section className={styles.day} key={day.id} aria-labelledby={`day-heading-${day.id}`} id={`day-${day.id}`}>
            <div className={styles.dayHeader}>
              <h3 id={`day-heading-${day.id}`}>День {index + 1}</h3>
              <span>{day.meals.map((meal) => meal.label).join(" · ")}</span>
            </div>
            <ol className={styles.meals}>
              {day.meals.map((meal) => (
                <li key={meal.id}>
                  <h4>{meal.label}</h4>
                  {meal.items.map((item) => {
                    if (item.kind === "product") {
                      const product = products.find((product) => product.id === item.productId)!;
                      return <div className={styles.product} key={item.id}><h5>{product.name}</h5><p>{stateLabels[item.state]}</p></div>;
                    }
                    const recipe = recipes.find((recipe) => recipe.id === item.recipeId)!;
                    return (
                      <Link className={styles.dish} key={item.id} href={`/recipes/${encodeURIComponent(recipe.id)}`}>
                        <RecipePhoto className={styles.photo} image={recipe.image} sizes="(max-width: 760px) 40vw, (max-width: 1150px) 40vw, 20vw" />
                        <div className={styles.dishCopy}>
                          <h5>{recipe.name}</h5>
                          {recipe.totalMinutes !== undefined && <p className={styles.time}>≈ {recipe.totalMinutes} мин</p>}
                          <span className={styles.recipeLink}>Открыть рецепт <span aria-hidden="true">↗</span></span>
                        </div>
                      </Link>
                    );
                  })}
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
      <p className={styles.timeNote}>Время — оценка для базового объёма отдельного рецепта.</p>
    </MealPlanLayout>
  );
}
