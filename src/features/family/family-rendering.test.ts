import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FamilyProfiles } from "./family-profiles";
import { emptyCalculationSettings } from "./model";
import { NutritionRecommendation } from "./nutrition-recommendation";
import { MemberForm } from "./member-form";
import { MemberCard } from "./member-card";

describe("family profile interface", () => {
  it("starts with loading and does not display a large form or invented profiles", () => {
    const html = renderToStaticMarkup(createElement(FamilyProfiles, { products: [] }));
    expect(html).toContain("Загружаем участников");
    expect(html).not.toContain("<form");
    expect(html).not.toContain("Тестовый участник");
  });
  it("offers all four goals and optional physical data without suggested nutrition", () => {
    const html = renderToStaticMarkup(createElement(MemberForm, { products: [], onSave: () => null, onCancel: () => {} }));
    for (const label of ["Похудение", "Поддержание", "Набор массы", "Рекомпозиция", "Возраст, лет", "Рост, см", "Вес, кг"]) expect(html).toContain(label);
    expect(html).not.toContain('name="calories"');
    expect(html).not.toContain('name="protein"');
    expect(html).not.toContain("Принять");
    expect(html).toContain('name="activity"');
    expect(html).not.toContain('value="2000"');
    expect(html).toContain("автоматически не проверяются");
  });
});

