import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FamilyProfiles } from "./family-profiles";
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
    for (const label of ["Похудение", "Поддержание", "Набор массы", "Рекомпозиция", "Возраст, полных лет", "Рост, см", "Вес, кг", "Задано вручную"]) expect(html).toContain(label);
    expect(html).toContain('name="calories"');
    expect(html).not.toContain('value="2000"');
    expect(html).toContain("автоматически не проверяются");
  });
});

it.each([1e-7, 1e21, Number.MIN_VALUE, Number.MAX_VALUE])("preserves a finite numeric value when reopening the editor: %s", (value) => {
  const member = { id: "test", householdId: "home", displayName: "Тест", ageYears: null, heightCm: null, weightKg: value, goal: null,
    restrictions: { status: "not-specified" as const }, preferences: [], dailyTargets: { calories: null, protein: null, fat: null, carbohydrates: null } };
  const html = renderToStaticMarkup(createElement(MemberForm, { member, products: [], onSave: () => null, onCancel: () => {} }));
  const input = html.match(/<input[^>]*name="weightKg"[^>]*>/)?.[0];
  const displayed = input?.match(/value="([^"]*)"/)?.[1];
  expect(displayed).toBeDefined();
  expect(displayed).not.toMatch(/[eE]/);
  expect(Number(displayed)).toBe(value);
});
