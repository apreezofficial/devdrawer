"use client";

import { CopyButton, useSeed } from "@/components/ui";

const words = (s: string) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_\-./]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

const cases: [string, (s: string) => string][] = [
  ["camelCase", (s) => words(s).map((w, i) => (i ? cap(w) : w.toLowerCase())).join("")],
  ["PascalCase", (s) => words(s).map(cap).join("")],
  ["snake_case", (s) => words(s).map((w) => w.toLowerCase()).join("_")],
  ["SCREAMING_SNAKE", (s) => words(s).map((w) => w.toUpperCase()).join("_")],
  ["kebab-case", (s) => words(s).map((w) => w.toLowerCase()).join("-")],
  ["dot.case", (s) => words(s).map((w) => w.toLowerCase()).join(".")],
  ["Title Case", (s) => words(s).map(cap).join(" ")],
  ["Sentence case", (s) => { const w = words(s).join(" ").toLowerCase(); return w.charAt(0).toUpperCase() + w.slice(1); }],
  ["UPPER CASE", (s) => s.toUpperCase()],
  ["lower case", (s) => s.toLowerCase()],
  ["aLtErNaTiNg", (s) => [...s].map((c, i) => (i % 2 ? c.toUpperCase() : c.toLowerCase())).join("")],
  ["InVeRsE", (s) => [...s].map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join("")],
];

export default function CaseConverter() {
  const [text, setText] = useSeed("hello world from devDrawer");
  return (
    <>
      <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="list">
        {cases.map(([name, fn]) => {
          const v = fn(text);
          return (
            <div key={name} className="list-item">
              <span><span className="field-hint" style={{ display: "inline-block", width: 150 }}>{name}</span>{v}</span>
              <CopyButton value={v} />
            </div>
          );
        })}
      </div>
    </>
  );
}
