"use client";

import { useMemo, useState } from "react";
import { Field, Stat } from "@/components/ui";

type Op = { kind: "same" | "add" | "del"; text: string };

/** Line diff via longest common subsequence. Fine for a few thousand lines. */
function diffLines(a: string[], b: string[]): Op[] {
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out: Op[] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { out.push({ kind: "same", text: a[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) out.push({ kind: "del", text: a[i++] });
    else out.push({ kind: "add", text: b[j++] });
  }
  while (i < n) out.push({ kind: "del", text: a[i++] });
  while (j < m) out.push({ kind: "add", text: b[j++] });
  return out;
}

export default function TextDiff() {
  const [a, setA] = useState("The quick brown fox\njumps over\nthe lazy dog");
  const [b, setB] = useState("The quick brown fox\nleaps over\nthe lazy dog\nand runs away");
  const ops = useMemo(() => diffLines(a.split("\n"), b.split("\n")), [a, b]);
  const added = ops.filter((o) => o.kind === "add").length;
  const removed = ops.filter((o) => o.kind === "del").length;

  return (
    <>
      <div className="row">
        <Field label="Original"><textarea rows={10} value={a} onChange={(e) => setA(e.target.value)} /></Field>
        <Field label="Changed"><textarea rows={10} value={b} onChange={(e) => setB(e.target.value)} /></Field>
      </div>
      <div className="stats">
        <Stat label="Lines added" value={<span className="ok">+{added}</span>} />
        <Stat label="Lines removed" value={<span className="error">−{removed}</span>} />
      </div>
      <div className="diff">
        {ops.map((o, i) => (
          <div key={i} className={o.kind === "same" ? "" : o.kind}>
            {o.kind === "add" ? "+ " : o.kind === "del" ? "− " : "  "}{o.text || " "}
          </div>
        ))}
      </div>
    </>
  );
}
