import Image from "next/image";
import type { Recipe } from "./model";

export function RecipePhoto({
  image,
  priority = false,
  sizes = "(max-width: 700px) calc(100vw - 40px), (max-width: 1200px) 50vw, 560px",
}: { image: Recipe["image"]; priority?: boolean; sizes?: string }) {
  return (
    <div className="recipe-photo">
      {image ? (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          preload={priority}
        />
      ) : (
        <span className="recipe-photo-empty">Изображения пока нет</span>
      )}
    </div>
  );
}
