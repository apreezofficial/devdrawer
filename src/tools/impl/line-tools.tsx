"use client";

import { useState } from "react";
import { Output, useSeed } from "@/components/ui";

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
  const [text, setText] = useSeed("banana\napple\ncherry\napple\n\n  date  ");
  const [out, setOut] = useState("");
  return (
    <>
      <textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="btn-group">
        {ops.map(([name, fn]) => (
          <button key={name} className="btn btn-ghost" onClick={() => setOut(fn((out || text).split("\n")).join("\n"))}>{name}</button>
        ))}
        <button className="btn btn-ghost" onClick={() => setOut("")}>Reset</button>
      </div>
      <Output label={`Result (${(out || text).split("\n").length} lines) · operations stack until reset`} value={out || text} rows={8} />
    </>
  );
}
