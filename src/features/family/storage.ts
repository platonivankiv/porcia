import type { FamilyStorageDocument } from "./model";
import { isFamilyStorageDocument } from "./validation";

export const FAMILY_STORAGE_KEY = "porcia.family";
type StorageProvider = () => Pick<Storage, "getItem" | "setItem" | "removeItem">;
type Failure = { ok: false; message: string };
export type FamilyLoadResult =
  | { ok: true; document: FamilyStorageDocument | null; snapshot: string | null }
  | (Failure & { snapshot: string | null });

export function loadFamily(storage: StorageProvider, productIds: readonly string[]): FamilyLoadResult {
  let snapshot: string | null = null;
  try {
    snapshot = storage().getItem(FAMILY_STORAGE_KEY);
  } catch {
    return { ok: false, snapshot, message: "Браузер не разрешил прочитать локальные данные. Проверьте настройки и повторите попытку." };
  }
  if (snapshot === null) return { ok: true, document: null, snapshot };
  try {
    const document: unknown = JSON.parse(snapshot);
    if (isFamilyStorageDocument(document, productIds)) return { ok: true, document, snapshot };
  } catch { /* Keep the original record available for an explicit reset. */ }
  return { ok: false, snapshot, message: "Локальные данные повреждены или имеют неподдерживаемый формат. Исходная запись сохранена без изменений." };
}

export function saveFamily(storage: StorageProvider, document: FamilyStorageDocument, productIds: readonly string[], expectedSnapshot: string | null): Failure | { ok: true; snapshot: string } {
  if (!isFamilyStorageDocument(document, productIds)) return { ok: false, message: "Данные профиля не прошли проверку. Сохранение отменено." };
  const current = loadFamily(storage, productIds);
  if (!current.ok) return current;
  if (current.snapshot !== expectedSnapshot) return { ok: false, message: "Локальные данные изменились в другой вкладке. Введённые значения сохранены в форме. Отмените редактирование и перечитайте список перед новой попыткой." };
  try {
    const snapshot = JSON.stringify(document);
    storage().setItem(FAMILY_STORAGE_KEY, snapshot);
    return { ok: true, snapshot };
  } catch {
    return { ok: false, message: "Не удалось сохранить профиль в браузере. Введённые значения остались в форме. Проверьте доступ и свободное место, затем повторите попытку." };
  }
}

/** Only called after the user explicitly confirms discarding this exact record. */
export function resetFamily(storage: StorageProvider, expectedSnapshot: string): Failure | { ok: true } {
  try {
    const target = storage();
    if (target.getItem(FAMILY_STORAGE_KEY) !== expectedSnapshot) return { ok: false, message: "Запись изменилась. Перечитайте данные перед сбросом." };
    target.removeItem(FAMILY_STORAGE_KEY);
    return { ok: true };
  } catch {
    return { ok: false, message: "Браузер не разрешил сбросить данные. Исходная запись не заменена." };
  }
}
