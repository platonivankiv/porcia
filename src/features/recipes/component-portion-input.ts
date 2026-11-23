export type ComponentPortionInput =
  | Readonly<{ status: "empty" }>
  | Readonly<{ status: "invalid"; message: string }>
  | Readonly<{ status: "valid"; value: number }>;

export function parseComponentPortionInput(input: string): ComponentPortionInput {
  const text = input.trim();
  if (text === "") return { status: "empty" };
  const value = Number(text.replace(",", "."));
  if (!/^(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(text) || !Number.isFinite(value) || value < 0
    || (value === 0 && /[1-9]/.test(text))) {
    return { status: "invalid", message: "Введите число от 0, например 0,5 или 1.25." };
  }
  return { status: "valid", value };
}
