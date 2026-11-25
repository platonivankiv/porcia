import { describe, expect, it } from "vitest";
import { loadFamily, saveFamily, resetFamily, FAMILY_STORAGE_KEY } from "./storage";
import { emptyCalculationSettings } from "./model";
import type { FamilyStorageDocument } from "./model";

const document: FamilyStorageDocument = {
  version: 2, household: { id: "household-test", displayName: "Тестовая семья" },
  members: [{ id: "member-test", householdId: "household-test", displayName: "Тест",
    ageYears: 0, heightCm: 50.5, weightKg: 3.5, goal: "recomposition",
    restrictions: { status: "not-specified" }, preferences: [],
    calculation: emptyCalculationSettings,
    legacyDailyTargets: { calories: null, protein: { value: 0, source: "manual" }, fat: null, carbohydrates: null },
  }],
};
function memory(initial: string | null = null) {
  const entries = new Map<string, string>();
  if (initial !== null) entries.set(FAMILY_STORAGE_KEY, initial);
  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => { entries.set(key, value); },
    removeItem: (key: string) => { entries.delete(key); },
  };
}

describe("family storage boundary", () => {
  it("starts empty and restores a saved profile without changing manual or missing values", () => {
    const storage = memory();
    expect(loadFamily(() => storage, [])).toEqual({ ok: true, document: null, snapshot: null });
    const result = saveFamily(() => storage, document, [], null);
    expect(result.ok).toBe(true);
    expect(loadFamily(() => storage, [])).toMatchObject({ ok: true, document });
  });
});

it.each(["{broken", "null", "{}", JSON.stringify({ ...document, version: 3 }),
  JSON.stringify({ ...document, members: [{ ...document.members[0], ageYears: -1 }] }),
  JSON.stringify({ ...document, members: [{ ...document.members[0], householdId: "other" }] }),
  JSON.stringify({ ...document, members: [document.members[0], document.members[0]] }),
  JSON.stringify({ ...document, members: [{ ...document.members[0], legacyDailyTargets: { ...document.members[0].legacyDailyTargets, protein: { value: 10, source: "calculated" } } }] }),
])("reports damaged/unsupported data without changing the original: %s", (raw) => {
  const storage = memory(raw);
  expect(loadFamily(() => storage, [])).toMatchObject({ ok: false, snapshot: raw });
  expect(saveFamily(() => storage, document, [], raw)).toMatchObject({ ok: false });
  expect(storage.getItem(FAMILY_STORAGE_KEY)).toBe(raw);
});

it("rejects an invalid outgoing document", () => {
  const storage = memory();
  expect(saveFamily(() => storage, { ...document, members: [{ ...document.members[0], heightCm: 0 }] }, [], null)).toMatchObject({ ok: false });
  expect(storage.getItem(FAMILY_STORAGE_KEY)).toBeNull();
});

it("does not overwrite a concurrent change, including newly corrupted data", () => {
  const storage = memory();
  storage.setItem(FAMILY_STORAGE_KEY, "new data");
  expect(saveFamily(() => storage, document, [], null)).toMatchObject({ ok: false });
  expect(resetFamily(() => storage, "old data")).toMatchObject({ ok: false });
  expect(storage.getItem(FAMILY_STORAGE_KEY)).toBe("new data");
});

it("resets corrupted data only through the explicit reset operation", () => {
  const storage = memory("broken");
  expect(resetFamily(() => storage, "broken")).toEqual({ ok: true });
  expect(loadFamily(() => storage, [])).toMatchObject({ ok: true, document: null });
});

it("reports denied storage access and failed writes/removal", () => {
  const denied = () => { throw new Error("SecurityError"); };
  expect(loadFamily(denied, [])).toMatchObject({ ok: false, snapshot: null });
  expect(saveFamily(denied, document, [], null)).toMatchObject({ ok: false });
  const storage = { getItem: () => null, setItem: () => { throw new Error("QuotaExceededError"); }, removeItem: denied };
  expect(saveFamily(() => storage, document, [], null)).toMatchObject({ ok: false });
  expect(resetFamily(() => ({ ...storage, getItem: () => "broken" }), "broken")).toMatchObject({ ok: false });
});

it("migrates v1 in memory without rewriting the raw record or substituting manual targets", () => {
  const { calculation: omitted, legacyDailyTargets, ...member } = document.members[0];
  expect(omitted).toEqual(emptyCalculationSettings);
  const old = { version: 1, household: document.household, members: [{...member, dailyTargets: legacyDailyTargets}] };
  const raw = JSON.stringify(old);
  const storage = memory(raw);
  const result = loadFamily(() => storage, []);
  expect(result).toMatchObject({ok: true, snapshot: raw, document: {version: 2, members: [{...member, calculation: emptyCalculationSettings, legacyDailyTargets}]}});
  expect(storage.getItem(FAMILY_STORAGE_KEY)).toBe(raw);
  if (!result.ok || !result.document) throw new Error("Expected migrated profile");
  expect(result.document.members[0]).not.toHaveProperty("dailyTargets");
  expect(saveFamily(() => storage, result.document, [], raw).ok).toBe(true);
  expect(JSON.parse(storage.getItem(FAMILY_STORAGE_KEY)!)).toEqual(result.document);
});

