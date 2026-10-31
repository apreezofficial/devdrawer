"use client";

import { useToolInput } from "@/components/useToolInput";
import { useState } from "react";
import { Field, Output, Row } from "@/components/ui";

type Stop = { color: string; pos: number };

export default function Gradient() {
  const [type, setType] = useState<"linear" | "radial" | "conic">("linear");
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<Stop[]>([{ color: "#4f46e5", pos: 0 }, { color: "#ec4899", pos: 100 }]);
  useToolInput("gradient", (settings) => {
    if (settings.type !== undefined) setType(settings.type as typeof type);
    if (settings.angle !== undefined) setAngle(settings.angle as typeof angle);
    if (settings.stops !== undefined) setStops(settings.stops as typeof stops);
  });

  const list = [...stops].sort((a, b) => a.pos - b.pos).map((s) => `${s.color} ${s.pos}%`).join(", ");
  const css =
    type === "linear" ? `linear-gradient(${angle}deg, ${list})`
    : type === "radial" ? `radial-gradient(circle, ${list})`
    : `conic-gradient(from ${angle}deg, ${list})`;

  const update = (i: number, patch: Partial<Stop>) => setStops(stops.map((s, j) => (i === j ? { ...s, ...patch } : s)));

  return (
    <>
      <div style={{ height: 180, borderRadius: 12, background: css, border: "1px solid var(--border)" }} />
      <Row>
        <Field label="Type">
          <select value={type} onChange={(e) => setType(e.target.value as typeof type)}>
            <option value="linear">Linear</option><option value="radial">Radial</option><option value="conic">Conic</option>
          </select>
        </Field>
        {type !== "radial" && <Field label={`Angle: ${angle}°`}><input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(+e.target.value)} /></Field>}
      </Row>
      {stops.map((s, i) => (
        <Row key={i}>
          <input type="color" value={s.color} onChange={(e) => update(i, { color: e.target.value })} style={{ flex: "0 0 44px", height: 38, padding: 0, border: "none", background: "none" }} />
          <Field label={`Stop ${i + 1}: ${s.pos}%`}><input type="range" min={0} max={100} value={s.pos} onChange={(e) => update(i, { pos: +e.target.value })} /></Field>
          <button className="btn btn-ghost" disabled={stops.length <= 2} onClick={() => setStops(stops.filter((_, j) => j !== i))}>Remove</button>
        </Row>
      ))}
      <div className="btn-group">
        <button className="btn btn-ghost" onClick={() => setStops([...stops, { color: "#22c55e", pos: 50 }])}>+ Add stop</button>
      </div>
      <Output label="CSS" value={`background: ${css};`} rows={3} />
    </>
  );
}
