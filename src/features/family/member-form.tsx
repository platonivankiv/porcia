"use client";

import { useState, type FormEvent } from "react";
import type { Product } from "../recipes/model";
import { emptyCalculationSettings, type FamilyMember, type FoodSubject } from "./model";
import { calculationOptions, goalLabels, parseCalculationInputs, parseMemberForm } from "./validation";

import { NutritionRecommendation } from "./nutrition-recommendation";

type MemberValues = Omit<FamilyMember, "id" | "householdId">;
const inputNumber = new Intl.NumberFormat("en-US", { useGrouping: false, maximumSignificantDigits: 21 });


export function MemberForm({ member, products, onSave, onCancel }: {
  member?: FamilyMember;
  products: readonly Pick<Product, "id" | "name">[];
  onSave: (value: MemberValues) => string | null;
  onCancel: () => void;
}) {
  const [preview, setPreview] = useState<ReturnType<typeof parseCalculationInputs>>({ ok: true, value: {
    ageYears: member?.ageYears ?? null, heightCm: member?.heightCm ?? null, weightKg: member?.weightKg ?? null,
    goal: member?.goal ?? null, calculation: member?.calculation ?? emptyCalculationSettings,
  } });
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
      <label htmlFor={name}>{label} <span aria-hidden="true">*</span></label>
      <input id={name} name={name} type="text" inputMode={integer ? "numeric" : "decimal"}
        defaultValue={value == null ? "" : inputNumber.format(value)} aria-invalid={!!errors[name]} aria-describedby={`member-fields-hint${errors[name] ? ` ${name}-error` : ""}`} />
      {feedback(name)}
    </div>;
  }
  function settingField(name: keyof typeof calculationOptions, label: string, hint?: string) {
    return <div className="family-field" key={name}>
      <label htmlFor={name}>{label} <span aria-hidden="true">*</span></label>
      <select id={name} name={name} defaultValue={member?.calculation[name] ?? ""} aria-invalid={!!errors[name]}
        aria-describedby={["member-fields-hint", hint ? `${name}-hint` : "", errors[name] ? `${name}-error` : ""].filter(Boolean).join(" ") || undefined}>
        <option value="">Не указано</option>
        {Object.entries(calculationOptions[name]).map(([value, text]) => <option value={value} key={value}>{text}</option>)}
      </select>
      {hint && <p className="recipe-small" id={`${name}-hint`}>{hint}</p>}
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
  return <form className="family-form" onSubmit={submit} onChange={(event) => setPreview(parseCalculationInputs(new FormData(event.currentTarget)))} noValidate>
    <section className="family-panel" aria-labelledby="member-heading">
      <h2 id="member-heading">{member ? "Редактирование участника" : "Новый участник"}</h2>
      <p className="recipe-small" id="member-fields-hint">Имя обязательно для сохранения профиля. Остальные отмеченные поля необходимы для автоматического расчёта КБЖУ. Заполненность всех полей не гарантирует, что расчёт будет доступен.</p>
      <div className="family-field">
        <label htmlFor="displayName">Отображаемое имя <span aria-hidden="true">*</span></label>
        <input id="displayName" name="displayName" type="text" autoComplete="off" required defaultValue={member?.displayName ?? ""}
          aria-invalid={!!errors.displayName} aria-describedby={`member-fields-hint${errors.displayName ? " displayName-error" : ""}`} />
        {feedback("displayName")}
      </div>
      <div className="family-fields family-physical-fields">
        {numberField("ageYears", "Возраст, полных лет", member?.ageYears, true)}
        {numberField("heightCm", "Рост, см", member?.heightCm)}
        {numberField("weightKg", "Вес, кг", member?.weightKg)}
      </div>
      <p className="recipe-small">Для сохранения профиля параметры необязательны. Для взрослого расчёта нужны возраст от 19 лет, рост и вес. Возраст указан на момент заполнения и автоматически не меняется.</p>
      <div className="family-field">
        <label htmlFor="goal">Цель питания <span aria-hidden="true">*</span></label>
        <select id="goal" name="goal" defaultValue={member?.goal ?? ""} aria-invalid={!!errors.goal} aria-describedby={`member-fields-hint${errors.goal ? " goal-error" : ""}`}>
          <option value="">Не выбрана</option>
          {Object.entries(goalLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
        </select>
        {feedback("goal")}
      </div>
    </section>
    <section className="family-panel" aria-labelledby="calculation-heading">
      <h2 id="calculation-heading">Параметры расчёта</h2>
      <div className="family-fields">
        {settingField("sexForEquation", "Половая категория для формулы", "Категория из опубликованного уравнения. При отсутствии ответа значение не подставляется.")}
        {settingField("training", "Тренировки", "Силовые нужны для рекомендации по набору мышц и рекомпозиции. Этот ответ не добавляет калории повторно.")}
      </div>
      {settingField("activity", "Общая активность", "Оценивайте весь обычный день: работу, перемещения, быт и тренировки вместе.")}
      <details className="family-method"><summary>Примеры общей активности</summary>
        <ul>
          <li>Обычная бытовая: повседневные дела, например около 30 минут ходьбы и лёгкая работа по дому.</li>
          <li>Дополнительно много хожу: бытовые дела плюс примерно 60–80 минут ходьбы со скоростью 5–7 км/ч.</li>
          <li>Активный день: бытовые дела, ходьба и продолжительная физическая нагрузка, например велосипед и теннис.</li>
          <li>Очень высокая: сочетание длительных нагрузок, например велосипед, бег и теннис в течение дня.</li>
        </ul>
        <p className="recipe-small">Это примеры Health Canada, а не перевод количества тренировок в коэффициент.</p>
      </details>
    </section>
    <div className="family-panel family-recommendation-panel">
      <NutritionRecommendation inputs={preview.ok ? preview.value : null} live />
    </div>
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
