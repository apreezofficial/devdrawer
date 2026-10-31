/** Shared contracts for AI and smart-paste handoffs. Only editable settings belong here. */
type Rule = {
  type: "string" | "number" | "boolean" | "array" | "object";
  enum?: readonly (string | number)[];
  minimum?: number;
  maximum?: number;
  integer?: boolean;
  pattern?: string;
  items?: Rule;
  minItems?: number;
  maxItems?: number;
  properties?: Record<string, Rule>;
  required?: readonly string[];
};
type Contract = { fields: Record<string, Rule>; raw?: string; upload?: boolean };
const text: Rule = { type: "string" };
const bool: Rule = { type: "boolean" };
const number = (minimum = -1e12, maximum = 1e12, integer = false): Rule => ({ type: "number", minimum, maximum, integer });
const choice = (...values: (string | number)[]): Rule => ({ type: typeof values[0] === "number" ? "number" : "string", enum: values });
const hex: Rule = { type: "string", pattern: "^#[0-9a-fA-F]{6}$" };
const array = (items: Rule, minItems = 0, maxItems = 32): Rule => ({ type: "array", items, minItems, maxItems });
const object = (properties: Record<string, Rule>, required: string[] = []): Rule => ({ type: "object", properties, required });
const zone: Rule = { type: "string", pattern: "^(?:UTC|[A-Za-z_+-]+(?:/[A-Za-z0-9_+.-]+)+)$" };
const units: Record<string, string[]> = {
  Length: ["m", "km", "cm", "mm", "mi", "yd", "ft", "in"], Weight: ["kg", "g", "mg", "t", "lb", "oz"],
  Temperature: ["°C", "°F", "K"], Data: ["B", "KB", "MB", "GB", "TB", "KiB", "MiB", "GiB", "bit"],
  Time: ["s", "ms", "min", "h", "day", "week", "year"], Speed: ["m/s", "km/h", "mph", "knot"],
  Area: ["m²", "km²", "ft²", "acre", "hectare"], Volume: ["L", "mL", "m³", "gal", "fl oz", "cup"],
  CSS: ["px", "rem", "em", "pt", "in", "cm"],
};
export const FAKE_DATA_FIELDS = ["id", "firstName", "lastName", "fullName", "email", "username", "phone", "avatar", "jobTitle", "company", "street", "city", "country", "zip", "latitude", "longitude", "birthdate", "createdAt", "url", "ipv4", "color", "product", "price", "creditCardTest", "iban", "sentence", "paragraph", "boolean", "number"] as const;

