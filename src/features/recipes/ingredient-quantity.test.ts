import { describe, expect, it } from "vitest";
import { products } from "./catalog";
import { formatIngredientQuantity } from "./recipe-format";

describe("ingredient kitchen labels", () => {
  it("rounds binary arithmetic noise only for display and marks the approximation", () => {
    const milk = products.find((product) => product.id === "milk");
    if (!milk) throw new Error("Missing milk fixture");
    expect(formatIngredientQuantity({ productId: milk.id, quantity: 57.99999999999999, unit: "ml", state: "ready" }, milk)).toBe("≈ 58 мл");
  });
  it.each([[1, "1 средний банан"], [2, "2 средних банана"], [5, "5 средних бананов"], [11, "11 средних бананов"], [1.5, "1,5 шт. (средний банан)"], [1.04, "1,04 шт. (средний банан)"]])("labels %s medium bananas", (quantity, label) => {
    const banana = products.find((product) => product.id === "banana");
    if (!banana) throw new Error("Missing banana fixture");
    expect(formatIngredientQuantity({ productId: banana.id, quantity: Number(quantity), unit: "piece", state: "raw" }, banana)).toBe(label);
  });
});
