import { describe, expect, it } from "vitest";
import { calculateNutritionRecommendation, type CalculationInputs } from "./calculate-targets";

const inputs: CalculationInputs = {
  ageYears: 30, heightCm: 180, weightKg: 80, goal: "maintenance",
  calculation: { sexForEquation: "male", activity: "inactive", training: "none",
    pregnancyOrLactation: "no", specialNutritionNeeds: "no", eatingOrUnderfuellingConcerns: "no" },
};

describe("EER 2023 adult equations", () => {
  // Independently worked at age 30, height 180 cm and weight 80 kg from Health Canada's table.
  it.each([
    ["male", "inactive", 2726.17], ["male", "low-active", 2945.77],
    ["male", "active", 3126.32], ["male", "very-active", 3495.82],
    ["female", "inactive", 2341], ["female", "low-active", 2524.67],
    ["female", "active", 2664.35], ["female", "very-active", 2938.93],
  ] as const)("calculates %s / %s", (sexForEquation, activity, expected) => {
    const result = calculateNutritionRecommendation({ ...inputs, calculation: { ...inputs.calculation, sexForEquation, activity } });
    expect(result.status).toBe("complete");
    if (result.status !== "complete") throw new Error("Expected complete adult recommendation");
    expect(result.maintenanceCalories).toBeCloseTo(expected, 8);
    expect(result.values.calories).toBeCloseTo(expected, 8);
    expect(result.values.protein).toBe(96);
  });
});

it.each([
  ["maintenance", "none", 2726.17, 96],
  ["maintenance", "regular-other", 2726.17, 128],
  ["maintenance", "regular-strength", 2726.17, 128],
  ["weight-loss", "none", 2453.553, 112],
  ["weight-loss", "regular-other", 2453.553, 112],
  ["weight-loss", "regular-strength", 2453.553, 144],
  ["muscle-gain", "regular-strength", 2862.4785, 128],
  ["recomposition", "regular-strength", 2726.17, 144],
] as const)("applies %s / %s without counting training twice", (goal, training, calories, protein) => {
  const result = calculateNutritionRecommendation({ ...inputs, goal, calculation: { ...inputs.calculation, training } });
  if (result.status !== "complete") throw new Error("Expected full recommendation");
  expect(result.values.calories).toBeCloseTo(calories, 8);
  expect(result.values.protein).toBe(protein);
  expect(result.values.fat).toBeCloseTo(calories * 0.30 / 9, 8);
  expect(4 * result.values.protein + 9 * result.values.fat + 4 * result.values.carbohydrates).toBeCloseTo(calories, 8);
});

it.each(["muscle-gain", "recomposition"] as const)("shows only maintenance without strength context for %s", (goal) => {
  for (const training of [null, "none", "regular-other"] as const) {
    expect(calculateNutritionRecommendation({ ...inputs, goal, calculation: { ...inputs.calculation, training } }))
      .toMatchObject({ status: "partial", maintenanceCalories: expect.closeTo(2726.17), calories: null });
  }
});

it.each([0, 18, 18.5, -1, NaN, Infinity])("does not issue an adult estimate for invalid/unsupported age %s", (ageYears) => {
  expect(calculateNutritionRecommendation({ ...inputs, ageYears }).status).toBe("unavailable");
});
it.each(["pregnancyOrLactation", "specialNutritionNeeds", "eatingOrUnderfuellingConcerns"] as const)("does not treat unknown or missing %s as absent risk", (key) => {
  for (const value of ["yes", "unknown", null] as const) {
    expect(calculateNutritionRecommendation({ ...inputs, calculation: { ...inputs.calculation, [key]: value } }).status).toBe("unavailable");
  }
});
it("keeps energy partial at BMI 30 without manufacturing protein or using legacy targets", () => {
  const result = calculateNutritionRecommendation({ ...inputs, heightCm: 200, weightKg: 120 });
  expect(result).toMatchObject({ status: "partial", maintenanceCalories: expect.any(Number), calories: expect.any(Number) });
  expect(result).not.toHaveProperty("values");
  expect(calculateNutritionRecommendation({ ...inputs, heightCm: 200, weightKg: 119.999 }).status).toBe("complete");
});
it.each([0, -1, NaN, Infinity, Number.MIN_VALUE, Number.MAX_VALUE])("rejects invalid or unusable physical inputs: %s", (heightCm) => {
  expect(calculateNutritionRecommendation({ ...inputs, heightCm }).status).toBe("unavailable");
});
it("blocks a low-energy target without changing it to a manufactured minimum", () => {
  // Female inactive: 584.90 - 7.01*80 + 5.72*100 + 11.71*40 = 1064.5.
  const result = calculateNutritionRecommendation({ ...inputs, ageYears: 80, heightCm: 100, weightKg: 40,
    calculation: { ...inputs.calculation, sexForEquation: "female" } });
  expect(result).toMatchObject({ status: "partial", maintenanceCalories: expect.closeTo(1064.5), calories: null });
});
it("does not block a valid low-carbohydrate distribution or silently adjust fat/protein", () => {
  const result = calculateNutritionRecommendation({ ...inputs, ageYears: 60, heightCm: 160, weightKg: 75, goal: "weight-loss",
    calculation: { ...inputs.calculation, sexForEquation: "female", training: "regular-strength" } });
  if (result.status !== "complete") throw new Error("Expected complete distribution outside the reference range");
  expect(result.values.protein).toBe(135);
  expect(result.values.fat).toBeCloseTo(result.values.calories * 0.30 / 9);
  expect(result.values.carbohydrates * 4 / result.values.calories).toBeLessThan(0.45);
  expect(result.warnings.length).toBeGreaterThan(0);
});
it("retains the adult boundary at 19 and never mutates source parameters", () => {
  const value = { ...inputs, ageYears: 19 };
  const before = structuredClone(value);
  expect(calculateNutritionRecommendation(value).status).toBe("complete");
  expect(value).toEqual(before);
});

