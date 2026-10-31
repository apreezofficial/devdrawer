"use client";

import { useToolInput } from "@/components/useToolInput";
import { useState } from "react";
import { Field, Output, Row } from "@/components/ui";

type Layer = { x: number; y: number; blur: number; spread: number; color: string; alpha: number; inset: boolean };

const hexA = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};
const css = (l: Layer) => `${l.inset ? "inset " : ""}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${hexA(l.color, l.alpha)}`;

const PRESETS: Record<string, Layer[]> = {
  Soft: [{ x: 0, y: 12, blur: 40, spread: -12, color: "#000000", alpha: 0.25, inset: false }],
  Layered: [
    { x: 0, y: 1, blur: 2, spread: 0, color: "#000000", alpha: 0.06, inset: false },
    { x: 0, y: 8, blur: 24, spread: -6, color: "#000000", alpha: 0.18, inset: false },
  ],
  Sharp: [{ x: 6, y: 6, blur: 0, spread: 0, color: "#171717", alpha: 1, inset: false }],
  Glow: [{ x: 0, y: 0, blur: 32, spread: 4, color: "#6366f1", alpha: 0.55, inset: false }],
  Inset: [{ x: 0, y: 2, blur: 6, spread: 0, color: "#000000", alpha: 0.2, inset: true }],
};

export default function BoxShadow() {
  const [layers, setLayers] = useState<Layer[]>(PRESETS.Layered);
  const [active, setActive] = useState(0);
  const [radius, setRadius] = useState(24);
  useToolInput("box-shadow", (settings) => {
    if (settings.radius !== undefined) setRadius(settings.radius as typeof radius);
    if (settings.layers !== undefined) setLayers(settings.layers as typeof layers);
  });
  const l = layers[Math.min(active, layers.length - 1)];
  const value = layers.map(css).join(",\n  ");
  const set = (patch: Partial<Layer>) => setLayers(layers.map((x, i) => (i === active ? { ...x, ...patch } : x)));
  const slider = (label: string, key: "x" | "y" | "blur" | "spread", min: number, max: number) => (
    <Field label={`${label}: ${l[key]}px`}><input type="range" min={min} max={max} value={l[key]} onChange={(e) => set({ [key]: +e.target.value })} /></Field>
  );

  return (
    <>
      <div style={{ display: "grid", placeItems: "center", padding: 48, background: "var(--surface)", borderRadius: 20, border: "1px solid var(--border)" }}>
        <div style={{ width: 180, height: 120, background: "var(--surface)", borderRadius: radius, boxShadow: layers.map(css).join(", ") }} />
      </div>
      <div className="chips">
        {Object.keys(PRESETS).map((p) => <button key={p} className="chip" onClick={() => { setLayers(PRESETS[p]); setActive(0); }}>{p}</button>)}
      </div>
      <div className="chips">
        {layers.map((_, i) => <button key={i} className={`chip ${i === active ? "active" : ""}`} onClick={() => setActive(i)}>Layer {i + 1}</button>)}
        <button className="chip" onClick={() => { setLayers([...layers, { ...l }]); setActive(layers.length); }}>+ Layer</button>
        {layers.length > 1 && <button className="chip" onClick={() => { setLayers(layers.filter((_, i) => i !== active)); setActive(0); }}>Remove layer</button>}
      </div>
      <Row>{slider("X", "x", -50, 50)}{slider("Y", "y", -50, 50)}</Row>
      <Row>{slider("Blur", "blur", 0, 100)}{slider("Spread", "spread", -50, 50)}</Row>
      <Row>
        <Field label="Color"><input type="color" value={l.color} onChange={(e) => set({ color: e.target.value })} style={{ height: 40, padding: 2 }} /></Field>
        <Field label={`Opacity: ${Math.round(l.alpha * 100)}%`}><input type="range" min={0} max={1} step={0.01} value={l.alpha} onChange={(e) => set({ alpha: +e.target.value })} /></Field>
        <Field label={`Radius: ${radius}px`}><input type="range" min={0} max={60} value={radius} onChange={(e) => setRadius(+e.target.value)} /></Field>
        <label className="check"><input type="checkbox" checked={l.inset} onChange={(e) => set({ inset: e.target.checked })} /> Inset</label>
      </Row>
      <Output label="CSS" value={`box-shadow:\n  ${value};`} rows={4} />
    </>
  );
}
