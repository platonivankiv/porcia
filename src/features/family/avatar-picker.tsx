import styles from "./family-profiles.module.scss";
import { useRef, useState } from "react";
import { avatarIds, type AvatarId } from "./model";
import { avatarLabels, MemberAvatar } from "./member-avatar";

export function AvatarPicker({ avatarId, displayName, onChange }: {
  avatarId?: AvatarId;
  displayName: string;
  onChange: (avatarId: AvatarId | undefined) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState<AvatarId | undefined>(avatarId);
  return <>
    <input name="avatarId" type="hidden" value={avatarId ?? ""} />
    <div className={styles.avatarRow}>
      <MemberAvatar avatarId={avatarId} displayName={displayName} className={styles.avatarMini} />
      <div><strong>{avatarId ? "Персонаж выбран вручную" : "Аватар не выбран"}</strong>
        <button className={styles.textButton} type="button" onClick={() => {
          setPending(avatarId);
          dialog.current?.showModal();
        }}>Выбрать персонажа ↗</button>
      </div>
    </div>
    <dialog className={styles.avatarDialog} ref={dialog} aria-labelledby="avatar-heading" onKeyDown={(event) => {
      // These radios belong to the profile form; Enter must not implicitly save it.
      if (event.key === "Enter" && event.target instanceof HTMLInputElement) event.preventDefault();
    }}>
      <div className={styles.dialogHeading}><h2 id="avatar-heading">Выберите персонажа</h2>
        <button className={styles.actionButton + " " + styles.secondaryButton} type="button" aria-label="Закрыть выбор аватара" onClick={() => dialog.current?.close()}>×</button>
      </div>
      <p className={styles.small}>Декоративный аватар, а не описание внешности. Выбор не зависит от имени или параметров формулы.</p>
      <fieldset className={styles.avatarOptions}><legend className={"sr-only"}>Персонаж</legend>
        {([undefined, ...avatarIds]).map((id) => <label className={`${styles.choice} ${styles.avatarChoice} ${styles[`tone-${id ?? "neutral"}`]}`} key={id ?? "none"}>
          <input type="radio" name="avatarChoice" value={id ?? ""} checked={pending === id} onChange={() => setPending(id)} />
          <MemberAvatar avatarId={id} displayName={displayName} />
          <span>{id ? avatarLabels[id] : "Без аватара"}</span>
        </label>)}
      </fieldset>
      <div className={styles.actions}>
        <button className={styles.actionButton} type="button" onClick={() => { onChange(pending); dialog.current?.close(); }}>Выбрать аватар</button>
        <button className={styles.actionButton + " " + styles.secondaryButton} type="button" onClick={() => dialog.current?.close()}>Отмена</button>
      </div>
    </dialog>
  </>;
}
