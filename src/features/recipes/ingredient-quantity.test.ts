import { describe, expect, it } from "vitest";
import { products } from "./catalog";
import { formatIngredientQuantity } from "./recipe-ui";

describe("ingredient kitchen labels", () => {
  it.each([[1, "1 средний банан"], [2, "2 средних банана"], [5, "5 средних бананов"], [11, "11 средних бананов"], [1.5, "1,5 шт. (средний банан)"], [1.04, "1,04 шт. (средний банан)"]])("labels %s medium bananas", (quantity, label) => {
    const banana = products.find((product) => product.id === "banana");
    if (!banana) throw new Error("Missing banana fixture");
    expect(formatIngredientQuantity({ productId: banana.id, quantity: Number(quantity), unit: "piece", state: "raw" }, banana)).toBe(label);
  });
});
