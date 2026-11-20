import { describe, expect, it } from "vitest";
import { parseMemberForm } from "./validation";

describe("family profile input", () => {
  it("creates a profile from a display name without inventing missing values", () => {
    const result = parseMemberForm(new FormData(), []);
    expect(result.ok).toBe(false);
    const form = new FormData();
    form.set("displayName", "  Тестовый участник  ");
    expect(parseMemberForm(form, [])).toEqual({
      ok: true,
      value: {
        displayName: "Тестовый участник", ageYears: null, heightCm: null, weightKg: null,
        goal: null, restrictions: { status: "not-specified" }, preferences: [],
        dailyTargets: { calories: null, protein: null, fat: null, carbohydrates: null },
      },
    });
  });
});

it("accepts zero age and decimal comma/dot without calculating nutrition", () => {
  const form = new FormData();
  Object.entries({ displayName: "Тест", ageYears: "0", heightCm: "52,5", weightKg: "3.25", goal: "recomposition", calories: "1800,5", protein: "100.25", fat: "0" }).forEach(([key, value]) => form.set(key, value));
  expect(parseMemberForm(form, [])).toMatchObject({ ok: true, value: {
    ageYears: 0, heightCm: 52.5, weightKg: 3.25, goal: "recomposition",
    dailyTargets: { calories: { value: 1800.5, source: "manual" }, protein: { value: 100.25, source: "manual" }, fat: { value: 0, source: "manual" }, carbohydrates: null },
  } });
});

it.each([
  ["ageYears", "1.5"], ["ageYears", "-1"], ["ageYears", "9007199254740992"],
  ["heightCm", "0"], ["weightKg", "-2"], ["weightKg", "Infinity"],
  ["calories", "0"], ["protein", "-1"], ["fat", "NaN"], ["carbohydrates", "2abc"],
  ["weightKg", "1e3"], ["goal", "unknown"],
])("rejects invalid %s=%s", (key, value) => {
  const form = new FormData();
  form.set("displayName", "Тест");
  form.set(key, value);
  expect(parseMemberForm(form, [])).toMatchObject({ ok: false, errors: { [key]: expect.any(String) } });
});

it("keeps allergies, exclusions and preferences separate without verifying descriptions", () => {
  const form = new FormData();
  Object.entries({ displayName: "Тест", restrictionsRecorded: "on", allergyDescriptions: " Арахис \n Морепродукты ", exclusionDescriptions: "Мясо", dislikeDescriptions: "Острая еда", likeDescriptions: "Яблоки" }).forEach(([key, value]) => form.set(key, value));
  form.append("allergyProducts", "milk");
  expect(parseMemberForm(form, ["milk"])).toMatchObject({ ok: true, value: {
    restrictions: { status: "recorded", items: [
      { kind: "allergy", subject: { kind: "product", productId: "milk" } },
      { kind: "allergy", subject: { kind: "description", label: "Арахис" } },
      { kind: "allergy", subject: { kind: "description", label: "Морепродукты" } },
      { kind: "exclusion", subject: { kind: "description", label: "Мясо" } },
    ] },
    preferences: [
      { preference: "like", subject: { kind: "description", label: "Яблоки" } },
      { preference: "dislike", subject: { kind: "description", label: "Острая еда" } },
    ],
  } });
});

it("distinguishes a filled empty restrictions section from unknown restrictions", () => {
  const form = new FormData();
  form.set("displayName", "Тест");
  form.set("restrictionsRecorded", "on");
  expect(parseMemberForm(form, [])).toMatchObject({ ok: true, value: { restrictions: { status: "recorded", items: [] } } });
});

it("rejects products outside the catalog", () => {
  const form = new FormData();
  form.set("displayName", "Тест");
  form.append("dislikeProducts", "missing");
  expect(parseMemberForm(form, [])).toMatchObject({ ok: false, errors: { dislikeProducts: expect.any(String) } });
});
