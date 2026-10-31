"use client";

import { useToolInput } from "@/components/useToolInput";
import { useState } from "react";
import { Output, Row } from "@/components/ui";

const BASIC: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

const encode = (s: string, all: boolean) =>
  s.replace(all ? /[^\x20-\x7e]|[&<>"']/gu : /[&<>"']/g, (c) => BASIC[c] ?? `&#${c.codePointAt(0)};`);

const decode = (s: string) => {
  const el = document.createElement("textarea");
  el.innerHTML = s;
  return el.value;
};

export default function HtmlEntities() {
  const [input, setInput] = useState('<a href="/">Café & “quotes”</a>');
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [all, setAll] = useState(false);
  useToolInput("html-entities", (settings) => {
    if (settings.input !== undefined) setInput(settings.input as typeof input);
    if (settings.mode !== undefined) setMode(settings.mode as typeof mode);
    if (settings.all !== undefined) setAll(settings.all as typeof all);
  });
  const out = mode === "encode" ? encode(input, all) : decode(input);
  return (
    <>
      <Row>
        <div className="btn-group">
          <button className={`btn ${mode === "encode" ? "" : "btn-ghost"}`} onClick={() => setMode("encode")}>Escape</button>
          <button className={`btn ${mode === "decode" ? "" : "btn-ghost"}`} onClick={() => setMode("decode")}>Unescape</button>
        </div>
        {mode === "encode" && <label className="check"><input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} /> Also encode non-ASCII</label>}
      </Row>
      <textarea rows={6} value={input} onChange={(e) => setInput(e.target.value)} />
      <Output label="Result" value={out} />
    </>
  );
}
