import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { products, recipes } from "./catalog";
import { FamilyPortionsEditor, FamilyRecipePortions } from "./family-recipe-portions";
import { emptyCalculationSettings } from "../family/model";

it("starts loading without invented family profiles", () => {
  const html = renderToStaticMarkup(createElement(FamilyRecipePortions, { recipe: recipes[2], products }));
  expect(html).toContain("Загружаем участников");
  expect(html).toContain("назначения сбросятся");
  expect(html).not.toContain("checkbox");
});
it("explains one component serving through original ingredients without assigning it", () => {
  const member = { id: "a", householdId: "home", displayName: "Участник", ageYears: null, heightCm: null, weightKg: null, goal: null, calculation: emptyCalculationSettings, restrictions: { status: "not-specified" as const }, preferences: [] };
  const html = renderToStaticMarkup(createElement(FamilyPortionsEditor, { recipe: recipes[2], products, members: [member] }));
  expect(html).toContain("Что означает 1 базовая порция");
  expect(html).toContain("80 г");
  expect(html).toContain("200 г");
  expect(html).toContain("5 г");
  expect(html).toContain("сухой продукт");
  expect(html).toContain("сырой продукт");
  expect(html).toContain("Участник");
  expect(html).not.toContain("checked");
  expect(html).not.toContain("КБЖУ порции:");
  expect(html).not.toContain("Ожидаемый выход:");
});
it("does not present partial ingredient data as a complete serving", () => {
  const html = renderToStaticMarkup(createElement(FamilyPortionsEditor, { recipe: recipes[2], products: [], members: [] }));
  expect(html).toContain("Расчёт порций недоступен");
  expect(html).not.toContain("Что означает 1 базовая порция");
});
