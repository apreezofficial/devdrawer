"use client";

import { useState } from "react";
import { Field, Row, Stat } from "@/components/ui";

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const PRESETS: [string, number, number][] = [
  ["16:9", 1920, 1080], ["4:3", 1024, 768], ["1:1", 1080, 1080], ["21:9", 2560, 1080],
  ["9:16", 1080, 1920], ["3:2", 1500, 1000], ["4:5", 1080, 1350], ["OG 1.91:1", 1200, 630],
];

export default function AspectRatio() {
  const [w, setW] = useState(1920);
  const [h, setH] = useState(1080);
  const [newW, setNewW] = useState(1280);
  const [newH, setNewH] = useState(720);
  const g = w && h ? gcd(Math.round(w), Math.round(h)) : 1;
  const ratio = h ? w / h : 0;

  return (
    <>
      <div className="chips">
        {PRESETS.map(([n, pw, ph]) => (
          <button key={n} className="chip" onClick={() => { setW(pw); setH(ph); setNewW(Math.round(newH * (pw / ph))); }}>{n}</button>
        ))}
      </div>
      <Row>
        <Field label="Original width"><input type="number" min={1} value={w} onChange={(e) => { setW(+e.target.value); if (h) setNewH(Math.round(newW / (+e.target.value / h))); }} /></Field>
        <Field label="Original height"><input type="number" min={1} value={h} onChange={(e) => { setH(+e.target.value); if (+e.target.value) setNewH(Math.round(newW / (w / +e.target.value))); }} /></Field>
      </Row>
      <div className="stats">
        <Stat label="Aspect ratio" value={w && h ? `${w / g}:${h / g}` : "—"} />
        <Stat label="Decimal" value={ratio ? ratio.toFixed(4) : "—"} />
        <Stat label="Megapixels" value={((w * h) / 1e6).toFixed(2)} />
      </div>
      <Row>
        <Field label="New width"><input type="number" min={1} value={newW} onChange={(e) => { setNewW(+e.target.value); if (ratio) setNewH(Math.round(+e.target.value / ratio)); }} /></Field>
        <Field label="New height"><input type="number" min={1} value={newH} onChange={(e) => { setNewH(+e.target.value); if (ratio) setNewW(Math.round(+e.target.value * ratio)); }} /></Field>
      </Row>
      {ratio > 0 && (
        <div style={{ display: "grid", placeItems: "center", padding: 16, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20 }}>
          <div style={{ width: ratio >= 1 ? 280 : 280 * ratio, aspectRatio: `${w} / ${h}`, background: "var(--ink)", color: "var(--on-ink)", borderRadius: 14, display: "grid", placeItems: "center", fontFamily: "var(--mono)", fontWeight: 700 }}>
            {newW} × {newH}
          </div>
        </div>
      )}
    </>
  );
}
