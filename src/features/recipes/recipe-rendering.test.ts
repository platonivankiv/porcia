import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { products, recipes } from "./catalog";
import { RecipeCatalog } from "./recipe-catalog";
import { RecipePhoto } from "./recipe-photo";
import { RecipeDetails } from "./recipe-details";

describe("recipe read-only states", () => {
  it("preserves fractional base servings in catalog cards", () => {
    const html = renderToStaticMarkup(createElement(RecipeCatalog, {
      recipes: [{ ...recipes[0], baseServings: 1.25 }],
      products,
    }));
    expect(html).toContain("Порций: 1,25");
  });
  it("does not round a fractional serving count to the nutrition display precision", () => {
    const html = renderToStaticMarkup(createElement(RecipeDetails, { recipe: { ...recipes[0], baseServings: 1.25 }, products }));
    expect(html).toContain("Порций: 1,25");
  });
  it("explains an empty catalog", () => {
    const html = renderToStaticMarkup(createElement(RecipeCatalog, { recipes: [], products }));
    expect(html).toContain("Рецептов пока нет");
    expect(html).not.toMatch(/href="\/recipes\//);
  });

  it("does not present totals for a recipe with missing product data", () => {
    const html = renderToStaticMarkup(createElement(RecipeDetails, { recipe: recipes[0], products: [] }));
    expect(html).toContain("Расчёт недоступен");
    expect(html).toContain("отсутствует в справочнике");
    expect(html).not.toContain("КБЖУ выбранного объёма");
    expect(html).not.toContain('aria-label="КБЖУ одной порции"');
    expect(html).not.toContain("На 100 г готового блюда");
  });

  it("keeps calculated nutrition available without a cooked yield", () => {
    const html = renderToStaticMarkup(createElement(RecipeDetails, { recipe: recipes[0], products }));
    expect(html).toContain("835,9");
    expect(html).toContain("417,9");
    expect(html).toContain("Без данных о выходе");
    expect(html).not.toContain("Расчёт недоступен");
  });
  it("shows kitchen quantities, per-serving nutrition and expandable calculation details", () => {
    const html = renderToStaticMarkup(createElement(RecipeDetails, { recipe: recipes[0], products }));
    expect(html).toContain("2 средних банана");
    expect(html).toContain("400 мл");
    expect(html).toContain("На одну порцию");
    expect(html).toContain("<details");
    expect(html).not.toContain("<details open");
    expect(html).toContain("Расчёт и источники");
    expect(html).toContain("AI-иллюстрация блюда");
    expect(html).not.toContain("Взвесьте мякоть банана");
    expect(html).toContain('for="recipe-servings"');
    expect(html).toContain('inputMode="decimal"');
    expect(html).toContain('value="2"');
    expect(html).toContain("Базовых порций");
    expect(html).not.toContain("Отмерьте 120 г");
  });

  it("explains the absence of a photo without producing a broken image", () => {
    const html = renderToStaticMarkup(createElement(RecipePhoto, { image: undefined }));
    expect(html).toContain("Изображения пока нет");
    expect(html).not.toContain("<img");
  });
});
