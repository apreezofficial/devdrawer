import { createHash, randomBytes, randomUUID } from "node:crypto";

/**
 * Server-side versions of pure devdrawer tools, exposed through /api/v1.
 * Each one is stateless: inputs are used for one call and never stored or logged.
 */

export type FieldType = "string" | "number" | "boolean";

export type ApiField = {
  name: string;
  type: FieldType;
  required?: boolean;
  default?: string | number | boolean;
  description: string;
};

export type ApiToolDoc = {
  slug: string;
  name: string;
  category: string;
  description: string;
  inputs: ApiField[];
  example: Record<string, string | number | boolean>;
  output: string;
};

type ApiTool = ApiToolDoc & { run: (input: Record<string, unknown>) => unknown };

export class ApiError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

const MAX_TEXT = 20_000;

const text = (v: unknown, name: string, max = MAX_TEXT) => {
  if (typeof v !== "string") throw new ApiError(`"${name}" must be a string.`);
  if (v.length > max) throw new ApiError(`"${name}" is longer than ${max} characters.`);
  return v;
};

const int = (v: unknown, name: string, min: number, max: number, fallback?: number) => {
  const n = v === undefined && fallback !== undefined ? fallback : v;
  if (typeof n !== "number" || !Number.isInteger(n)) throw new ApiError(`"${name}" must be an integer.`);
  if (n < min || n > max) throw new ApiError(`"${name}" must be between ${min} and ${max}.`);
  return n;
};

const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);

