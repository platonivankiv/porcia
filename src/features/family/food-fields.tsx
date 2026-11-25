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
  return <fieldset className="family-food-fields">
    <legend>{label}</legend>
    <div className="family-food-chips" aria-label={`${label}: выбрано`}>
      {selected.map((id) => <span className="family-food-chip" key={id}>
        {products.find((product) => product.id === id)?.name ?? id}
        <button type="button" aria-label={`Убрать из «${label}»: ${products.find((product) => product.id === id)?.name ?? id}`} onClick={(event) => {
          const group = event.currentTarget.closest("fieldset");
          setSelected(selected.filter((value) => value !== id));
          requestAnimationFrame(() => group?.querySelector("summary")?.focus());
        }}>×</button>
      </span>)}
    </div>
    <details className="family-product-picker" open={!!error}>
      <summary>Выбрать продукты из каталога</summary>
      <div className="family-product-options" role="group" aria-label={`${label}: продукты из каталога`}>
        {products.map((product) => <label className="family-product-option" htmlFor={`${prefix}-${product.id}`} key={product.id}>
          <input id={`${prefix}-${product.id}`} type="checkbox" name={`${prefix}Products`} value={product.id}
            checked={selected.includes(product.id)} onChange={(event) => setSelected(event.target.checked ? [...selected, product.id] : selected.filter((id) => id !== product.id))}
            aria-invalid={!!error} aria-describedby={error ? `${prefix}Products-error` : undefined} />
          {product.name}
        </label>)}
        {products.length === 0 && <p className="recipe-small">В каталоге пока нет продуктов. Добавьте запись своими словами.</p>}
      </div>
    </details>
    {error && <p id={`${prefix}Products-error`} className="family-field-error">{error}</p>}
    <details className="family-free-text" open={descriptions.length > 0}>
      <summary>Добавить запись своими словами</summary>
      <div className="family-field">
        <label htmlFor={`${prefix}Descriptions`}>Своими словами</label>
        <textarea id={`${prefix}Descriptions`} name={`${prefix}Descriptions`} rows={2} defaultValue={descriptions}
          aria-describedby={`${prefix}-description-hint`} />
        <p id={`${prefix}-description-hint`} className="recipe-small">Каждая запись — с новой строки.</p>
      </div>
    </details>
  </fieldset>;
}
