"use client";

import { useMemo, useState } from "react";
import type { ApiToolDoc } from "@/lib/api-tools";

const BASE = "https://www.devdrawer.xyz";
const LANGS = ["curl", "JavaScript", "Python"] as const;
type Lang = (typeof LANGS)[number];

function samples(tool: ApiToolDoc, body: string, lang: Lang) {
  const url = `${BASE}/api/v1/${tool.slug}`;
  const compact = body.replace(/\s+/g, " ").trim();
  if (lang === "curl") {
    return `curl -X POST ${url} \\\n  -H "Content-Type: application/json" \\\n  -d '${compact}'`;
  }
  if (lang === "JavaScript") {
    return `const res = await fetch("${url}", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify(${body.trim()}),\n});\nconst { result } = await res.json();`;
  }
  const py = body.trim().replace(/\btrue\b/g, "True").replace(/\bfalse\b/g, "False").replace(/\bnull\b/g, "None");
  return `import requests\n\nres = requests.post("${url}", json=${py})\nprint(res.json()["result"])`;
}

export function ApiPlayground({ tools }: { tools: ApiToolDoc[] }) {
  const [slug, setSlug] = useState(tools[0]?.slug ?? "");
  const tool = tools.find((t) => t.slug === slug) ?? tools[0];
  const [body, setBody] = useState(() => JSON.stringify(tool.example, null, 2));
  const [lang, setLang] = useState<Lang>("curl");
  const [resp, setResp] = useState<{ status: number; ms: number; json: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const code = useMemo(() => samples(tool, body, lang), [tool, body, lang]);

  const pick = (s: string) => {
    const t = tools.find((x) => x.slug === s)!;
    setSlug(s);
    setBody(JSON.stringify(t.example, null, 2));
    setResp(null);
  };

  const run = async () => {
    setBusy(true);
    const t0 = performance.now();
    try {
      const res = await fetch(`/api/v1/${tool.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      const ms = Math.round(performance.now() - t0);
      const data = await res.json().catch(() => ({ error: "No JSON in response." }));
      setResp({ status: res.status, ms, json: JSON.stringify(data, null, 2) });
    } catch (e) {
      setResp({ status: 0, ms: 0, json: JSON.stringify({ error: (e as Error).message }, null, 2) });
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="api-play">
      <div className="api-play-side">
        <div className="api-play-label">Endpoints</div>
        {tools.map((t) => (
          <button key={t.slug} className={`api-ep ${t.slug === tool.slug ? "on" : ""}`} onClick={() => pick(t.slug)}>
            <span className="api-method">POST</span>
            <span className="api-ep-path">/api/v1/{t.slug}</span>
          </button>
        ))}
      </div>

      <div className="api-play-main">
        <div className="api-play-head">
          <div>
            <strong>{tool.name}</strong>
            <span>{tool.description}</span>
          </div>
        </div>

        <div className="api-panel">
          <div className="api-panel-bar"><span>Request</span><span className="api-muted">application/json</span></div>
          <textarea className="api-code-input" rows={Math.min(12, body.split("\n").length + 1)} value={body} onChange={(e) => setBody(e.target.value)} spellCheck={false} />
          <div className="api-panel-foot">
            <button className="api-run" onClick={run} disabled={busy}>{busy ? "Sending…" : "Send request"}</button>
            <button className="api-link" onClick={() => setBody(JSON.stringify(tool.example, null, 2))}>Reset example</button>
          </div>
        </div>

        <div className="api-panel">
          <div className="api-panel-bar">
            <span>Response</span>
            {resp && <span className={`api-status ${resp.status >= 200 && resp.status < 300 ? "ok" : "bad"}`}>{resp.status || "error"} · {resp.ms} ms</span>}
          </div>
          <pre className="api-code">{resp ? resp.json : "Send a request to see the response here."}</pre>
        </div>

        <div className="api-panel">
          <div className="api-panel-bar">
            <div className="api-tabs">
              {LANGS.map((l) => (
                <button key={l} className={lang === l ? "on" : ""} onClick={() => setLang(l)}>{l}</button>
              ))}
            </div>
            <button className="api-link" onClick={copy}>{copied ? "Copied ✓" : "Copy"}</button>
          </div>
          <pre className="api-code">{code}</pre>
        </div>

        <div className="api-panel">
          <div className="api-panel-bar"><span>Inputs</span></div>
          <table className="api-table">
            <thead><tr><th>Field</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
            <tbody>
              {tool.inputs.map((f) => (
                <tr key={f.name}>
                  <td className="mono">{f.name}{f.required && <span className="api-req">required</span>}</td>
                  <td>{f.type}</td>
                  <td className="mono">{f.default !== undefined ? String(f.default) : "—"}</td>
                  <td>{f.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="api-muted api-foot-note">Returns: <code>{tool.output}</code></p>
        </div>
      </div>
    </div>
  );
}