/** UUID v7: 48-bit millisecond timestamp, then random bits (RFC 9562). */
function uuidv7() {
  const b = randomBytes(16);
  const ms = BigInt(Date.now());
  for (let i = 0; i < 6; i++) b[i] = Number((ms >> BigInt(8 * (5 - i))) & 0xffn);
  b[6] = (b[6] & 0x0f) | 0x70;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = b.toString("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/** Unbiased random integer in [min, max]. */
function randomInRange(min: number, max: number) {
  const range = max - min + 1;
  const limit = Math.floor(0x100000000 / range) * range;
  let n: number;
  do n = randomBytes(4).readUInt32BE(0); while (n >= limit);
  return min + (n % range);
}

const HASHES = ["md5", "sha1", "sha256", "sha384", "sha512"] as const;

export const API_TOOLS: ApiTool[] = [
  {
    slug: "uuid",
    name: "UUID Generator",
    category: "Generators",
    description: "Generate one or more UUIDs (v4 random or v7 time-ordered).",
    inputs: [
      { name: "version", type: "string", default: "v4", description: "\"v4\" (random) or \"v7\" (time-ordered)." },
      { name: "count", type: "number", default: 1, description: "How many IDs to return (1–100)." },
    ],
    example: { version: "v7", count: 3 },
    output: "{ \"ids\": [\"…\"] }",
    run(input) {
      const version = input.version ?? "v4";
      if (version !== "v4" && version !== "v7") throw new ApiError('"version" must be "v4" or "v7".');
      const count = int(input.count, "count", 1, 100, 1);
      return { ids: Array.from({ length: count }, () => (version === "v7" ? uuidv7() : randomUUID())) };
    },
  },
  {
    slug: "hash",
    name: "Hash Generator",
    category: "Crypto & Security",
    description: "Hash text with MD5, SHA-1, SHA-256, SHA-384 or SHA-512.",
    inputs: [
      { name: "text", type: "string", required: true, description: "The text to hash." },
      { name: "algorithm", type: "string", default: "sha256", description: "md5, sha1, sha256, sha384 or sha512." },
    ],
    example: { text: "hello world", algorithm: "sha256" },
    output: "{ \"algorithm\": \"sha256\", \"hex\": \"…\" }",
    run(input) {
      const algorithm = String(input.algorithm ?? "sha256").toLowerCase();
      if (!(HASHES as readonly string[]).includes(algorithm)) throw new ApiError(`"algorithm" must be one of ${HASHES.join(", ")}.`);
      const data = text(input.text, "text");
      return { algorithm, hex: createHash(algorithm).update(data, "utf8").digest("hex") };
    },
  },
  {
    slug: "base64",
    name: "Base64 Encoder / Decoder",
    category: "Encoding",
    description: "Encode UTF-8 text to Base64, or decode Base64 back to text.",
    inputs: [
      { name: "text", type: "string", required: true, description: "The text to encode or decode." },
      { name: "mode", type: "string", default: "encode", description: "\"encode\" or \"decode\"." },
    ],
    example: { text: "Hello, devdrawer", mode: "encode" },
    output: "{ \"mode\": \"encode\", \"result\": \"…\" }",
    run(input) {
      const mode = input.mode ?? "encode";
      const data = text(input.text, "text");
      if (mode === "encode") return { mode, result: Buffer.from(data, "utf8").toString("base64") };
      if (mode === "decode") {
        const bytes = Buffer.from(data.replace(/\s/g, ""), "base64");
        const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
        return { mode, result: decoded };
      }
      throw new ApiError('"mode" must be "encode" or "decode".');
    },
  },
  {
    slug: "url-encode",
    name: "URL Encoder / Decoder",
    category: "Encoding",
    description: "Percent-encode or decode a string for use in URLs.",
    inputs: [
      { name: "text", type: "string", required: true, description: "The text to encode or decode." },
      { name: "mode", type: "string", default: "encode", description: "\"encode\" or \"decode\"." },
    ],
    example: { text: "hello world & friends", mode: "encode" },
    output: "{ \"mode\": \"encode\", \"result\": \"…\" }",
    run(input) {
      const mode = input.mode ?? "encode";
      const data = text(input.text, "text");
      if (mode === "encode") return { mode, result: encodeURIComponent(data) };
      if (mode === "decode") {
        try { return { mode, result: decodeURIComponent(data) }; } catch { throw new ApiError("That isn't valid percent-encoding."); }
      }
      throw new ApiError('"mode" must be "encode" or "decode".');
    },
  },
  {
    slug: "password",
    name: "Password Generator",
    category: "Generators",
    description: "Generate a cryptographically random password from chosen character sets.",
    inputs: [
      { name: "length", type: "number", default: 20, description: "Length from 4 to 128." },
      { name: "lowercase", type: "boolean", default: true, description: "Include a–z." },
      { name: "uppercase", type: "boolean", default: true, description: "Include A–Z." },
      { name: "digits", type: "boolean", default: true, description: "Include 0–9." },
      { name: "symbols", type: "boolean", default: true, description: "Include symbols." },
    ],
    example: { length: 24, symbols: false },
    output: "{ \"password\": \"…\" }",
    run(input) {
      const length = int(input.length, "length", 4, 128, 20);
      const sets = [
        bool(input.lowercase, true) && "abcdefghijklmnopqrstuvwxyz",
        bool(input.uppercase, true) && "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        bool(input.digits, true) && "0123456789",
        bool(input.symbols, true) && "!@#$%^&*()-_=+[]{};:,.<>?/~",
      ].filter(Boolean) as string[];
      if (!sets.length) throw new ApiError("Enable at least one character set.");
      const pool = sets.join("");
      let out = "";
      for (let i = 0; i < length; i++) out += pool[randomInRange(0, pool.length - 1)];
      return { password: out };
    },
  },
  {
    slug: "random-number",
    name: "Random Number Generator",
    category: "Generators",
    description: "Random integers between min and max, inclusive.",
    inputs: [
      { name: "min", type: "number", default: 1, description: "Lowest value." },
      { name: "max", type: "number", default: 100, description: "Highest value." },
      { name: "count", type: "number", default: 1, description: "How many numbers (1–1000)." },
    ],
    example: { min: 1, max: 6, count: 5 },
    output: "{ \"numbers\": [1, 2, …] }",
    run(input) {
      const min = int(input.min, "min", -1e9, 1e9, 1);
      const max = int(input.max, "max", -1e9, 1e9, 100);
      if (min > max) throw new ApiError('"min" must be less than or equal to "max".');
      const count = int(input.count, "count", 1, 1000, 1);
      return { numbers: Array.from({ length: count }, () => randomInRange(min, max)) };
    },
  },
  {
    slug: "timestamp",
    name: "Unix Timestamp Converter",
    category: "Time & Date",
    description: "Convert Unix seconds, milliseconds or a date string into ISO and Unix time.",
    inputs: [
      { name: "input", type: "string", required: true, description: "Unix seconds, Unix milliseconds, or any date string." },
    ],
    example: { input: "1793474400" },
    output: "{ \"iso\": \"…\", \"unixSeconds\": 0, \"unixMilliseconds\": 0 }",
    run(input) {
      const raw = text(input.input, "input", 64).trim();
      const ms = /^-?\d+$/.test(raw)
        ? (raw.replace("-", "").length > 11 ? Number(raw) : Number(raw) * 1000)
        : Date.parse(raw);
      if (!Number.isFinite(ms)) throw new ApiError("Couldn't read that as a timestamp or date.");
      const d = new Date(ms);
      return { iso: d.toISOString(), unixSeconds: Math.floor(ms / 1000), unixMilliseconds: ms };
    },
  },
  {
    slug: "color",
    name: "Color Converter",
    category: "Color & Design",
    description: "Convert a HEX color (#rgb or #rrggbb) to RGB and HSL.",
    inputs: [{ name: "color", type: "string", required: true, description: "A HEX color like #6366f1." }],
    example: { color: "#6366f1" },
    output: "{ \"hex\": \"#6366f1\", \"rgb\": {\"r\":99,\"g\":102,\"b\":241}, \"hsl\": {\"h\":239,\"s\":84,\"l\":67} }",
    run(input) {
      const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text(input.color, "color", 16).trim());
      if (!m) throw new ApiError("Use a HEX color like #6366f1 or #abc.");
      const h6 = m[1].length === 3 ? [...m[1]].map((c) => c + c).join("") : m[1];
      const r = parseInt(h6.slice(0, 2), 16) / 255, g = parseInt(h6.slice(2, 4), 16) / 255, b = parseInt(h6.slice(4, 6), 16) / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
      let hue = 0, sat = 0;
      if (max !== min) {
        const d = max - min;
        sat = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        hue = (max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60;
      }
      return {
        hex: `#${h6.toLowerCase()}`,
        rgb: { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) },
        hsl: { h: Math.round(hue), s: Math.round(sat * 100), l: Math.round(l * 100) },
      };
    },
  },
  {
    slug: "json-format",
    name: "JSON Formatter",
    category: "Data & Code",
    description: "Validate and pretty-print JSON, or minify it.",
    inputs: [
      { name: "json", type: "string", required: true, description: "The JSON text." },
      { name: "indent", type: "number", default: 2, description: "Spaces per level (0 minifies, 1–8 pretty-prints)." },
    ],
    example: { json: "{\"name\":\"devdrawer\",\"tools\":54}", indent: 2 },
    output: "{ \"formatted\": \"…\" }",
    run(input) {
      const data = text(input.json, "json");
      const indent = int(input.indent, "indent", 0, 8, 2);
      let parsed: unknown;
      try { parsed = JSON.parse(data); } catch (e) { throw new ApiError(`Invalid JSON: ${(e as Error).message}`); }
      return { formatted: indent === 0 ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indent) };
    },
  },
  {
    slug: "regex-test",
    name: "Regex Tester",
    category: "Data & Code",
    description: "Find every match of a regular expression in some text.",
    inputs: [
      { name: "pattern", type: "string", required: true, description: "The regular expression, without slashes." },
      { name: "flags", type: "string", default: "g", description: "Flags such as g, i, m, s, u." },
      { name: "text", type: "string", required: true, description: "The text to search." },
    ],
    example: { pattern: "[\\w.+-]+@[\\w-]+\\.[\\w.]+", flags: "g", text: "Mail ada@example.com today" },
    output: "{ \"count\": 1, \"matches\": [{ \"match\": \"…\", \"index\": 0 }] }",
    run(input) {
      const pattern = text(input.pattern, "pattern", 500);
      const flags = String(input.flags ?? "g").replace(/[^gimsuy]/g, "");
      const data = text(input.text, "text", 5000);
      let re: RegExp;
      try { re = new RegExp(pattern, flags.includes("g") ? flags : flags + "g"); } catch (e) { throw new ApiError(`Invalid pattern: ${(e as Error).message}`); }
      const matches = [...data.matchAll(re)].slice(0, 500).map((m) => ({ match: m[0], index: m.index ?? 0 }));
      return { count: matches.length, matches };
    },
  },
  {
    slug: "slugify",
    name: "Slug Generator",
    category: "Text",
    description: "Turn any title into a URL-safe slug.",
    inputs: [{ name: "text", type: "string", required: true, description: "The title to convert." }],
    example: { text: "Héllo Wörld! 10 Tips & Tricks" },
    output: "{ \"slug\": \"hello-world-10-tips-tricks\" }",
    run(input) {
      const slug = text(input.text, "text", 500)
        .normalize("NFKD").replace(/[̀-ͯ]/g, "")
        .replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase();
      return { slug };
    },
  },
  {
    slug: "word-counter",
    name: "Word Counter",
    category: "Text",
    description: "Count words, characters, sentences, paragraphs and reading time.",
    inputs: [{ name: "text", type: "string", required: true, description: "The text to count." }],
    example: { text: "Ship it. Then count it." },
    output: "{ \"words\": 0, \"characters\": 0, \"sentences\": 0, \"paragraphs\": 0, \"readingMinutes\": 0 }",
    run(input) {
      const data = text(input.text, "text");
      const trimmed = data.trim();
      const words = trimmed ? trimmed.split(/\s+/).length : 0;
      return {
        words,
        characters: [...data].length,
        sentences: data.split(/[.!?]+(\s|$)/).filter((s) => s.trim()).length,
        paragraphs: data.split(/\n\s*\n/).filter((p) => p.trim()).length,
        readingMinutes: words ? Math.max(1, Math.round(words / 238)) : 0,
      };
    },
  },
];

export const findApiTool = (slug: string) => API_TOOLS.find((t) => t.slug === slug);

/** Serializable docs (no functions) for the /api page and the list endpoint. */
export const apiDocs = (): ApiToolDoc[] =>
  API_TOOLS.map(({ run: _run, ...doc }) => doc);
