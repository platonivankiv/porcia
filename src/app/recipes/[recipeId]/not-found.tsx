import shell from "@/shared/ui/app-shell.module.scss";
import styles from "@/features/recipes/recipe-ui.module.scss";
import Link from "next/link";
import { RecipeHeader } from "@/features/recipes/recipe-ui";

export default function RecipeNotFound() {
  return (
    <div className={shell.app}>
      <RecipeHeader />
      <main className={`${shell.container} ${shell.main}`} id="recipe-content">
        <div className={styles.empty}>
          <p className={styles.eyebrow}>404</p>
          <h1>Рецепт не найден</h1>
          <p>В каталоге нет рецепта с таким адресом. Выберите другое блюдо.</p>
          <Link className={styles.button} href="/recipes">Открыть каталог</Link>
        </div>
      </main>
    </div>
  );
}
