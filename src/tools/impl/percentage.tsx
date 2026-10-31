"use client";

import { useState } from "react";

const fmt = (n: number) => (Number.isFinite(n) ? +n.toFixed(4) + "" : "—");

function Calc({ parts, compute }: { parts: [string, string, string]; compute: (a: number, b: number) => string }) {
  const [a, setA] = useState(10);
  const [b, setB] = useState(200);
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
  return (
    <div className="list">
      <Calc parts={["What is", "% of", "?"]} compute={(a, b) => fmt((a / 100) * b)} />
      <Calc parts={["", "is what % of", "?"]} compute={(a, b) => `${fmt((a / b) * 100)}%`} />
      <Calc parts={["% change from", "to", ""]} compute={(a, b) => { const v = ((b - a) / Math.abs(a)) * 100; return `${v > 0 ? "+" : ""}${fmt(v)}%`; }} />
      <Calc parts={["Increase", "by", "%"]} compute={(a, b) => fmt(a * (1 + b / 100))} />
      <Calc parts={["Decrease", "by", "%"]} compute={(a, b) => fmt(a * (1 - b / 100))} />
    </div>
  );
}
