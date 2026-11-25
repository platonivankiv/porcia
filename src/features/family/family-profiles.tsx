"use client";

import styles from "./family-profiles.module.scss";

import { useEffect, useRef, useState } from "react";
import type { Product } from "../recipes/model";
import type { FamilyMember, FamilyStorageDocument } from "./model";
import { MemberCard } from "./member-card";
import { FamilyIllustration } from "./family-illustration";
import { MemberForm } from "./member-form";
import { loadFamily, resetFamily, saveFamily, type FamilyLoadResult } from "./storage";

const browserStorage = () => window.localStorage;

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
      calculation: { ...(editing && editing !== "new" ? editing.calculation : {}), ...value.calculation },
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
  const pageHeading = <div className={styles.pageHeading}>
    <div>
      <p className={styles.eyebrow}>{editing ? "Параметры участника" : "Общая еда. Разные потребности."}</p>
      <h1 tabIndex={-1} ref={heading}>{editing === "new" ? "Новый участник" : editing ? "Редактировать участника" : "Ваша семья"}</h1>
    </div>
    {loaded?.ok && !editing && <button className={styles.actionButton} ref={addButton} onClick={() => { setNotice(""); setEditing("new"); }}><span aria-hidden="true">＋</span> Добавить участника</button>}
  </div>;
  const localNote = <aside className={styles.localNote} aria-label="Хранение данных">
    <p>Используйте вымышленные данные. Профили хранятся только в этом браузере, без синхронизации, и могут исчезнуть при очистке его данных.</p>
  </aside>;
  if (!loaded) return <>{pageHeading}<p role="status">Загружаем участников…</p></>;
  if (!loaded.ok) return <>{pageHeading}<section className={styles.panel} aria-labelledby="storage-heading">
    <h2 id="storage-heading">Локальные данные недоступны</h2>
    <p role="alert">{loaded.message}</p>
    <div className={styles.actions}>
      <button className={styles.actionButton} onClick={reload}>Повторить чтение</button>
      {loaded.snapshot !== null && !confirmReset && <button className={styles.actionButton + " " + styles.secondaryButton} onClick={() => setConfirmReset(true)}>Сбросить локальные данные</button>}
    </div>
    {confirmReset && loaded.snapshot !== null && <div className={styles.reset}>
      <p>Удалить сохранённую запись семьи из этого браузера? Восстановить её через приложение не получится.</p>
      <div className={styles.actions}>
        <button className={styles.actionButton} onClick={() => {
          const result = resetFamily(browserStorage, loaded.snapshot!);
          if (result.ok) reload();
          else setNotice(result.message);
        }}>Удалить запись и начать заново</button>
        <button className={styles.actionButton + " " + styles.secondaryButton} onClick={() => setConfirmReset(false)}>Отмена сброса</button>
      </div>
    </div>}
    <p role="status">{notice}</p>
  </section></>;
  return <>
    {editing && <button type="button" className={styles.textButton + " " + styles.back} onClick={closeEditor}>← Участники семьи</button>}
    {pageHeading}
    {localNote}
    <p className={styles.status} role="status">{notice}</p>
    {editing ? <>
      <MemberForm key={editing === "new" ? "new" : editing.id} member={editing === "new" ? undefined : editing} products={products} onSave={save} onCancel={closeEditor} />
    </> : <>
      <div className={styles.listHeading}>
        <h2>Участники <span className={styles.count}>{String(loaded.document?.members.length ?? 0).padStart(2, "0")}</span></h2>
        <p>Параметры и дневные ориентиры</p>
      </div>
      {!loaded.document?.members.length ? <section>
        <div><h2>Добавьте первого участника</h2><p>Начните с имени. Параметры для расчёта питания и предпочтения можно указать позже.</p></div>
        <FamilyIllustration />
      </section> : <ul className={styles.memberList}>
        {loaded.document.members.map((member) => <li key={member.id}>
          <MemberCard member={member} products={products} onEdit={() => { setNotice(""); setEditing(member); }} />
        </li>)}
      </ul>}
      <div className={styles.footnotes}>
        <p>КБЖУ — расчётные ориентиры. Они не учитывают индивидуальные медицинские обстоятельства.</p>
        <p>Ограничения сохраняются, но рецепты автоматически не проверяются.</p>
      </div>
      <details className={styles.storageDetails}>
        <summary>О локальном хранении профилей</summary>
        <p>Доступа с других устройств нет. Очистка данных браузера удалит профили.</p>
        <button className={styles.textButton} onClick={reload}>Перечитать список из браузера</button>
      </details>
    </>}
  </>;
}
