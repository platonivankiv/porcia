"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "../recipes/model";
import type { FamilyMember, FamilyStorageDocument } from "./model";
import { NutritionRecommendation } from "./nutrition-recommendation";
import { MemberForm } from "./member-form";
import { loadFamily, resetFamily, saveFamily, type FamilyLoadResult } from "./storage";
import { goalLabels } from "./validation";

const browserStorage = () => window.localStorage;
const amount = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 12 });

export function FamilyProfiles({ products }: { products: readonly Pick<Product, "id" | "name">[] }) {
  const [loaded, setLoaded] = useState<FamilyLoadResult | null>(null);
  const [editing, setEditing] = useState<FamilyMember | "new" | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [notice, setNotice] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const productIds = products.map((product) => product.id);
  useEffect(() => {
    let active = true;
    // Read browser storage after hydration; never render a fictitious empty family first.
    Promise.resolve().then(() => {
      if (active) setLoaded(loadFamily(browserStorage, products.map((product) => product.id)));
    });
    return () => { active = false; };
  }, [products]);
  useEffect(() => { if (editing) heading.current?.focus(); }, [editing]);

  function reload() {
    setLoaded(loadFamily(browserStorage, productIds));
    setConfirmReset(false);
    setNotice("");
  }
  function closeEditor() {
    setEditing(null);
    requestAnimationFrame(() => addButton.current?.focus());
  }
  function save(value: Omit<FamilyMember, "id" | "householdId">): string | null {
    if (!loaded?.ok) return "Сначала восстановите доступ к локальным данным.";
    const document: FamilyStorageDocument = loaded.document ?? {
      version: 2, household: { id: crypto.randomUUID(), displayName: "Моя семья" }, members: [],
    };
    const member: FamilyMember = {
      ...(editing && editing !== "new" ? editing : {}),
      ...value,
      id: editing && editing !== "new" ? editing.id : crypto.randomUUID(),
      householdId: document.household.id,
    };
    const next: FamilyStorageDocument = { ...document, members: editing === "new"
      ? [...document.members, member]
      : document.members.map((item) => item.id === member.id ? member : item) };
    const result = saveFamily(browserStorage, next, productIds, loaded.snapshot);
    if (!result.ok) return result.message;
    setLoaded({ ok: true, document: next, snapshot: result.snapshot });
    setNotice("Участник сохранён в этом браузере.");
    closeEditor();
    return null;
  }
  if (!loaded) return <p role="status">Загружаем участников…</p>;
  if (!loaded.ok) return <section className="family-panel" aria-labelledby="storage-heading">
    <h2 id="storage-heading">Локальные данные недоступны</h2>
    <p role="alert">{loaded.message}</p>
    <div className="family-actions">
      <button className="family-button" onClick={reload}>Повторить чтение</button>
      {loaded.snapshot !== null && !confirmReset && <button className="family-button family-button-secondary" onClick={() => setConfirmReset(true)}>Сбросить локальные данные</button>}
    </div>
    {confirmReset && loaded.snapshot !== null && <div className="family-reset">
      <p>Удалить сохранённую запись семьи из этого браузера? Восстановить её через приложение не получится.</p>
      <div className="family-actions">
        <button className="family-button" onClick={() => {
          const result = resetFamily(browserStorage, loaded.snapshot!);
          if (result.ok) reload();
          else setNotice(result.message);
        }}>Удалить запись и начать заново</button>
        <button className="family-button family-button-secondary" onClick={() => setConfirmReset(false)}>Отмена сброса</button>
      </div>
    </div>}
    <p role="status">{notice}</p>
  </section>;
  return <>
    <p className="family-status" role="status">{notice}</p>
    {editing ? <>
      <h2 className="family-editor-title" tabIndex={-1} ref={heading}>{editing === "new" ? "Добавить участника" : `Профиль: ${editing.displayName}`}</h2>
      <MemberForm key={editing === "new" ? "new" : editing.id} member={editing === "new" ? undefined : editing} products={products} onSave={save} onCancel={closeEditor} />
    </> : <>
      <div className="recipe-section-heading">
        <h2>Члены семьи <span className="family-count">{loaded.document?.members.length ?? 0}</span></h2>
        <button className="family-button" ref={addButton} onClick={() => { setNotice(""); setEditing("new"); }}>Добавить участника</button>
      </div>
      {!loaded.document?.members.length ? <section className="recipe-empty">
        <h3>Добавьте первого участника</h3>
        <p>Начните с имени. Параметры для расчёта питания и предпочтения можно указать позже.</p>
      </section> : <ul className="family-member-list">
        {loaded.document.members.map((member) => <li className="family-panel family-member" key={member.id}>
          <div className="family-member-heading">
            <div><h3>{member.displayName}</h3><p className="recipe-small">{member.goal ? goalLabels[member.goal] : "Цель не выбрана"}</p></div>
            <button className="family-button family-button-secondary" aria-label={`Редактировать: ${member.displayName}`} onClick={() => { setNotice(""); setEditing(member); }}>Редактировать</button>
          </div>
          <dl className="family-summary">
            {([
              ["Возраст", member.ageYears === null ? "Не указан" : `${member.ageYears} лет`],
              ["Рост", member.heightCm === null ? "Не указан" : `${amount.format(member.heightCm)} см`],
              ["Вес", member.weightKg === null ? "Не указан" : `${amount.format(member.weightKg)} кг`],
            ]).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>
          <NutritionRecommendation inputs={member} />
          <p className="recipe-small">{member.restrictions.status === "not-specified" ? "Ограничения не указаны" : `Раздел ограничений заполнен. Записей: ${member.restrictions.items.length}`}. Предпочтений: {member.preferences.length}.</p>
        </li>)}
      </ul>}
      <button className="family-text-button" onClick={reload}>Перечитать список из браузера</button>
    </>}
  </>;
}
