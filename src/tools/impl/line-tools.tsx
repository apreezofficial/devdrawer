"use client";

import { useToolInput } from "@/components/useToolInput";
import { useState } from "react";
import { Output } from "@/components/ui";

const ops: [string, (l: string[]) => string[]][] = [
  ["Sort A→Z", (l) => [...l].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))],
  ["Sort Z→A", (l) => [...l].sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))],
  ["Sort by length", (l) => [...l].sort((a, b) => a.length - b.length)],
  ["Reverse", (l) => [...l].reverse()],
  ["Shuffle", (l) => { const a = [...l]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }],
  ["Remove duplicates", (l) => [...new Set(l)]],
  ["Remove empty", (l) => l.filter((x) => x.trim())],
  ["Trim each", (l) => l.map((x) => x.trim())],
  ["Number lines", (l) => l.map((x, i) => `${i + 1}. ${x}`)],
];

export default function LineTools() {
  const [text, setText] = useState("banana\napple\ncherry\napple\n\n  date  ");
  const [out, setOut] = useState<string | null>(null);
  useToolInput("line-tools", (settings) => {
    if (settings.text !== undefined) setText(settings.text as typeof text);
    const input = typeof settings.text === "string" ? settings.text : text;
    const operation = ops.find(([name]) => name === settings.operation);
    setOut(operation ? operation[1](input.split("\n")).join("\n") : null);
  });
  return (
    <>
      <textarea rows={8} value={text} onChange={(e) => { setText(e.target.value); setOut(null); }} />
      <div className="btn-group">
        {ops.map(([name, fn]) => (
          <button key={name} className="btn btn-ghost" onClick={() => setOut(fn((out ?? text).split("\n")).join("\n"))}>{name}</button>
        ))}
        <button className="btn btn-ghost" onClick={() => setOut(null)}>Reset</button>
      </div>
      <Output label={`Result (${(out ?? text).split("\n").length} lines) · operations stack until reset`} value={out ?? text} rows={8} />
    </>
  );
}