it("offers independently labelled food checkboxes and preserves saved choices", () => {
  const member = { id: "test", householdId: "home", displayName: "Участник", ageYears: null, heightCm: null, weightKg: null, goal: null,
    restrictions: { status: "recorded" as const, items: [{ kind: "allergy" as const, subject: { kind: "product" as const, productId: "milk" } }] },
    preferences: [{ preference: "like" as const, subject: { kind: "product" as const, productId: "oats" } }], calculation: emptyCalculationSettings };
  const html = renderToStaticMarkup(createElement(MemberForm, { member, products: [{ id: "milk", name: "Молоко" }, { id: "oats", name: "Овсяные хлопья" }], onSave: () => null, onCancel: () => {} }));
  for (const prefix of ["allergy", "exclusion", "like", "dislike"]) {
    for (const productId of ["milk", "oats"]) {
      const input = html.match(new RegExp(`<input[^>]*id="${prefix}-${productId}"[^>]*>`))?.[0];
      expect(input).toContain('type="checkbox"');
      expect(input).toContain(`name="${prefix}Products"`);
      expect(input).toContain(`value="${productId}"`);
      expect(input?.includes('checked=""')).toBe((prefix === "allergy" && productId === "milk") || (prefix === "like" && productId === "oats"));
      expect(html).toContain(`for="${prefix}-${productId}"`);
    }
  }
  expect(html).not.toContain("multiple");
  expect(html).not.toContain("удерживайте Ctrl");
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

it("shows a neutral member card with daily targets and keeps calculation details available", () => {
  const member = { id: "test", householdId: "home", displayName: "Саша", ageYears: 30, heightCm: 180, weightKg: 80, goal: "maintenance" as const,
    restrictions: { status: "not-specified" as const }, preferences: [],
    calculation: { sexForEquation: "male" as const, activity: "inactive" as const, training: "none" as const } };
  const html = renderToStaticMarkup(createElement(MemberCard, { member, products: [], onEdit: () => {} }));
  expect(html).toContain("Саша");
  expect(html).toContain('aria-label="Редактировать: Саша"');
  expect(html).toContain("2 726,2");
  expect(html).toContain("96");
  expect(html).toContain("Параметры и расчёт");
  expect(html).not.toContain("<img");
  expect(html).toContain("Ограничения не указаны");
});

it("removes applicability questions and marks calculation inputs without requiring them for saving", () => {
  const html = renderToStaticMarkup(createElement(MemberForm, { products: [], onSave: () => null, onCancel: () => {} }));
  for (const removed of ["Применимость взрослого сценария", "pregnancyOrLactation", "specialNutritionNeeds", "eatingOrUnderfuellingConcerns", "Беременность", "заболевания"]) {
    expect(html).not.toContain(removed);
  }
  for (const name of ["displayName", "ageYears", "heightCm", "weightKg", "goal", "activity", "training"]) {
    const control = html.match(new RegExp(`<(?:input|select)[^>]*name="${name}"[^>]*>`))?.[0];
    expect(control).toBeDefined();
    expect(control?.includes('required=""')).toBe(name === "displayName");
  }
  expect(html).toContain("Имя обязательно для сохранения профиля");
  expect(html).toContain("Нужна для КБЖУ, необязательна для сохранения");
});

it("offers two optional illustrated sex categories as a named radio group", () => {
  const html = renderToStaticMarkup(createElement(MemberForm, { products: [], onSave: () => null, onCancel: () => {} }));
  expect(html).toContain("Половая категория для расчёта");
  for (const value of ["male", "female"]) {
    const radio = html.match(new RegExp(`<input[^>]*id="sexForEquation-${value}"[^>]*>`))?.[0];
    expect(radio).toContain('type="radio"');
    expect(radio).toContain('name="sexForEquation"');
    expect(radio).toContain(`value="${value}"`);
    expect(radio).toContain("sexForEquation-hint");
    expect(radio).not.toContain('checked=""');
    expect(radio).not.toContain('required=""');
    expect(html).toContain(`for="sexForEquation-${value}"`);
  }
  expect(html).toContain("Снять выбор");
});

it("explains the limits and current version of calculated targets", () => {
  const html = renderToStaticMarkup(createElement(NutritionRecommendation, {inputs: null}));
  expect(html).toContain("КБЖУ — расчётные ориентиры. Они не учитывают индивидуальные медицинские обстоятельства");
  expect(html).toContain("porcia-eer2023-v2");
});

it("keeps partial energy and missing-target reasons visible on compact cards", () => {
  const html = renderToStaticMarkup(createElement(NutritionRecommendation, { compact: true, inputs: {
    ageYears: 30, heightCm: 180, weightKg: 80, goal: null,
    calculation: { sexForEquation: "male", activity: "inactive", training: null },
  } }));
  const visible = html.split("<details")[0];
  expect(visible).toContain("Расчёт доступен частично");
  expect(visible).toContain("2 726,2");
  expect(visible).toContain("Выберите цель и тренировочный контекст");
  expect(visible).not.toContain("<dl");
});

it("keeps existing nutrition warnings visible in the compact presentation", () => {
  const html = renderToStaticMarkup(createElement(NutritionRecommendation, { compact: true, inputs: {
    ageYears: 60, heightCm: 160, weightKg: 75, goal: "weight-loss",
    calculation: { sexForEquation: "female", activity: "inactive", training: "regular-strength" },
  } }));
  expect(html.split("<details")[0]).toContain("Доля углеводов вне общего справочного диапазона");
});

it("keeps all three editor sections mounted and offers four keyboard radio goals", () => {
  const html = renderToStaticMarkup(createElement(MemberForm, { products: [], onSave: () => null, onCancel: () => {} }));
  expect(html).toContain('aria-label="Разделы профиля"');
  for (const section of ["basic", "activity", "food"]) expect(html).toContain(`id="member-section-${section}"`);
  for (const value of ["weight-loss", "muscle-gain", "maintenance", "recomposition"]) {
    expect(html.match(new RegExp(`<input[^>]*name="goal"[^>]*value="${value}"[^>]*>`))?.[0]).toContain('type="radio"');
  }
  expect(html).not.toContain('<select id="goal"');
  expect(html).toContain('name="avatarId"');
});

it("uses only the explicit avatar and resolves food tags from real product names", () => {
  const member = { id: "avatar-test", householdId: "home", displayName: "Любое имя", avatarId: "man" as const,
    ageYears: null, heightCm: null, weightKg: null, goal: null,
    calculation: { ...emptyCalculationSettings, sexForEquation: "female" as const },
    restrictions: { status: "recorded" as const, items: [{ kind: "allergy" as const, subject: { kind: "product" as const, productId: "milk" } }] },
    preferences: [{ preference: "dislike" as const, subject: { kind: "description" as const, label: "Грибы" } }],
  };
  const html = renderToStaticMarkup(createElement(MemberCard, { member, products: [{ id: "milk", name: "Молоко" }], onEdit: () => {} }));
  expect(html).toContain("man.webp");
  expect(html).not.toContain("woman.webp");
  expect(html).toContain("Аллергия: Молоко");
  expect(html).toContain("Не нравится: Грибы");
  expect(html.match(/<summary>/g)).toHaveLength(1);
});
