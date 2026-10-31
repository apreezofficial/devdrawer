export const FAKE_DATA_FIELDS = [
  "id", "firstName", "lastName", "fullName", "email", "username", "phone", "avatar",
  "jobTitle", "company", "street", "city", "country", "zip", "latitude", "longitude",
  "birthdate", "createdAt", "url", "ipv4", "color", "product", "price", "creditCardTest",
  "iban", "sentence", "paragraph", "boolean", "number",
] as const;

export type FakeDataConfig = {
  fields: string[];
  count: number;
  format: "json" | "csv" | "sql";
  seed: string;
};

export function parseFakeDataConfig(input: string): FakeDataConfig | null {
  try {
    const value = JSON.parse(input);
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const fields = Array.isArray(value.fields)
      ? [...new Set<string>(value.fields.filter((f: unknown) => typeof f === "string" && FAKE_DATA_FIELDS.includes(f as typeof FAKE_DATA_FIELDS[number])))]
      : [];
    if (!fields.length || typeof value.count !== "number" || !Number.isFinite(value.count)) return null;
    if (!["json", "csv", "sql"].includes(value.format)) return null;
    return {
      fields,
      count: Math.max(1, Math.min(5000, Math.floor(value.count))),
      format: value.format,
      seed: typeof value.seed === "string" ? value.seed.slice(0, 200) : "",
    };
  } catch {
    return null;
  }
}
