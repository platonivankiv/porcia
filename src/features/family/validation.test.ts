import { describe, expect, it } from "vitest";
import { emptyCalculationSettings } from "./model";
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
        calculation: emptyCalculationSettings,
      },
    });
  });
});

it("accepts zero age and decimal comma/dot without calculating nutrition", () => {
  const form = new FormData();
  Object.entries({ displayName: "Тест", ageYears: "0", heightCm: "52,5", weightKg: "3.25", goal: "recomposition", calories: "1800,5", protein: "100.25", fat: "0" }).forEach(([key, value]) => form.set(key, value));
  expect(parseMemberForm(form, [])).toMatchObject({ ok: true, value: {
    ageYears: 0, heightCm: 52.5, weightKg: 3.25, goal: "recomposition",
    calculation: emptyCalculationSettings,
  } });
});

it.each([
  ["ageYears", "1.5"], ["ageYears", "-1"], ["ageYears", "9007199254740992"],
  ["heightCm", "0"], ["weightKg", "-2"], ["weightKg", "Infinity"],
  ["sexForEquation", "other"], ["activity", "daily"], ["training", "yes"], ["specialNutritionNeeds", "false"],
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

it("saves calculation parameters and ignores submitted legacy targets", () => {
  const form = new FormData();
  Object.entries({displayName: "Тест", sexForEquation: "female", activity: "active", training: "regular-strength", pregnancyOrLactation: "no", specialNutritionNeeds: "unknown", eatingOrUnderfuellingConcerns: "no", calories: "9999"}).forEach(([key, value]) => form.set(key, value));
  const result = parseMemberForm(form, []);
  expect(result).toMatchObject({ok: true, value: {calculation: {sexForEquation: "female", activity: "active", training: "regular-strength", specialNutritionNeeds: "unknown"}}});
  if (!result.ok) throw new Error("Expected profile");
  expect(result.value).not.toHaveProperty("dailyTargets");
  expect(result.value).not.toHaveProperty("legacyDailyTargets");
});