it.each([
  [123.68863636363633, "partial"], [123.6888111888112, "partial"], [123.68898601398598, "complete"],
] as const)("checks the unrounded 1200 kcal boundary at height %s", (heightCm, status) => {
  expect(calculateNutritionRecommendation({ ...inputs, ageYears: 80, heightCm, weightKg: 40,
    calculation: { ...inputs.calculation, sexForEquation: "female" } }).status).toBe(status);
});
it("refuses impossible distribution without reducing protein or fat", () => {
  // Synthetic numeric boundary, not a realistic profile: energy >1200, BMI <30, residual carbohydrate <0.
  const result = calculateNutritionRecommendation({ ...inputs, ageYears: 260, heightCm: 250, weightKg: 163, goal: "weight-loss",
    calculation: { ...inputs.calculation, training: "regular-strength" } });
  expect(result).toMatchObject({status: "partial", calories: expect.closeTo(1674.513)});
  expect(result).not.toHaveProperty("values");
});
it.each([null, 0, -1, NaN, Infinity, Number.MAX_VALUE])("rejects missing or unusable weight %s", (weightKg) => {
  expect(calculateNutritionRecommendation({ ...inputs, weightKg }).status).toBe("unavailable");
});
it("does not use archived manual values as a fallback for high BMI", () => {
  const withArchive = { ...inputs, weightKg: 120, heightCm: 200,
    legacyDailyTargets: {calories: {value: 9999, source: "manual"}, protein: {value: 200, source: "manual"}} };
  expect(calculateNutritionRecommendation(withArchive)).toEqual(calculateNutritionRecommendation({...inputs, weightKg: 120, heightCm: 200}));
});

it.each([[160, 76.8], [185, 102.675]])("treats decimal parameters exactly on BMI 30 as partial: %s cm / %s kg", (heightCm, weightKg) => {
  expect(calculateNutritionRecommendation({...inputs, heightCm, weightKg}).status).toBe("partial");
  expect(calculateNutritionRecommendation({...inputs, heightCm, weightKg: weightKg - 0.000001}).status).toBe("complete");
});

it("allows an exactly zero carbohydrate residual without inventing a positive minimum", () => {
  // Synthetic arithmetic boundary: E=1600, K=1440, P=252 g, F=48 g, C=0 g.
  const result = calculateNutritionRecommendation({...inputs, ageYears: 260, heightCm: 259.8046153846154, weightKg: 140, goal: "weight-loss",
    calculation: {...inputs.calculation, training: "regular-strength"}});
  expect(result).toMatchObject({status: "complete", values: {calories: 1440, protein: 252, fat: 48, carbohydrates: 0}});
});

it("explains target energy overflow as a numeric limitation, not a low-energy diet", () => {
  const result = calculateNutritionRecommendation({...inputs, heightCm: 8e155, weightKg: 1.27e307, goal: "muscle-gain",
    calculation: {...inputs.calculation, training: "regular-strength"}});
  expect(result).toMatchObject({status: "partial", calories: null, reason: expect.stringContaining("числовой диапазон")});
});