export const TOOL_INPUTS: Record<string, Contract> = {
  "aspect-ratio": { fields: { w: number(1, 100000, true), h: number(1, 100000, true), newW: number(1, 100000, true), newH: number(1, 100000, true) } },
  "word-counter": { raw: "text", fields: { text } },
  "case-converter": { raw: "text", fields: { text } },
  "text-diff": { raw: "a", fields: { a: text, b: text } },
  "lorem-ipsum": { fields: { count: number(1, 500, true), unit: choice("paragraphs", "sentences", "words"), classic: bool } },
  slugify: { raw: "text", fields: { text, sep: choice("-", "_", "."), lower: bool } },
  "line-tools": { raw: "text", fields: { text, operation: choice("Sort A→Z", "Sort Z→A", "Sort by length", "Reverse", "Shuffle", "Remove duplicates", "Remove empty", "Trim each", "Number lines") } },
  "find-replace": { raw: "text", fields: { text, find: text, repl: text, regex: bool, ci: bool } },
  uuid: { fields: { kind: choice("v4", "v7", "nanoid", "nil"), count: number(1, 1000, true), upper: bool, noDash: bool } },
  password: { fields: { length: number(4, 128, true), opts: object({ lower: bool, upper: bool, digits: bool, symbols: bool }), noAmbig: bool } },
  "fake-data": { fields: { fields: array(choice(...FAKE_DATA_FIELDS), 1, 29), count: number(1, 5000, true), format: choice("json", "csv", "sql"), seed: text } },
  "random-number": { fields: { min: number(-Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, true), max: number(-Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, true), count: number(1, 10000, true), unique: bool } },
  hash: { raw: "text", fields: { text, upper: bool } },
  hmac: { raw: "msg", fields: { msg: text, algo: choice("SHA-1", "SHA-256", "SHA-384", "SHA-512"), enc: choice("hex", "base64") } },
  jwt: { raw: "token", fields: { token: text } },
  base64: { raw: "input", fields: { input: text, mode: choice("encode", "decode"), urlSafe: bool } },
  "url-encode": { raw: "input", fields: { input: text } },
  "html-entities": { raw: "input", fields: { input: text, mode: choice("encode", "decode"), all: bool } },
  "number-base": { raw: "input", fields: { input: text, radix: choice(2, 8, 10, 16, 36) } },
  "image-base64": { upload: true, fields: {} },
  "json-formatter": { raw: "input", fields: { input: text, indent: choice("2", "4", "tab", "min"), sort: bool } },
  "json-csv": { raw: "input", fields: { input: text, mode: choice("json2csv", "csv2json"), delim: choice(",", ";", "\t", "|") } },
  regex: { raw: "pattern", fields: { pattern: text, flags: { type: "string", pattern: "^(?!.*(.).*\\1)[dgimsuvy]*$" }, text } },
  "color-picker": { raw: "input", fields: { input: text } },
  contrast: { fields: { fg: hex, bg: hex } },
  gradient: { fields: { type: choice("linear", "radial", "conic"), angle: number(0, 360), stops: array(object({ color: hex, pos: number(0, 100) }, ["color", "pos"]), 2, 16) } },
  "box-shadow": { fields: { radius: number(0, 60), layers: array(object({ x: number(-50, 50), y: number(-50, 50), blur: number(0, 100), spread: number(-50, 50), color: hex, alpha: number(0, 1), inset: bool }, ["x", "y", "blur", "spread", "color", "alpha", "inset"]), 1, 16) } },
  "image-compressor": { upload: true, fields: { quality: number(0.05, 1), format: choice("image/webp", "image/jpeg", "image/png"), maxW: number(16, 16384, true) } },
  "image-cropper": { upload: true, fields: { ratio: choice("Free", "1:1", "16:9", "4:3", "3:2", "9:16") } },
  "image-palette": { upload: true, fields: { count: number(2, 16, true) } },
  timestamp: { raw: "input", fields: { input: text, dateInput: text } },
  "http-status": { raw: "q", fields: { q: text } },
  "user-agent": { raw: "ua", fields: { ua: text } },
  chmod: { raw: "octal", fields: { octal: { type: "string", pattern: "^[0-7]{3,4}$" } } },
  "unit-converter": { fields: { group: choice(...Object.keys(units)), value: number(), from: choice(...new Set(Object.values(units).flat())) } },
  percentage: { fields: { a: number(), b: number() } },
  "markdown-preview": { raw: "md", fields: { md: text } },
  "text-to-speech": { raw: "text", fields: { text, rate: number(0.5, 2), pitch: number(0, 2) } },
  "qr-code": { raw: "text", fields: { mode: choice("text", "wifi", "email"), text, ssid: text, sec: choice("WPA", "WEP", "nopass"), email: text, fg: hex, bg: hex, ecl: choice("L", "M", "Q", "H") } },
  barcode: { raw: "value", fields: { value: text, format: choice("CODE128", "EAN13", "EAN8", "UPC", "CODE39", "ITF14"), showText: bool, height: number(40, 200, true) } },
  gitignore: { fields: { picked: array(choice("Node", "Next.js", "Vite", "Python", "Django", "Java", "Gradle", "Android", "Kotlin", "Go", "Rust", "PHP", "Laravel", "Ruby", "Swift", "Flutter", "Unity", "Terraform", "Docker", "macOS", "Windows", "Linux", "VS Code", "JetBrains", "Env", "Logs", "Coverage")) } },
  bcrypt: { fields: { rounds: number(4, 15, true) } },
  "rsa-keys": { fields: { bits: choice(2048, 3072, 4096), algo: choice("RSA-OAEP", "RSASSA-PKCS1-v1_5", "RSA-PSS") } },
  "json-yaml": { raw: "input", fields: { input: text, mode: choice("j2y", "y2j"), indent: choice(2, 4) } },
  "sql-formatter": { raw: "sql", fields: { sql: text, lang: choice("sql", "postgresql", "mysql", "mariadb", "sqlite", "tsql", "bigquery", "snowflake"), kwCase: choice("upper", "lower", "preserve"), tab: choice(2, 4) } },
  "curl-converter": { raw: "cmd", fields: { cmd: text, target: choice("fetch", "axios", "python") } },
  "json-to-ts": { raw: "input", fields: { input: text, name: { type: "string", pattern: "^[A-Za-z_$][A-Za-z0-9_$]*$" }, useType: bool, optNull: bool } },
  "meta-tags": { fields: { m: object({ title: text, description: text, url: text, image: text, site: text, twitter: text, theme: hex }) } },
  "image-converter": { upload: true, fields: { format: choice("image/webp", "image/jpeg", "image/png"), quality: number(0.1, 1), bg: hex } },
  favicon: { upload: true, fields: { radius: number(0, 50), padding: number(0, 30), bg: hex, transparent: bool } },
  "video-trimmer": { upload: true, fields: {} },
  "video-to-gif": { upload: true, fields: { fps: number(5, 24, true), width: choice(240, 320, 480, 640, 800) } },
  cron: { raw: "expr", fields: { expr: text } },
  timezone: { fields: { when: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}$" }, from: zone, zones: array(zone, 1) } },
};

const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
function valid(rule: Rule, value: unknown): boolean {
  if (rule.type === "array") return Array.isArray(value) && value.length >= (rule.minItems ?? 0) && value.length <= (rule.maxItems ?? 32) && value.every((item) => valid(rule.items!, item));
  if (rule.type === "object") return record(value) && Object.keys(value).every((key) => Object.hasOwn(rule.properties!, key) && valid(rule.properties![key], value[key])) && (rule.required ?? []).every((key) => Object.hasOwn(value, key));
  if (typeof value !== rule.type) return false;
  if (rule.enum && !rule.enum.includes(value as string | number)) return false;
  if (typeof value === "number") return Number.isFinite(value) && value >= (rule.minimum ?? -Infinity) && value <= (rule.maximum ?? Infinity) && (!rule.integer || Number.isInteger(value));
  if (typeof value === "string") return value.length <= 100_000 && (!rule.pattern || new RegExp(rule.pattern).test(value));
  return true;
}

export function validateToolSettings(slug: string, value: unknown): Record<string, unknown> | null {
  const contract = TOOL_INPUTS[slug];
  if (!contract || !record(value) || !Object.keys(value).length) return null;
  if (!Object.entries(value).every(([key, field]) => Object.hasOwn(contract.fields, key) && valid(contract.fields[key], field))) return null;
  const settings = { ...value };
  if (slug === "unit-converter") {
    const group = typeof settings.group === "string" ? settings.group : Object.keys(units).find((g) => units[g].includes(String(settings.from)));
    if (group) {
      if (settings.from && !units[group].includes(String(settings.from))) return null;
      settings.group = group;
      settings.from ??= units[group][0];
    }
  }
  if (slug === "timezone") {
    try {
      for (const z of [settings.from, ...(Array.isArray(settings.zones) ? settings.zones : [])]) if (z) new Intl.DateTimeFormat("en", { timeZone: String(z) }).format();
      if (settings.when && !Number.isFinite(new Date(String(settings.when)).getTime())) return null;
    } catch { return null; }
  }
  if (slug === "regex" && typeof settings.flags === "string" && settings.flags.includes("u") && settings.flags.includes("v")) return null;
  if (slug === "qr-code" && !settings.mode) settings.mode = settings.email ? "email" : settings.ssid ? "wifi" : "text";
  if (slug === "number-base") settings.radix ??= /^-?0x/i.test(String(settings.input)) ? 16 : /^-?0b/i.test(String(settings.input)) ? 2 : /^-?0o/i.test(String(settings.input)) ? 8 : 10;
  return settings;
}

export function encodeToolInput(slug: string, settings: unknown): string | undefined {
  const checked = validateToolSettings(slug, settings);
  return checked ? JSON.stringify({ __devdrawer: 1, tool: slug, settings: checked }) : undefined;
}

export function decodeToolInput(slug: string, input: string): Record<string, unknown> | null {
  let parsed: unknown;
  try { parsed = JSON.parse(input); } catch { /* plain text */ }
  if (record(parsed) && parsed.__devdrawer === 1) return parsed.tool === slug ? validateToolSettings(slug, parsed.settings) : null;
  // Support existing fake-data chat actions from before the shared handoff format.
  if (slug === "fake-data") return validateToolSettings(slug, parsed);
  const raw = TOOL_INPUTS[slug]?.raw;
  return raw ? validateToolSettings(slug, { [raw]: input }) : null;
}

export const TOOL_INPUT_GUIDE = Object.entries(TOOL_INPUTS).map(([slug, contract]) =>
  `${slug}: ${JSON.stringify(contract.fields)}${contract.upload ? "; user must upload their own local file" : ""}`,
).join("\n");
