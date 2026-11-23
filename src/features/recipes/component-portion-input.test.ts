import { expect, it } from "vitest";
import { parseComponentPortionInput } from "./component-portion-input";

it.each([["0", 0], ["0,5", 0.5], ["1.25", 1.25], [" .5 ", 0.5], [" 2 ", 2]])("parses %s without assigning a default", (text, value) => {
  expect(parseComponentPortionInput(String(text))).toEqual({ status: "valid", value });
});
it.each(["", "   "])("keeps empty input separate from zero: %s", (text) => {
  expect(parseComponentPortionInput(text)).toEqual({ status: "empty" });
});
it.each(["-1", "NaN", "Infinity", "1e3", "1x", "1,2.3", "1.", "9".repeat(400), `0.${"0".repeat(400)}1`])("rejects invalid input: %s", (text) => {
  expect(parseComponentPortionInput(text).status).toBe("invalid");
});
