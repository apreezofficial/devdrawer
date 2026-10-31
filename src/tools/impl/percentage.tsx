"use client";

import { useState } from "react";
import { useToolInput } from "@/components/useToolInput";
const fmt = (n: number) => (Number.isFinite(n) ? +n.toFixed(4) + "" : "—");

function Calc({ parts, compute, values }: { parts: [string, string, string]; compute: (a: number, b: number) => string; values: [number, number] }) {
  const [a, setA] = useState(values[0]);
  const [b, setB] = useState(values[1]);
  return (
    <div className="list-item" style={{ fontFamily: "inherit", flexWrap: "wrap" }}>
      <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {parts[0]} <input type="number" value={a} onChange={(e) => setA(+e.target.value)} style={{ width: 110 }} />
        {parts[1]} <input type="number" value={b} onChange={(e) => setB(+e.target.value)} style={{ width: 110 }} />
        {parts[2]}
      </span>
      <strong style={{ fontSize: 18 }}>{compute(a, b)}</strong>
    </div>
  );
}

export default function Percentage() {
  const [values, setValues] = useState<[number, number]>([10, 200]);
  const [revision, setRevision] = useState(0);
  useToolInput("percentage", (settings) => {
    setValues(([a, b]) => [typeof settings.a === "number" ? settings.a : a, typeof settings.b === "number" ? settings.b : b]);
    setRevision((v) => v + 1);
  });
  return (
    <div className="list" key={revision}>
      <Calc values={values} parts={["What is", "% of", "?"]} compute={(a, b) => fmt((a / 100) * b)} />
      <Calc values={values} parts={["", "is what % of", "?"]} compute={(a, b) => `${fmt((a / b) * 100)}%`} />
      <Calc values={values} parts={["% change from", "to", ""]} compute={(a, b) => { const v = ((b - a) / Math.abs(a)) * 100; return `${v > 0 ? "+" : ""}${fmt(v)}%`; }} />
      <Calc values={values} parts={["Increase", "by", "%"]} compute={(a, b) => fmt(a * (1 + b / 100))} />
      <Calc values={values} parts={["Decrease", "by", "%"]} compute={(a, b) => fmt(a * (1 - b / 100))} />
    </div>
  );
}
