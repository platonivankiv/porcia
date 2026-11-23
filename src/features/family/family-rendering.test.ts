import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FamilyProfiles } from "./family-profiles";
import { emptyCalculationSettings } from "./model";
import { NutritionRecommendation } from "./nutrition-recommendation";
import { MemberForm } from "./member-form";

describe("family profile interface", () => {
  it("starts with loading and does not display a large form or invented profiles", () => {
    const html = renderToStaticMarkup(createElement(FamilyProfiles, { products: [] }));
    expect(html).toContain("Загружаем участников");
    expect(html).not.toContain("<form");
    expect(html).not.toContain("Тестовый участник");
  });
  it("offers all four goals and optional physical data without suggested nutrition", () => {
    const html = renderToStaticMarkup(createElement(MemberForm, { products: [], onSave: () => null, onCancel: () => {} }));
    for (const label of ["Похудение", "Поддержание", "Набор массы", "Рекомпозиция", "Возраст, полных лет", "Рост, см", "Вес, кг"]) expect(html).toContain(label);
    expect(html).not.toContain('name="calories"');
    expect(html).not.toContain('name="protein"');
    expect(html).not.toContain("Принять");
    expect(html).toContain('name="activity"');
    expect(html).not.toContain('value="2000"');
    expect(html).toContain("автоматически не проверяются");
  });
});

it.each([1e-7, 1e21, Number.MIN_VALUE, Number.MAX_VALUE])("preserves a finite numeric value when reopening the editor: %s", (value) => {
  const member = { id: "test", householdId: "home", displayName: "Тест", ageYears: null, heightCm: null, weightKg: value, goal: null,
    restrictions: { status: "not-specified" as const }, preferences: [], calculation: emptyCalculationSettings };
  const html = renderToStaticMarkup(createElement(MemberForm, { member, products: [], onSave: () => null, onCancel: () => {} }));
  const input = html.match(/<input[^>]*name="weightKg"[^>]*>/)?.[0];
  const displayed = input?.match(/value="([^"]*)"/)?.[1];
  expect(displayed).toBeDefined();
  expect(displayed).not.toMatch(/[eE]/);
  expect(Number(displayed)).toBe(value);
});

it("renders derived read-only nutrition without manual inputs", () => {
  const html = renderToStaticMarkup(createElement(NutritionRecommendation, {inputs: {ageYears: 30, heightCm: 180, weightKg: 80, goal: "maintenance", calculation: {...emptyCalculationSettings, sexForEquation: "male", activity: "inactive", training: "none", pregnancyOrLactation: "no", specialNutritionNeeds: "no", eatingOrUnderfuellingConcerns: "no"}}}));
  expect(html).toContain("2 726,2");
  expect(html).toContain("96");
  expect(html).toContain("EER 2023");
  expect(html).not.toContain("<input");
});

it("removes applicability questions and marks calculation inputs without requiring them for saving", () => {
  const html = renderToStaticMarkup(createElement(MemberForm, { products: [], onSave: () => null, onCancel: () => {} }));
  for (const removed of ["Применимость взрослого сценария", "pregnancyOrLactation", "specialNutritionNeeds", "eatingOrUnderfuellingConcerns", "Беременность", "заболевания"]) {
    expect(html).not.toContain(removed);
  }
  for (const name of ["displayName", "ageYears", "heightCm", "weightKg", "goal", "sexForEquation", "activity", "training"]) {
    const label = html.match(new RegExp(`<label[^>]*for="${name}"[^>]*>(.*?)</label>`))?.[1];
    expect(label).toContain("*");
    const control = html.match(new RegExp(`<(?:input|select)[^>]*name="${name}"[^>]*>`))?.[0];
    expect(control).toBeDefined();
    expect(control).toContain("member-fields-hint");
    expect(control?.includes('required=""')).toBe(name === "displayName");
  }
  expect(html).toContain("Имя обязательно для сохранения профиля");
  expect(html).toContain("Остальные отмеченные поля необходимы для автоматического расчёта КБЖУ");
  expect(html).toContain("Заполненность всех полей не гарантирует, что расчёт будет доступен");
});

it("explains the limits and current version of calculated targets", () => {
  const html = renderToStaticMarkup(createElement(NutritionRecommendation, {inputs: null}));
  expect(html).toContain("КБЖУ — расчётные ориентиры. Они не учитывают индивидуальные медицинские обстоятельства");
  expect(html).toContain("porcia-eer2023-v2");
});
