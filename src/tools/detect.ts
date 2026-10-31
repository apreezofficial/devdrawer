/** Smart paste: guess what a pasted string is and which tools fit. */
export interface Detection {
  label: string;
  slug: string;
}

export function detect(raw: string): Detection[] {
  const s = raw.trim();
  if (!s) return [];
  const out: Detection[] = [];

  if (/^[\w-]+\.[\w-]+\.[\w-]*$/.test(s) && s.startsWith("eyJ")) out.push({ label: "JWT token", slug: "jwt" });
  if (/^#?([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(s) || /^(rgb|hsl)a?\(/i.test(s)) out.push({ label: "Color", slug: "color-picker" });
  if (/^\d{10}$|^\d{13}$/.test(s)) out.push({ label: "Unix timestamp", slug: "timestamp" });
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)) out.push({ label: "UUID", slug: "uuid" });
  if (/^[1-5]\d\d$/.test(s)) out.push({ label: "HTTP status code", slug: "http-status" });
  if (/^[0-7]{3,4}$/.test(s)) out.push({ label: "chmod permissions", slug: "chmod" });
  if (/^https?:\/\//i.test(s) || /%[0-9a-f]{2}/i.test(s)) out.push({ label: "URL / encoded string", slug: "url-encode" });
  if (/&(#\d+|#x[0-9a-f]+|[a-z]+);/i.test(s) || /<\/?[a-z][^>]*>/i.test(s)) out.push({ label: "HTML", slug: "html-entities" });
  if (/^Mozilla\/\d/.test(s)) out.push({ label: "User agent", slug: "user-agent" });

  if (/^[{[]/.test(s)) {
    try {
      JSON.parse(s);
      out.push({ label: "JSON", slug: "json-formatter" });
    } catch {
      out.push({ label: "Broken JSON", slug: "json-formatter" });
    }
  }
  if (s.length >= 8 && s.length % 4 === 0 && /^[A-Za-z0-9+/]+={0,2}$/.test(s) && !/^\d+$/.test(s)) {
    out.push({ label: "Base64", slug: "base64" });
  }

  // Always useful for plain text.
  out.push({ label: "Count words", slug: "word-counter" });
  out.push({ label: "Change case", slug: "case-converter" });
  out.push({ label: "Hash it", slug: "hash" });
  return out;
}