it("preserves v1 when migration cannot be written", () => {
  const {calculation, legacyDailyTargets, ...member} = document.members[0];
  expect(calculation).toEqual(emptyCalculationSettings);
  const raw = JSON.stringify({version: 1, household: document.household, members: [{...member, dailyTargets: legacyDailyTargets}]});
  const storage = memory(raw);
  const loaded = loadFamily(() => storage, []);
  if (!loaded.ok || !loaded.document) throw new Error("Expected migrated data");
  const failing = {...storage, setItem: () => {throw new Error("QuotaExceededError");}};
  expect(saveFamily(() => failing, loaded.document!, [], raw).ok).toBe(false);
  expect(storage.getItem(FAMILY_STORAGE_KEY)).toBe(raw);
});
it.each([
  {...document, members: [{...document.members[0], calculation: {...emptyCalculationSettings, activity: "unknown"}}]},
  {...document, members: [{...document.members[0], calculation: {...emptyCalculationSettings, specialNutritionNeeds: false}}]},
  {...document, members: [{...document.members[0], dailyTargets: {calories: 2000}}]},
  {version: 1, household: document.household, members: [{...document.members[0], dailyTargets: {calories: null}}]},
])("keeps structurally invalid stored parameters untouched", (invalid) => {
  const raw = JSON.stringify(invalid);
  const storage = memory(raw);
  expect(loadFamily(() => storage, []).ok).toBe(false);
  expect(saveFamily(() => storage, document, [], raw).ok).toBe(false);
  expect(storage.getItem(FAMILY_STORAGE_KEY)).toBe(raw);
});

it.each(["yes", "no", "unknown", null] as const)("round-trips original v2 compatibility answers (%s) without rewriting on read", (answer) => {
  const old = { ...document, members: [{ ...document.members[0], calculation: {
    sexForEquation: "female", activity: "active", training: "regular-strength",
    pregnancyOrLactation: answer, specialNutritionNeeds: answer, eatingOrUnderfuellingConcerns: answer,
  } }] };
  const raw = JSON.stringify(old);
  const storage = memory(raw);
  const loaded = loadFamily(() => storage, []);
  expect(loaded).toEqual({ ok: true, document: old, snapshot: raw });
  expect(storage.getItem(FAMILY_STORAGE_KEY)).toBe(raw);
  if (!loaded.ok || !loaded.document) throw new Error("Expected original v2 document");
  expect(saveFamily(() => storage, loaded.document, [], raw).ok).toBe(true);
  expect(loadFamily(() => storage, [])).toMatchObject({ ok: true, document: old });
});

it("saves and reloads a name-only profile without removed calculation answers", () => {
  const current: FamilyStorageDocument = { ...document, members: [{ ...document.members[0],
    ageYears: null, heightCm: null, weightKg: null, goal: null,
    calculation: { sexForEquation: null, activity: null, training: null },
  }] };
  const storage = memory();
  expect(saveFamily(() => storage, current, [], null).ok).toBe(true);
  expect(loadFamily(() => storage, [])).toMatchObject({ ok: true, document: current });
});

it("rejects unknown avatar identifiers without overwriting old data", () => {
  const raw = JSON.stringify({ ...document, members: [{ ...document.members[0], avatarId: "external-image" }] });
  const storage = memory(raw);
  expect(loadFamily(() => storage, [])).toMatchObject({ ok: false, snapshot: raw });
  expect(saveFamily(() => storage, document, [], raw).ok).toBe(false);
  expect(storage.getItem(FAMILY_STORAGE_KEY)).toBe(raw);
});

it.each(["man", "woman", "child"] as const)("round-trips only avatar id %s in v2, retaining member identity", (avatarId) => {
  const storage = memory(JSON.stringify(document));
  const old = loadFamily(() => storage, []);
  if (!old.ok || !old.document) throw new Error("Expected old v2 document");
  expect(old.document.members[0]).not.toHaveProperty("avatarId");
  const updated = { ...old.document, members: [{ ...old.document.members[0], avatarId }] };
  expect(saveFamily(() => storage, updated, [], old.snapshot).ok).toBe(true);
  const restored = loadFamily(() => storage, []);
  expect(restored).toMatchObject({ ok: true, document: { version: 2, members: [{ id: "member-test", avatarId }] } });
  expect(storage.getItem(FAMILY_STORAGE_KEY)).not.toContain("data:image");
  const cleared = { ...updated, members: [{ ...updated.members[0], avatarId: undefined }] };
  expect(saveFamily(() => storage, cleared, [], storage.getItem(FAMILY_STORAGE_KEY)).ok).toBe(true);
  expect(JSON.parse(storage.getItem(FAMILY_STORAGE_KEY)!).members[0]).not.toHaveProperty("avatarId");
});
