"use client";

import { useToolInput } from "@/components/useToolInput";
import { useMemo, useState, type ReactNode } from "react";
import { ErrorText, Field, Row } from "@/components/ui";

const PRESETS: [string, string][] = [
  ["Email", "[\\w.+-]+@[\\w-]+\\.[\\w.]+"],
  ["URL", "https?:\\/\\/[^\\s]+"],
  ["IPv4", "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b"],
  ["Hex color", "#(?:[0-9a-fA-F]{3}){1,2}\\b"],
  ["Date (YYYY-MM-DD)", "\\d{4}-\\d{2}-\\d{2}"],
  ["Phone", "\\+?\\d[\\d\\s()-]{7,}\\d"],
];

export default function RegexTool() {
  const [pattern, setPattern] = useState("[\\w.+-]+@[\\w-]+\\.[\\w.]+");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("Contact ada@example.com or linus@kernel.org.\nVisit https://devdrawer.xyz on 2026-10-31.");
  useToolInput("regex", (settings) => {
    if (settings.pattern !== undefined) setPattern(settings.pattern as typeof pattern);
    if (settings.flags !== undefined) setFlags(settings.flags as typeof flags);
    if (settings.text !== undefined) setText(settings.text as typeof text);
  });

  const { nodes, matches, error } = useMemo(() => {
    if (!pattern) return { nodes: [text], matches: [] as RegExpMatchArray[], error: "" };
    try {
      const re = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
      const found: RegExpMatchArray[] = [];
      for (const match of text.matchAll(re)) {
        found.push(match);
        if (found.length === 1000) break;
      }
      const parts: ReactNode[] = [];
      let last = 0;
      found.forEach((m, i) => {
        const idx = m.index ?? 0;
        if (m[0] === "") return;
        parts.push(text.slice(last, idx), <mark key={i}>{m[0]}</mark>);
        last = idx + m[0].length;
      });
      parts.push(text.slice(last));
      return { nodes: parts, matches: found.filter((m) => m[0] !== ""), error: "" };
    } catch (e) {
      return { nodes: [text], matches: [], error: (e as Error).message };
    }
  }, [pattern, flags, text]);

  const toggleFlag = (f: string) => setFlags((s) => (s.includes(f) ? s.replace(f, "") : s + f));

  return (
    <>
      <Row>
        <Field label="Pattern"><input className="mono" value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="Regular expression" /></Field>
      </Row>
      <Row>
        {[["g", "global"], ["i", "ignore case"], ["m", "multiline"], ["s", "dotAll"], ["u", "unicode"]].map(([f, n]) => (
          <label key={f} className="check"><input type="checkbox" checked={flags.includes(f)} onChange={() => toggleFlag(f)} /> {f} <span className="field-hint">{n}</span></label>
        ))}
      </Row>
      <div className="chips">
        {PRESETS.map(([n, p]) => <button key={n} className="chip" onClick={() => setPattern(p)}>{n}</button>)}
      </div>
      <ErrorText>{error}</ErrorText>
      <Field label="Test string"><textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} /></Field>
      <div className="field">
        <span className="field-label">{matches.length} match{matches.length === 1 ? "" : "es"}</span>
        <div className="highlight">{nodes}</div>
      </div>
      {matches.length > 0 && (
        <table>
          <thead><tr><th>#</th><th>Match</th><th>Index</th><th>Groups</th></tr></thead>
          <tbody>
            {matches.map((m, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td className="mono">{m[0]}</td>
                <td>{m.index}</td>
                <td className="mono">{m.slice(1).map((g, j) => `$${j + 1}=${g ?? "∅"}`).join("  ")}{m.groups && Object.entries(m.groups).map(([k, v]) => ` ${k}=${v}`).join("")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
