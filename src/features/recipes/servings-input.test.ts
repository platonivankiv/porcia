import { describe, expect, it } from "vitest";
import { parseServingsInput } from "./servings-input";

describe("servings input", () => {
  it.each([["2", 2], ["0,5", 0.5], ["1,25", 1.25], ["1.25", 1.25]])("accepts a complete positive decimal: %s", (input, value) => {
    expect(parseServingsInput(String(input))).toEqual({ status: "valid", value });
  });
  it.each(["", "   ", "\t\n"])("keeps an empty editing state separate from zero: %j", (input) => {
    expect(parseServingsInput(input)).toEqual({ status: "empty" });
  });
  it.each(["2,", "2.", "0", "0,0", "-1", "-0,5", "abc", "2abc", "NaN", "Infinity", "1e3", "0x10", "1 2", "1,2.3", "9".repeat(400)])("rejects an invalid or incomplete decimal: %j", (input) => {
    expect(parseServingsInput(input)).toMatchObject({ status: "invalid", message: expect.any(String) });
  });
  it("accepts surrounding whitespace without rewriting the input string", () => {
    expect(parseServingsInput(" 1,25 ")).toEqual({ status: "valid", value: 1.25 });
  });
});
