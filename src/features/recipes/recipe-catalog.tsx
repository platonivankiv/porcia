import styles from "./recipe-catalog.module.scss";
import Link from "next/link";
import { calculateRecipe } from "./calculate-recipe";
import type { Product, Recipe } from "./model";
import { RecipePhoto } from "./recipe-photo";
import { ImageCredits, RecipeHeader } from "./recipe-ui";
import { formatAmount, formatServings } from "./recipe-format";

const mealLabels = {
  breakfast: ["Завтрак", "завтрак", "завтрака", "завтраков"],
  lunch: ["Обед", "обед", "обеда", "обедов"],
  dinner: ["Ужин", "ужин", "ужина", "ужинов"],
  snack: ["Перекус", "перекус", "перекуса", "перекусов"],
} as const;
const pluralRules = new Intl.PluralRules("ru-RU");

export function RecipeCatalog({ recipes, products }: { recipes: readonly Recipe[]; products: readonly Product[] }) {
  const categories = [...new Set(recipes.map((recipe) => recipe.category))];
  const summary = categories.flatMap((category) => {
    if (!category) return [];
    const count = recipes.filter((recipe) => recipe.category === category).length;
    const form = pluralRules.select(count);
    const label = mealLabels[category][form === "one" ? 1 : form === "few" ? 2 : 3];
    return [`${count} ${label}`];
  }).join(" · ");

  return (
    <div className={styles.catalogApp}>
      <RecipeHeader />
      <main className={`${styles.container} ${styles.main}`} id="recipe-content">
        <div className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>Вкусная общая еда</p>
            <h1>Рецепты для семьи</h1>
            <p className={styles.intro}>{recipes.length === 3 ? "Три блюда. " : null}Ингредиенты и КБЖУ внутри.</p>
          </div>
        </div>
        {recipes.length === 0 ? (
          <section className={styles.empty} aria-labelledby="empty-heading">
            <h2 id="empty-heading">Рецептов пока нет</h2>
            <p>Когда в каталоге появятся рецепты, они будут доступны здесь.</p>
          </section>
        ) : (
          <>
            <div className={styles.summary}>
              <h2>Все рецепты <span>{String(recipes.length).padStart(2, "0")}</span></h2>
              <p>{summary}</p>
            </div>
            <ul className={styles.grid}>
              {recipes.map((recipe, index) => {
                const result = calculateRecipe(recipe, products);
                return (
                  <li key={recipe.id}>
                    <Link className={styles.card} href={`/recipes/${recipe.id}`}>
                      <div className={styles.cardMeta}>
                        <span className={styles.meal}>{recipe.category ? mealLabels[recipe.category][0] : "Рецепт"}</span>
                        {recipe.totalMinutes !== undefined && <span className={styles.time}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 2" /></svg>≈ {recipe.totalMinutes} мин</span>}
                      </div>
                      <RecipePhoto className={styles.photo} imageClassName={styles.photoImage} image={recipe.image} priority={index === 0} sizes="(max-width: 760px) 160px, (max-width: 1150px) 350px, 340px" />
                      <h3>{recipe.name}</h3>
                      <span className={"sr-only"}>Базовый объём рецепта. Порций: {formatServings(recipe.baseServings)}.</span>
                      <div className={styles.cardBottom}>
                        <div>{result.ok ? <><strong>{formatAmount(result.perServing.calories)}</strong> ккал<span>на 1 базовую порцию</span></> : <span className={styles.dataError}>Расчёт КБЖУ недоступен</span>}</div>
                        <span className={styles.cardArrow} aria-hidden="true">→</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </main>
      <div className={styles.catalogFooter}>
        {recipes.some((recipe) => recipe.image?.origin === "ai") && <ImageCredits className={styles.footer} />}
        <p>Время — оценка для базового объёма.</p>
      </div>
    </div>
  );
}
