import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { products, recipes } from "./catalog";
import { RecipeCatalog } from "./recipe-catalog";
import { RecipeDetails } from "./recipe-details";

describe("recipe read-only states", () => {
  it("explains an empty catalog", () => {
    const html = renderToStaticMarkup(createElement(RecipeCatalog, { recipes: [], products }));
    expect(html).toContain("Рецептов пока нет");
    expect(html).not.toMatch(/href="\/recipes\//);
  });

  it("does not present totals for a recipe with missing product data", () => {
    const html = renderToStaticMarkup(createElement(RecipeDetails, { recipe: recipes[0], products: [] }));
    expect(html).toContain("Расчёт недоступен");
    expect(html).toContain("отсутствует в справочнике");
    expect(html).not.toContain("Весь рецепт");
    expect(html).not.toContain("На 100 г готового блюда");
  });

  it("keeps calculated nutrition available without a cooked yield", () => {
    const html = renderToStaticMarkup(createElement(RecipeDetails, { recipe: recipes[0], products }));
    expect(html).toContain("798,8");
    expect(html).toContain("399,4");
    expect(html).toContain("Без данных о выходе");
    expect(html).not.toContain("Расчёт недоступен");
  });
});
