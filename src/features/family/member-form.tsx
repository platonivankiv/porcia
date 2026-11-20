"use client";

import { useState, type FormEvent } from "react";
import type { Product } from "../recipes/model";
import type { FamilyMember, FoodSubject } from "./model";
import { goalLabels, parseMemberForm } from "./validation";

type MemberValues = Omit<FamilyMember, "id" | "householdId">;
const inputNumber = new Intl.NumberFormat("en-US", { useGrouping: false, maximumSignificantDigits: 21 });
const targetFields = [
  ["calories", "Энергия, ккал/день"], ["protein", "Белки, г/день"],
  ["fat", "Жиры, г/день"], ["carbohydrates", "Углеводы, г/день"],
] as const;

export function MemberForm({ member, products, onSave, onCancel }: {
  member?: FamilyMember;
  products: readonly Pick<Product, "id" | "name">[];
  onSave: (value: MemberValues) => string | null;
  onCancel: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [recorded, setRecorded] = useState(member?.restrictions.status === "recorded");
  const restrictions = member?.restrictions.status === "recorded" ? member.restrictions.items : [];
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const result = parseMemberForm(new FormData(form), products.map((product) => product.id));
    setSaveError(null);
    if (!result.ok) {
      setErrors(result.errors);
      const control = form.elements.namedItem(Object.keys(result.errors)[0]);
      if (control instanceof HTMLElement) control.focus();
      return;
    }
    setErrors({});
    setSaveError(onSave(result.value));
  }
  function feedback(name: string) {
    return errors[name] ? <p id={`${name}-error`} className="family-field-error">{errors[name]}</p> : null;
  }
  function numberField(name: string, label: string, value: number | null | undefined, integer = false) {
    return <div className="family-field" key={name}>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type="text" inputMode={integer ? "numeric" : "decimal"}
        defaultValue={value == null ? "" : inputNumber.format(value)} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-error` : undefined} />
      {feedback(name)}
    </div>;
  }
  function foodFields(prefix: string, label: string, subjects: readonly FoodSubject[]) {
    const selected = subjects.flatMap((subject) => subject.kind === "product" ? [subject.productId] : []);
    const descriptions = subjects.flatMap((subject) => subject.kind === "description" ? [subject.label] : []).join("\n");
    return <fieldset className="family-food-fields">
      <legend>{label}</legend>
      <div className="family-fields">
        <div className="family-field">
          <label htmlFor={`${prefix}Products`}>Продукты из каталога</label>
          <select id={`${prefix}Products`} name={`${prefix}Products`} multiple size={4} defaultValue={selected}
            aria-invalid={!!errors[`${prefix}Products`]} aria-describedby={`${prefix}-hint${errors[`${prefix}Products`] ? ` ${prefix}Products-error` : ""}`}>
            {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
          </select>
          <p id={`${prefix}-hint`} className="recipe-small">Можно выбрать несколько: на компьютере удерживайте Ctrl или ⌘.</p>
          {feedback(`${prefix}Products`)}
        </div>
        <div className="family-field">
          <label htmlFor={`${prefix}Descriptions`}>Своими словами</label>
          <textarea id={`${prefix}Descriptions`} name={`${prefix}Descriptions`} rows={4} defaultValue={descriptions}
            aria-describedby={`${prefix}-description-hint`} />
          <p id={`${prefix}-description-hint`} className="recipe-small">Каждая запись — с новой строки.</p>
        </div>
      </div>
    </fieldset>;
  }
  return <form className="family-form" onSubmit={submit} noValidate>
    <section className="family-panel" aria-labelledby="member-heading">
      <h2 id="member-heading">{member ? "Редактирование участника" : "Новый участник"}</h2>
      <p className="recipe-small">Для создания достаточно имени. Остальное можно заполнить позже.</p>
      <div className="family-field">
        <label htmlFor="displayName">Отображаемое имя <span className="recipe-small">(обязательно)</span></label>
        <input id="displayName" name="displayName" type="text" autoComplete="off" required defaultValue={member?.displayName ?? ""}
          aria-invalid={!!errors.displayName} aria-describedby={errors.displayName ? "displayName-error" : undefined} />
        {feedback("displayName")}
      </div>
      <div className="family-fields family-physical-fields">
        {numberField("ageYears", "Возраст, полных лет", member?.ageYears, true)}
        {numberField("heightCm", "Рост, см", member?.heightCm)}
        {numberField("weightKg", "Вес, кг", member?.weightKg)}
      </div>
      <p className="recipe-small">Возраст, рост и вес необязательны и не используются для расчётов. Возраст указан на момент заполнения и автоматически не меняется.</p>
      <div className="family-field">
        <label htmlFor="goal">Цель питания</label>
        <select id="goal" name="goal" defaultValue={member?.goal ?? ""} aria-invalid={!!errors.goal} aria-describedby={errors.goal ? "goal-error" : undefined}>
          <option value="">Не выбрана</option>
          {Object.entries(goalLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
        </select>
        {feedback("goal")}
      </div>
    </section>
    <section className="family-panel" aria-labelledby="targets-heading">
      <h2 id="targets-heading">Дневные ориентиры</h2>
      <p className="recipe-small">Задано вручную. Любой показатель можно оставить пустым. Смена цели и физических параметров не меняет эти значения.</p>
      <div className="family-fields">
        {targetFields.map(([name, label]) => numberField(name, label, member?.dailyTargets[name]?.value))}
      </div>
    </section>
    <section className="family-panel" aria-labelledby="restrictions-heading">
      <h2 id="restrictions-heading">Ограничения и аллергии</h2>
      <p className="recipe-small">Ограничения сохраняются, но рецепты автоматически не проверяются. Текстовые записи и метки продуктов не подтверждают аллергенную безопасность.</p>
      <label className="family-checkbox"><input type="checkbox" name="restrictionsRecorded" checked={recorded} onChange={(event) => setRecorded(event.target.checked)} />Раздел ограничений заполнен</label>
      {!recorded && <p className="recipe-small">Ограничения не указаны. Это не означает их отсутствие.</p>}
      <fieldset disabled={!recorded} hidden={!recorded} className="family-restrictions">
        <legend className="sr-only">Записи ограничений</legend>
        {foodFields("allergy", "Аллергии", restrictions.filter((item) => item.kind === "allergy").map((item) => item.subject))}
        {foodFields("exclusion", "Строгие исключения", restrictions.filter((item) => item.kind === "exclusion").map((item) => item.subject))}
      </fieldset>
      {recorded && <p className="recipe-small">Если записей нет, раздел сохранится как заполненный без указанных ограничений.</p>}
    </section>
    <section className="family-panel" aria-labelledby="preferences-heading">
      <h2 id="preferences-heading">Предпочтения в еде</h2>
      <p className="recipe-small">Это пожелания, а не строгие запреты.</p>
      {foodFields("like", "Нравится", member?.preferences.filter((item) => item.preference === "like").map((item) => item.subject) ?? [])}
      {foodFields("dislike", "Не нравится", member?.preferences.filter((item) => item.preference === "dislike").map((item) => item.subject) ?? [])}
    </section>
    <div className="family-actions">
      <button className="family-button" type="submit">Сохранить участника</button>
      <button className="family-button family-button-secondary" type="button" onClick={onCancel}>Отмена</button>
    </div>
    <div role="alert">
      {Object.keys(errors).length > 0 && <p className="family-field-error">Исправьте ошибки в полях: {Object.keys(errors).length}.</p>}
      {saveError && <p className="family-field-error">{saveError}</p>}
    </div>
  </form>;
}
