"use client";

import { useState } from "react";
import { Field, Output, Row, useSeed } from "@/components/ui";

export function slugify(s: string, sep = "-", lower = true) {
  const out = s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, sep)
    .replace(new RegExp(`^\\${sep}+|\\${sep}+$`, "g"), "");
  return lower ? out.toLowerCase() : out;
}

export default function Slugify() {
  const [text, setText] = useSeed("Héllo Wörld! 10 Tips & Tricks for Next.js");
  const [sep, setSep] = useState("-");
  const [lower, setLower] = useState(true);
  return (
    <>
      <Field label="Text"><input value={text} onChange={(e) => setText(e.target.value)} /></Field>
      <Row>
        <Field label="Separator">
          <select value={sep} onChange={(e) => setSep(e.target.value)}>
            <option value="-">Hyphen (-)</option>
            <option value="_">Underscore (_)</option>
            <option value=".">Dot (.)</option>
          </select>
        </Field>
        <label className="check"><input type="checkbox" checked={lower} onChange={(e) => setLower(e.target.checked)} /> Lowercase</label>
      </Row>
      <Output label="Slug" value={slugify(text, sep, lower)} rows={2} />
    </>
  );
}
