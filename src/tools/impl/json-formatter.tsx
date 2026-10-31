"use client";

import { useState } from "react";
import { ErrorText, Field, Output, Row, Stat, useSeed } from "@/components/ui";

const sortKeys = (v: unknown): unknown =>
  Array.isArray(v) ? v.map(sortKeys)
  : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys((v as Record<string, unknown>)[k])]))
  : v;

function locate(msg: string, text: string) {
  const m = /position (\d+)/.exec(msg);
  if (!m) return msg;
  const pos = +m[1];
  const before = text.slice(0, pos);
  return `${msg} (line ${before.split("\n").length}, column ${pos - before.lastIndexOf("\n")})`;
}

export default function JsonFormatter() {
  const [input, setInput] = useSeed('{"name":"devdrawer","tools":34,"tags":["dev","free"],"open":true}');
  const [indent, setIndent] = useState("2");
  const [sort, setSort] = useState(false);

  let out = "", error = "", parsed: unknown;
  try {
    parsed = JSON.parse(input);
    if (sort) parsed = sortKeys(parsed);
    out = indent === "min" ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indent === "tab" ? "\t" : +indent);
  } catch (e) {
    error = input.trim() ? locate((e as Error).message, input) : "";
  }

  return (
    <>
      <Field label="Input JSON"><textarea rows={10} value={input} onChange={(e) => setInput(e.target.value)} /></Field>
      <Row>
        <Field label="Indent">
          <select value={indent} onChange={(e) => setIndent(e.target.value)}>
            <option value="2">2 spaces</option><option value="4">4 spaces</option><option value="tab">Tab</option><option value="min">Minify</option>
          </select>
        </Field>
        <label className="check"><input type="checkbox" checked={sort} onChange={(e) => setSort(e.target.checked)} /> Sort keys</label>
      </Row>
      {error ? <ErrorText>✗ {error}</ErrorText> : out && (
        <>
          <p className="ok" style={{ margin: 0 }}>✓ Valid JSON</p>
          <div className="stats">
            <Stat label="Type" value={Array.isArray(parsed) ? "array" : typeof parsed} />
            <Stat label="Size" value={`${new Blob([out]).size} B`} />
            <Stat label="Minified" value={`${new Blob([JSON.stringify(parsed)]).size} B`} />
          </div>
          <Output label="Output" value={out} rows={14} />
        </>
      )}
    </>
  );
}
