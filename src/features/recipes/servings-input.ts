export type ServingsInput =
  | Readonly<{ status: "empty" }>
  | Readonly<{ status: "invalid"; message: string }>
  | Readonly<{ status: "valid"; value: number }>;

/** Validates the entire decimal string before converting it to a number. */
export function parseServingsInput(input: string): ServingsInput {
  const text = input.trim();
  if (text === "") return { status: "empty" };

  const invalid: ServingsInput = {
    status: "invalid",
    message: "Введите положительное число порций, например 2 или 1,25.",
  };
  if (!/^(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(text)) return invalid;

  const value = Number(text.replace(",", "."));
  return Number.isFinite(value) && value > 0 ? { status: "valid", value } : invalid;
}
