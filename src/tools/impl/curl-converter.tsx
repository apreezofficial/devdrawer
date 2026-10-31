"use client";

import { useState } from "react";
import { ErrorText, Output, useSeed } from "@/components/ui";

type Req = { url: string; method: string; headers: [string, string][]; body?: string };

/** Shell-like tokenizer: handles quotes, escapes and line continuations. */
function tokenize(cmd: string) {
  const out: string[] = [];
  let cur = "", quote: string | null = null, has = false;
  const s = cmd.replace(/\\\r?\n/g, " ");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quote) {
      if (c === quote) quote = null;
      else if (c === "\\" && quote === '"' && i + 1 < s.length) cur += s[++i];
      else cur += c;
    } else if (c === "'" || c === '"') { quote = c; has = true; }
    else if (c === "\\" && i + 1 < s.length) { cur += s[++i]; has = true; }
    else if (/\s/.test(c)) { if (cur || has) out.push(cur); cur = ""; has = false; }
    else { cur += c; has = true; }
  }
  if (quote) throw new Error("Unclosed quote.");
  if (cur || has) out.push(cur);
  return out;
}

function parse(cmd: string): Req {
  const t = tokenize(cmd.trim());
  if (t[0] !== "curl") throw new Error("Command must start with curl.");
  const req: Req = { url: "", method: "", headers: [] };
  const data: string[] = [];
  for (let i = 1; i < t.length; i++) {
    const a = t[i];
    const next = () => { if (i + 1 >= t.length) throw new Error(`${a} needs a value.`); return t[++i]; };
    if (a === "-X" || a === "--request") req.method = next().toUpperCase();
    else if (a === "-H" || a === "--header") {
      const h = next(), idx = h.indexOf(":");
      if (idx > 0) req.headers.push([h.slice(0, idx).trim(), h.slice(idx + 1).trim()]);
    } else if (["-d", "--data", "--data-raw", "--data-binary", "--data-ascii", "--json"].includes(a)) {
      data.push(next());
      if (a === "--json") req.headers.push(["Content-Type", "application/json"], ["Accept", "application/json"]);
    } else if (a === "-u" || a === "--user") req.headers.push(["Authorization", `Basic ${btoa(next())}`]);
    else if (a === "-A" || a === "--user-agent") req.headers.push(["User-Agent", next()]);
    else if (a === "-b" || a === "--cookie") req.headers.push(["Cookie", next()]);
    else if (a === "-I" || a === "--head") req.method = "HEAD";
    else if (a === "--url") req.url = next();
    else if (a.startsWith("-")) { /* flags like -s, -L, --compressed don't change the request */ }
    else if (!req.url) req.url = a;
  }
  if (!req.url) throw new Error("No URL found.");
  if (data.length) req.body = data.join("&");
  req.method ||= req.body ? "POST" : "GET";
  if (req.body && !req.headers.some(([k]) => k.toLowerCase() === "content-type"))
    req.headers.push(["Content-Type", "application/x-www-form-urlencoded"]);
  return req;
}

const q = (s: string) => JSON.stringify(s);

function toFetch(r: Req) {
  const opts: string[] = [`  method: ${q(r.method)},`];
  if (r.headers.length) opts.push(`  headers: {\n${r.headers.map(([k, v]) => `    ${q(k)}: ${q(v)},`).join("\n")}\n  },`);
  if (r.body) opts.push(`  body: ${q(r.body)},`);
  return `const res = await fetch(${q(r.url)}, {\n${opts.join("\n")}\n});\nconst data = await res.json();`;
}

function toAxios(r: Req) {
  const lines = [`  method: ${q(r.method.toLowerCase())},`, `  url: ${q(r.url)},`];
  if (r.headers.length) lines.push(`  headers: {\n${r.headers.map(([k, v]) => `    ${q(k)}: ${q(v)},`).join("\n")}\n  },`);
  if (r.body) {
    let body = q(r.body);
    try { body = JSON.stringify(JSON.parse(r.body), null, 2).replace(/\n/g, "\n  "); } catch { /* keep as string */ }
    lines.push(`  data: ${body},`);
  }
  return `import axios from "axios";\n\nconst { data } = await axios({\n${lines.join("\n")}\n});`;
}

function toPython(r: Req) {
  const h = r.headers.length ? `headers = {\n${r.headers.map(([k, v]) => `    ${q(k)}: ${q(v)},`).join("\n")}\n}\n\n` : "";
  const args = [q(r.url), r.headers.length ? "headers=headers" : "", r.body ? `data=${q(r.body)}` : ""].filter(Boolean).join(", ");
  return `import requests\n\n${h}res = requests.request(${q(r.method)}, ${args})\nprint(res.json())`;
}

export default function CurlConverter() {
  const [cmd, setCmd] = useSeed(`curl -X POST https://api.example.com/users \\\n  -H "Authorization: Bearer TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{"name":"Ada","role":"admin"}'`);
  const [target, setTarget] = useState<"fetch" | "axios" | "python">("fetch");
  let out = "", error = "";
  try {
    const r = parse(cmd);
    out = target === "fetch" ? toFetch(r) : target === "axios" ? toAxios(r) : toPython(r);
  } catch (e) {
    error = cmd.trim() ? (e as Error).message : "";
  }
  return (
    <>
      <textarea rows={7} value={cmd} onChange={(e) => setCmd(e.target.value)} placeholder="curl https://…" />
      <div className="chips">
        {(["fetch", "axios", "python"] as const).map((t) => (
          <button key={t} className={`chip ${target === t ? "active" : ""}`} onClick={() => setTarget(t)}>{t === "python" ? "Python requests" : t}</button>
        ))}
      </div>
      <ErrorText>{error}</ErrorText>
      {!error && <Output label="Code" value={out} rows={14} />}
    </>
  );
}
