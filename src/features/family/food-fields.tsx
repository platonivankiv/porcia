import styles from "./family-profiles.module.scss";
import { useState } from "react";
import type { FoodSubject } from "./model";
import type { Product } from "../recipes/model";

export function FoodFields({ prefix, label, subjects, products, error }: {
  prefix: string;
  label: string;
  subjects: readonly FoodSubject[];
  products: readonly Pick<Product, "id" | "name">[];
  error?: string;
}) {
  const [selected, setSelected] = useState(() => subjects.flatMap((s) => s.kind === "product" ? [s.productId] : []));
  const descriptions = subjects.flatMap((s) => s.kind === "description" ? [s.label] : []).join("\n");
  return <fieldset className={styles.foodFields}>
    <legend>{label}</legend>
    <div className={styles.foodChips} aria-label={`${label}: выбрано`}>
      {selected.map((id) => <span className={styles.foodChip} key={id}>
        {products.find((product) => product.id === id)?.name ?? id}
        <button type="button" aria-label={`Убрать из «${label}»: ${products.find((product) => product.id === id)?.name ?? id}`} onClick={(event) => {
          const group = event.currentTarget.closest("fieldset");
          setSelected(selected.filter((value) => value !== id));
          requestAnimationFrame(() => group?.querySelector("summary")?.focus());
        }}>×</button>
      </span>)}
    </div>
    <details className={styles.productPicker} open={!!error}>
      <summary>Выбрать продукты из каталога</summary>
      <div className={styles.productOptions} role="group" aria-label={`${label}: продукты из каталога`}>
        {products.map((product) => <label className={styles.productOption} htmlFor={`${prefix}-${product.id}`} key={product.id}>
          <input id={`${prefix}-${product.id}`} type="checkbox" name={`${prefix}Products`} value={product.id}
            checked={selected.includes(product.id)} onChange={(event) => setSelected(event.target.checked ? [...selected, product.id] : selected.filter((id) => id !== product.id))}
            aria-invalid={!!error} aria-describedby={error ? `${prefix}Products-error` : undefined} />
          {product.name}
        </label>)}
        {products.length === 0 && <p className={styles.small}>В каталоге пока нет продуктов. Добавьте запись своими словами.</p>}
      </div>
    </details>
    {error && <p id={`${prefix}Products-error`} className={styles.fieldError}>{error}</p>}
    <details open={descriptions.length > 0}>
      <summary>Добавить запись своими словами</summary>
      <div className={styles.field}>
        <label htmlFor={`${prefix}Descriptions`}>Своими словами</label>
        <textarea id={`${prefix}Descriptions`} name={`${prefix}Descriptions`} rows={2} defaultValue={descriptions}
          aria-describedby={`${prefix}-description-hint`} />
        <p id={`${prefix}-description-hint`} className={styles.small}>Каждая запись — с новой строки.</p>
      </div>
    </details>
  </fieldset>;
}
