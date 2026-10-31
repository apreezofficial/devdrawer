"use client";

import { ErrorText, Output, useSeed } from "@/components/ui";

export default function UrlEncode() {
  const [input, setInput] = useSeed("https://example.com/search?q=hello world&lang=en#top");
  let decoded = "", error = "", parsed: URL | null = null;
  try { decoded = decodeURIComponent(input); } catch { error = "Contains an invalid % escape, so it can't be decoded."; }
  try { parsed = new URL(input); } catch { parsed = null; }

  return (
    <>
      <textarea rows={4} value={input} onChange={(e) => setInput(e.target.value)} />
      <div className="row">
        <Output label="encodeURIComponent" value={encodeURIComponent(input)} rows={4} />
        <Output label="encodeURI (keeps URL structure)" value={encodeURI(input)} rows={4} />
      </div>
      <ErrorText>{error}</ErrorText>
      {!error && <Output label="Decoded" value={decoded} rows={3} />}
      {parsed && (
        <table>
          <thead><tr><th>Part</th><th>Value</th></tr></thead>
          <tbody>
            {(["protocol", "host", "pathname", "search", "hash"] as const).map((k) => parsed![k] && (
              <tr key={k}><td>{k}</td><td className="mono">{parsed![k]}</td></tr>
            ))}
            {[...parsed.searchParams].map(([k, v], i) => (
              <tr key={i}><td>?{k}</td><td className="mono">{v}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
