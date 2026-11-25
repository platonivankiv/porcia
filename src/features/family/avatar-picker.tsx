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
    <div className="family-avatar-row">
      <MemberAvatar avatarId={avatarId} displayName={displayName} className="family-avatar-mini" />
      <div><strong>{avatarId ? "Персонаж выбран вручную" : "Аватар не выбран"}</strong>
        <button className="family-text-button" type="button" onClick={() => {
          setPending(avatarId);
          dialog.current?.showModal();
        }}>Выбрать персонажа ↗</button>
      </div>
    </div>
    <dialog className="family-avatar-dialog" ref={dialog} aria-labelledby="avatar-heading" onKeyDown={(event) => {
      // These radios belong to the profile form; Enter must not implicitly save it.
      if (event.key === "Enter" && event.target instanceof HTMLInputElement) event.preventDefault();
    }}>
      <div className="family-dialog-heading"><h2 id="avatar-heading">Выберите персонажа</h2>
        <button className="family-button family-button-secondary" type="button" aria-label="Закрыть выбор аватара" onClick={() => dialog.current?.close()}>×</button>
      </div>
      <p className="recipe-small">Декоративный аватар, а не описание внешности. Выбор не зависит от имени или параметров формулы.</p>
      <fieldset className="family-avatar-options"><legend className="sr-only">Персонаж</legend>
        {([undefined, ...avatarIds]).map((id) => <label className={`family-choice family-avatar-choice family-tone-${id ?? "neutral"}`} key={id ?? "none"}>
          <input type="radio" name="avatarChoice" value={id ?? ""} checked={pending === id} onChange={() => setPending(id)} />
          <MemberAvatar avatarId={id} displayName={displayName} />
          <span>{id ? avatarLabels[id] : "Без аватара"}</span>
        </label>)}
      </fieldset>
      <div className="family-actions">
        <button className="family-button" type="button" onClick={() => { onChange(pending); dialog.current?.close(); }}>Выбрать аватар</button>
        <button className="family-button family-button-secondary" type="button" onClick={() => dialog.current?.close()}>Отмена</button>
      </div>
    </dialog>
  </>;
}
