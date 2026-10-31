export type Category =
  | "Text"
  | "Generators"
  | "Crypto & Security"
  | "Encoding"
  | "Data & Code"
  | "Color & Design"
  | "Image"
  | "Video & Audio"
  | "Time & Date"
  | "Web & Network"
  | "Math & Units";

export interface ToolMeta {
  slug: string;
  name: string;
  description: string;
  category: Category;
  keywords: string[];
  /** "soon" tools are listed so contributors can pick them up. */
  status: "ready" | "soon";
}

const t = (
  slug: string,
  name: string,
  category: Category,
  description: string,
  keywords: string[] = [],
  status: ToolMeta["status"] = "ready",
): ToolMeta => ({ slug, name, category, description, keywords, status });

export const tools: ToolMeta[] = [
  // Text
  t("word-counter", "Word Counter", "Text", "Words, characters, sentences, reading time.", ["count", "characters", "length"]),
  t("case-converter", "Text Case Converter", "Text", "camelCase, snake_case, kebab-case, Title Case and more.", ["camel", "snake", "kebab", "upper", "lower"]),
  t("text-diff", "Text Difference Checker", "Text", "Line-by-line diff of two texts.", ["compare", "diff"]),
  t("lorem-ipsum", "Lorem Ipsum Generator", "Text", "Placeholder paragraphs, sentences or words.", ["placeholder", "dummy text"]),
  t("slugify", "Slug Generator", "Text", "Turn any title into a URL-safe slug.", ["url", "permalink"]),
  t("line-tools", "Line Sorter & Deduper", "Text", "Sort, reverse, shuffle, dedupe and trim lines.", ["sort", "unique", "dedupe"]),
  t("find-replace", "Find & Replace", "Text", "Bulk find and replace, with regex support.", ["replace", "search"]),
  t("markdown-preview", "Markdown Preview", "Text", "Live markdown to HTML preview.", ["md"]),
  t("text-to-speech", "Text to Speech", "Text", "Read text aloud using the browser voice.", ["tts", "speak"]),

  // Generators
  t("uuid", "UUID Generator", "Generators", "UUID v4, v7 and nanoid, in bulk.", ["guid", "id", "nanoid", "v4", "v7"]),
  t("password", "Password Generator", "Generators", "Strong random passwords with strength meter.", ["secure", "random"]),
  t("fake-data", "Fake Data Generator", "Generators", "Names, emails, addresses and more as JSON or CSV.", ["faker", "mock", "seed"]),
  t("random-number", "Random Number Generator", "Generators", "Random integers in a range, dice, coin flips.", ["dice", "rng"]),
  t("qr-code", "QR Code Generator", "Generators", "Make QR codes for links, Wi-Fi and text.", ["qr"]),
  t("barcode", "Barcode Generator", "Generators", "EAN, UPC and Code128 barcodes.", []),
  t("gitignore", ".gitignore Generator", "Generators", "Pick stacks and get a .gitignore.", ["git"]),

  // Crypto & Security
  t("hash", "Hash Generator", "Crypto & Security", "SHA-1, SHA-256, SHA-384, SHA-512 of text or files.", ["sha", "checksum", "digest"]),
  t("hmac", "HMAC Generator", "Crypto & Security", "HMAC-SHA signatures with a secret key.", ["signature", "webhook"]),
  t("jwt", "JWT Decoder", "Crypto & Security", "Decode JWT header and payload, check expiry.", ["token", "jsonwebtoken"]),
  t("bcrypt", "Bcrypt Hash & Verify", "Crypto & Security", "Hash and verify bcrypt passwords.", []),
  t("rsa-keys", "RSA Key Pair Generator", "Crypto & Security", "Generate PEM key pairs in the browser.", ["pem", "ssh"]),

  // Encoding
  t("base64", "Base64 Encoder / Decoder", "Encoding", "Encode or decode Base64 (UTF-8 safe).", ["b64", "atob", "btoa"]),
  t("url-encode", "URL Encoder / Decoder", "Encoding", "Percent-encode or decode strings and parse URLs.", ["percent", "query", "uri"]),
  t("html-entities", "HTML Entity Encoder", "Encoding", "Escape and unescape HTML entities.", ["escape", "html"]),
  t("number-base", "Number Base Converter", "Encoding", "Binary, octal, decimal, hex.", ["binary", "hex", "octal"]),
  t("image-base64", "Image to Base64", "Encoding", "Turn an image into a data URI.", ["data uri", "inline"]),

  // Data & Code
  t("json-formatter", "JSON Formatter", "Data & Code", "Prettify, minify and validate JSON.", ["prettify", "beautify", "validate"]),
  t("json-csv", "JSON ↔ CSV Converter", "Data & Code", "Convert between JSON arrays and CSV.", ["spreadsheet", "export"]),
  t("regex", "Regex Tester", "Data & Code", "Test patterns with live match highlighting.", ["regexp", "pattern"]),
  t("json-yaml", "JSON ↔ YAML", "Data & Code", "Convert JSON and YAML.", ["yml"]),
  t("sql-formatter", "SQL Formatter", "Data & Code", "Prettify SQL queries.", ["query"]),
  t("curl-converter", "cURL to Fetch", "Data & Code", "Convert curl commands to fetch / axios.", ["http"]),
  t("json-to-ts", "JSON to TypeScript", "Data & Code", "Generate TS interfaces from JSON.", ["types"]),

  // Color & Design
  t("color-picker", "Color Picker", "Color & Design", "Pick colors, eyedropper, HEX / RGB / HSL.", ["eyedropper", "hex", "rgb", "hsl"]),
  t("contrast", "Contrast Checker", "Color & Design", "WCAG contrast ratio for text and background.", ["a11y", "wcag", "accessibility"]),
  t("image-palette", "Image Palette Generator", "Color & Design", "Extract dominant colors from an image.", ["colors", "extract"]),
  t("gradient", "CSS Gradient Generator", "Color & Design", "Build linear gradients and copy the CSS.", ["css", "background"]),
  t("box-shadow", "Box Shadow Generator", "Color & Design", "Design CSS box shadows visually.", ["css"]),

  // Image
  t("image-compressor", "Image Compressor", "Image", "Shrink JPG / PNG / WebP in the browser.", ["compress", "optimize", "resize"]),
  t("image-cropper", "Image Cropper", "Image", "Crop images by dragging a selection.", ["crop", "cut"]),
  t("image-converter", "Image Format Converter", "Image", "Convert between PNG, JPG and WebP.", ["png", "jpg", "webp"]),
  t("favicon", "Favicon Generator", "Image", "All favicon sizes from one image.", ["icon"]),

  // Video & Audio
  t("video-trimmer", "Video Trimmer", "Video & Audio", "Trim video clips in the browser.", ["cut", "clip"]),
  t("video-to-gif", "Video to GIF", "Video & Audio", "Convert short clips to GIFs.", ["gif"]),

  // Time & Date
  t("timestamp", "Unix Timestamp Converter", "Time & Date", "Epoch seconds / ms ↔ human dates.", ["epoch", "unix", "date"]),
  t("cron", "Cron Explainer", "Time & Date", "Explain cron expressions in plain English.", ["schedule", "crontab"]),
  t("timezone", "Time Zone Converter", "Time & Date", "Convert times across time zones.", ["tz"]),

  // Web & Network
  t("http-status", "HTTP Status Codes", "Web & Network", "Look up every HTTP status code.", ["404", "500", "response"]),
  t("user-agent", "User Agent Parser", "Web & Network", "See browser, OS and device from a UA string.", ["ua", "browser"]),
  t("chmod", "Chmod Calculator", "Web & Network", "Unix permissions as numbers and symbols.", ["permissions", "linux"]),
  t("meta-tags", "Meta Tag Generator", "Web & Network", "SEO and Open Graph tags.", ["seo", "og"]),

  // Math & Units
  t("unit-converter", "Unit Converter", "Math & Units", "Length, weight, temperature, data and more.", ["convert", "metric", "imperial"]),
  t("percentage", "Percentage Calculator", "Math & Units", "X% of Y, percent change and more.", ["percent"]),
  t("aspect-ratio", "Aspect Ratio Calculator", "Math & Units", "Resize keeping the ratio.", ["16:9", "resolution"]),
];

export const categories = Array.from(new Set(tools.map((x) => x.category)));

export const categoryIcons: Record<Category, string> = {
  Text: "Aa", Generators: "✦", "Crypto & Security": "#", Encoding: "%", "Data & Code": "{}",
  "Color & Design": "◐", Image: "▣", "Video & Audio": "▶", "Time & Date": "◷", "Web & Network": "@", "Math & Units": "±",
};

export const categoryId = (c: string) => c.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");

export const getTool = (slug: string) => tools.find((x) => x.slug === slug);

export function searchTools(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return tools;
  return tools
    .map((tool) => {
      const hay = [tool.name, tool.description, tool.category, ...tool.keywords].join(" ").toLowerCase();
      let score = 0;
      if (tool.name.toLowerCase().startsWith(q)) score += 5;
      if (tool.name.toLowerCase().includes(q)) score += 3;
      if (tool.keywords.some((k) => k.startsWith(q))) score += 2;
      if (hay.includes(q)) score += 1;
      return { tool, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || (a.tool.status === "ready" ? -1 : 1))
    .map((x) => x.tool);
}
