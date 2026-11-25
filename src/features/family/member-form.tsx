"use client";

import styles from "./family-profiles.module.scss";

import { useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import type { Product } from "../recipes/model";
import { emptyCalculationSettings, type FamilyMember, type AvatarId, type FoodSubject } from "./model";
import { calculationOptions, goalLabels, parseCalculationInputs, parseMemberForm } from "./validation";

import { AvatarPicker } from "./avatar-picker";
import { MemberAvatar } from "./member-avatar";
import { FoodFields } from "./food-fields";
import { NutritionRecommendation } from "./nutrition-recommendation";

type Section = "basic" | "activity" | "food";
const sections = { basic: "Основное", activity: "Активность", food: "Питание" } as const;
const goalArtwork = { "weight-loss": ["green", "woman"], "muscle-gain": ["lavender", "man"], maintenance: ["yellow", "woman"], recomposition: ["coral", "man"] } as const;

type MemberValues = Omit<FamilyMember, "id" | "householdId">;
const inputNumber = new Intl.NumberFormat("en-US", { useGrouping: false, maximumSignificantDigits: 21 });


export function MemberForm({ member, products, onSave, onCancel }: {
  member?: FamilyMember;
  products: readonly Pick<Product, "id" | "name">[];
  onSave: (value: MemberValues) => string | null;
  onCancel: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [section, setSection] = useState<Section>("basic");
  const [avatarId, setAvatarId] = useState<AvatarId | undefined>(member?.avatarId);
  const [displayName, setDisplayName] = useState(member?.displayName ?? "");
  function showSection(next: Section) {
    setSection(next);
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`#member-section-${next} h2`)?.focus());
  }
  const [preview, setPreview] = useState<ReturnType<typeof parseCalculationInputs>>({ ok: true, value: {
    ageYears: member?.ageYears ?? null, heightCm: member?.heightCm ?? null, weightKg: member?.weightKg ?? null,
    goal: member?.goal ?? null, calculation: member?.calculation ?? emptyCalculationSettings,
  } });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [recorded, setRecorded] = useState(member?.restrictions.status === "recorded");
  const [sexForEquation, setSexForEquation] = useState(member?.calculation.sexForEquation ?? null);
  const restrictions = member?.restrictions.status === "recorded" ? member.restrictions.items : [];
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const result = parseMemberForm(new FormData(form), products.map((product) => product.id));
    setSaveError(null);
    if (!result.ok) {
      setErrors(result.errors);
      const control = form.elements.namedItem(Object.keys(result.errors)[0]);
      if (control instanceof HTMLElement) {
        const panel = control.closest<HTMLElement>("[data-section]");
        if (panel) setSection(panel.dataset.section as Section);
        requestAnimationFrame(() => control.focus());
      }
      return;
    }
    setErrors({});
    setSaveError(onSave(result.value));
  }
  function feedback(name: string) {
    return errors[name] ? <p id={`${name}-error`} className={styles.fieldError}>{errors[name]}</p> : null;
  }
  function numberField(name: string, label: string, value: number | null | undefined, integer = false) {
    return <div className={styles.field} key={name}>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type="text" inputMode={integer ? "numeric" : "decimal"}
        defaultValue={value == null ? "" : inputNumber.format(value)} aria-invalid={!!errors[name]} aria-describedby={`member-fields-hint${errors[name] ? ` ${name}-error` : ""}`} />
      {feedback(name)}
    </div>;
  }
  function settingField(name: keyof typeof calculationOptions, label: string, hint?: string) {
    return <div className={styles.field} key={name}>
      <label htmlFor={name}>{label}</label>
      <select id={name} name={name} defaultValue={member?.calculation[name] ?? ""} aria-invalid={!!errors[name]}
        aria-describedby={["member-fields-hint", hint ? `${name}-hint` : "", errors[name] ? `${name}-error` : ""].filter(Boolean).join(" ") || undefined}>
        <option value="">Не указано</option>
        {Object.entries(calculationOptions[name]).map(([value, text]) => <option value={value} key={value}>{text}</option>)}
      </select>
      {hint && <p className={styles.small} id={`${name}-hint`}>{hint}</p>}
      {feedback(name)}
    </div>;
  }
  function foodFields(prefix: string, label: string, subjects: readonly FoodSubject[]) {
    return <FoodFields prefix={prefix} label={label} subjects={subjects} products={products} error={errors[`${prefix}Products`]} />;
  }
  return <form className={styles.form} ref={formRef} onSubmit={submit} onChange={(event) => {
    setPreview(parseCalculationInputs(new FormData(event.currentTarget)));
    setDisplayName(String(new FormData(event.currentTarget).get("displayName") ?? ""));
  }} noValidate>
    <nav className={styles.sectionNav} aria-label="Разделы профиля">
      {Object.entries(sections).map(([key, label], index) => <button key={key} type="button"
        aria-current={section === key ? "step" : undefined} aria-controls={`member-section-${key}`}
        onClick={() => showSection(key as Section)}><span>{index + 1}</span>{label}</button>)}
    </nav>
    <div className={styles.editorGrid}>
      <div className={styles.formFields}>
        <section className={styles.panel} id="member-section-basic" data-section="basic" hidden={section !== "basic"} aria-labelledby="member-heading">
          <h2 id="member-heading" tabIndex={-1}>Основное</h2>
          <p className={styles.small} id="member-fields-hint">Имя обязательно для сохранения профиля. Остальное можно добавить позже.</p>
          <div className={styles.field}>
            <label htmlFor="displayName">Имя <span aria-hidden="true">*</span></label>
            <input id="displayName" name="displayName" type="text" autoComplete="off" required defaultValue={member?.displayName ?? ""}
              aria-invalid={!!errors.displayName} aria-describedby={`member-fields-hint${errors.displayName ? " displayName-error" : ""}`} />
            {feedback("displayName")}
          </div>
          <AvatarPicker avatarId={avatarId} displayName={displayName} onChange={setAvatarId} />
          <div className={styles.fields + " " + styles.physicalFields}>
            {numberField("ageYears", "Возраст, лет", member?.ageYears, true)}
            {numberField("heightCm", "Рост, см", member?.heightCm)}
            {numberField("weightKg", "Вес, кг", member?.weightKg)}
          </div>
          <p className={styles.small}>Для взрослого расчёта нужны возраст от 19 лет, рост и вес. Возраст — в полных годах, автоматически не меняется.</p>
          <fieldset className={styles.choiceField} aria-describedby="goal-hint">
            <legend>Цель питания</legend>
            <button className={styles.textButton + " " + styles.clearChoice} type="button" onClick={(event) => {
              const form = event.currentTarget.form;
              if (!form) return;
              form.querySelectorAll<HTMLInputElement>('input[name="goal"]').forEach((input) => { input.checked = false; });
              setPreview(parseCalculationInputs(new FormData(form)));
            }}>Снять выбор</button>
            <p className={styles.small} id="goal-hint">Нужна для КБЖУ, необязательна для сохранения.</p>
            <div className={styles.goalOptions}>
              {Object.keys(goalArtwork).map((key) => <label className={`${styles.choice} ${styles.goalChoice} ${styles[`tone-${goalArtwork[key as keyof typeof goalArtwork][0]}`]}`} key={key}>
                <input type="radio" name="goal" value={key} defaultChecked={member?.goal === key} aria-describedby="goal-hint" />
                <MemberAvatar avatarId={goalArtwork[key as keyof typeof goalArtwork][1]} displayName="" />
                <span>{key === "maintenance" ? "Поддержание веса" : goalLabels[key as keyof typeof goalLabels]}</span>
              </label>)}
            </div>
            {feedback("goal")}
          </fieldset>
          <fieldset className={styles.choiceField} aria-describedby="sexForEquation-hint">
            <legend>Параметры формулы</legend>
            <button className={styles.textButton + " " + styles.clearChoice} type="button" disabled={sexForEquation === null} onClick={(event) => {
              const data = new FormData(event.currentTarget.form!);
              data.delete("sexForEquation");
              setSexForEquation(null);
              setPreview(parseCalculationInputs(data));
            }}>Снять выбор</button>
            <p className={styles.small} id="sexForEquation-hint">Половая категория для расчёта. Аватар выбирается отдельно. При отсутствии ответа значение не подставляется.</p>
            <div className={styles.sexOptions}>
              {(["male", "female"] as const).map((value) => <label className={`${styles.choice} ${styles.sexOption} ${styles[`tone-${value === "male" ? "lavender" : "green"}`]}`} htmlFor={`sexForEquation-${value}`} key={value}>
                <input id={`sexForEquation-${value}`} name="sexForEquation" type="radio" value={value}
                  checked={sexForEquation === value} onChange={() => setSexForEquation(value)} aria-describedby="sexForEquation-hint" />
                <Image src={`/family/${value === "male" ? "man" : "woman"}.webp`} alt="" width={800} height={1391} sizes="(max-width: 760px) 40vw, 240px" />
                <span>{value === "male" ? "Мужская" : "Женская"}</span>
              </label>)}
            </div>
            {feedback("sexForEquation")}
          </fieldset>
          <div className={styles.nextSection}><button className={styles.actionButton + " " + styles.secondaryButton} type="button" onClick={() => showSection("activity")}>Далее: активность →</button></div>
        </section>
        <section className={styles.panel} id="member-section-activity" data-section="activity" hidden={section !== "activity"} aria-labelledby="activity-heading">
          <h2 id="activity-heading" tabIndex={-1}>Активность</h2>
          <p className={styles.small}>Параметры для расчёта КБЖУ. Можно сохранить профиль и без них.</p>
          {settingField("training", "Тренировки", "Для набора мышц и рекомпозиции нужны регулярные силовые. Калории тренировок повторно не добавляются.")}
          {settingField("activity", "Общая активность", "Оценивайте весь обычный день: работу, перемещения, быт и тренировки вместе.")}
          <details className={styles.method}><summary>Как оценить общую активность</summary>
            <ul>
              <li>Обычная бытовая: повседневные дела, например около 30 минут ходьбы и лёгкая работа по дому.</li>
              <li>Дополнительно много хожу: бытовые дела плюс примерно 60–80 минут ходьбы со скоростью 5–7 км/ч.</li>
              <li>Активный день: бытовые дела, ходьба и продолжительная физическая нагрузка, например велосипед и теннис.</li>
              <li>Очень высокая: сочетание длительных нагрузок, например велосипед, бег и теннис в течение дня.</li>
            </ul>
            <p className={styles.small}>Это примеры Health Canada, а не перевод количества тренировок в коэффициент.</p>
          </details>
          <div className={styles.nextSection}><button className={styles.actionButton + " " + styles.secondaryButton} type="button" onClick={() => showSection("basic")}>← Основное</button><button className={styles.actionButton + " " + styles.secondaryButton} type="button" onClick={() => showSection("food")}>Далее: питание →</button></div>
        </section>
        <section id="member-section-food" data-section="food" hidden={section !== "food"} aria-labelledby="food-heading">
          <div className={styles.panel}>
            <h2 id="food-heading" tabIndex={-1}>Ограничения и аллергии</h2>
            <p className={styles.small}>Ограничения сохраняются, но рецепты автоматически не проверяются. Текстовые записи и метки продуктов не подтверждают аллергенную безопасность.</p>
            <label className={styles.checkbox}><input type="checkbox" name="restrictionsRecorded" checked={recorded} onChange={(event) => setRecorded(event.target.checked)} />Раздел ограничений заполнен</label>
            {!recorded && <p className={styles.small}>Ограничения не указаны. Это не означает их отсутствие.</p>}
            <fieldset disabled={!recorded} hidden={!recorded} className={styles.restrictions}>
              <legend className={"sr-only"}>Записи ограничений</legend>
              {foodFields("allergy", "Аллергии", restrictions.filter((item) => item.kind === "allergy").map((item) => item.subject))}
              {foodFields("exclusion", "Строгие исключения", restrictions.filter((item) => item.kind === "exclusion").map((item) => item.subject))}
            </fieldset>
            {recorded && <p className={styles.small}>Если записей нет, раздел сохранится как заполненный без указанных ограничений.</p>}
          </div>
          <div className={styles.panel}>
            <h2>Предпочтения</h2><p className={styles.small}>Это пожелания, а не строгие запреты.</p>
            {foodFields("like", "Нравится", member?.preferences.filter((item) => item.preference === "like").map((item) => item.subject) ?? [])}
            {foodFields("dislike", "Не нравится", member?.preferences.filter((item) => item.preference === "dislike").map((item) => item.subject) ?? [])}
          </div>
          <button className={styles.textButton} type="button" onClick={() => showSection("activity")}>← К активности</button>
        </section>
      </div>
      <aside className={styles.editorSummary} aria-label="Дневные ориентиры">
        <div className={styles.editorPortrait}><h2>{displayName || "Новый участник"}</h2><MemberAvatar avatarId={avatarId} displayName={displayName} /></div>
        <div className={styles.panel + " " + styles.recommendationPanel}><NutritionRecommendation inputs={preview.ok ? preview.value : null} live compact /></div>
      </aside>
    </div>
    <div className={styles.formFooter}>
      <p className={styles.small}>Профиль сохранится только в этом браузере.</p>
      <div className={styles.actions}><button className={styles.actionButton} type="submit">{member ? "Сохранить изменения" : "Сохранить участника"}</button>
        <button className={styles.actionButton + " " + styles.secondaryButton} type="button" onClick={onCancel}>Отмена</button></div>
      <div role="alert">
        {Object.keys(errors).length > 0 && <p className={styles.fieldError}>Исправьте ошибки в полях: {Object.keys(errors).length}.</p>}
        {saveError && <p className={styles.fieldError}>{saveError}</p>}
      </div>
    </div>
  </form>;
}
