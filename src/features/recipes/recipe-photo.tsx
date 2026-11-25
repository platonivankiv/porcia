import styles from "./recipe-photo.module.scss";
import Image from "next/image";
import type { Recipe } from "./model";

export function RecipePhoto({
  image,
  priority = false,
  className = "",
  imageClassName,
  sizes = "(max-width: 700px) calc(100vw - 40px), (max-width: 1200px) 50vw, 560px",
}: { image: Recipe["image"]; priority?: boolean; className?: string; imageClassName?: string; sizes?: string }) {
  return (
    <div className={`${styles.photo} ${className}`}>
      {image ? (
        <Image
          className={imageClassName}
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          preload={priority}
        />
      ) : (
        <span className={styles.photoEmpty}>Изображения пока нет</span>
      )}
    </div>
  );
}
