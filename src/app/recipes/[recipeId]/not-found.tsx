import Link from "next/link";
import { RecipeHeader } from "@/features/recipes/recipe-ui";

export default function RecipeNotFound() {
  return (
    <div className="recipe-app">
      <RecipeHeader />
      <main className="recipe-container recipe-main" id="recipe-content">
        <div className="recipe-empty">
          <p className="recipe-eyebrow">404</p>
          <h1>Рецепт не найден</h1>
          <p>В каталоге нет рецепта с таким адресом. Выберите другое блюдо.</p>
          <Link className="recipe-button" href="/recipes">Открыть каталог</Link>
        </div>
      </main>
    </div>
  );
}
