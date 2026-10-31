"use client";

import { useState } from "react";
import { Field, Row } from "@/components/ui";

/** Factor to the base unit (first in each group). Temperature is special-cased. */
const UNITS: Record<string, Record<string, number>> = {
  Length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254 },
  Weight: { kg: 1, g: 0.001, mg: 1e-6, t: 1000, lb: 0.45359237, oz: 0.028349523125 },
  Temperature: { "°C": 1, "°F": 1, K: 1 },
  Data: { B: 1, KB: 1e3, MB: 1e6, GB: 1e9, TB: 1e12, KiB: 1024, MiB: 1024 ** 2, GiB: 1024 ** 3, bit: 0.125 },
  Time: { s: 1, ms: 0.001, min: 60, h: 3600, day: 86400, week: 604800, year: 31557600 },
  Speed: { "m/s": 1, "km/h": 1 / 3.6, mph: 0.44704, knot: 0.514444 },
  Area: { "m²": 1, "km²": 1e6, "ft²": 0.09290304, acre: 4046.8564224, hectare: 1e4 },
  Volume: { L: 1, mL: 0.001, "m³": 1000, gal: 3.785411784, "fl oz": 0.0295735295625, cup: 0.2365882365 },
  CSS: { px: 1, rem: 16, em: 16, pt: 4 / 3, in: 96, cm: 96 / 2.54 },
};

function toTemp(v: number, from: string, to: string) {
  const c = from === "°C" ? v : from === "°F" ? (v - 32) * (5 / 9) : v - 273.15;
  return to === "°C" ? c : to === "°F" ? c * (9 / 5) + 32 : c + 273.15;
}

const fmt = (n: number) => (Math.abs(n) >= 1e-4 && Math.abs(n) < 1e12 ? +n.toPrecision(10) + "" : n.toExponential(6));

export default function UnitConverter() {
  const [group, setGroup] = useState("Length");
  const [value, setValue] = useState(1);
  const [from, setFrom] = useState("km");
  const units = UNITS[group];
  const convert = (to: string) => (group === "Temperature" ? toTemp(value, from, to) : (value * units[from]) / units[to]);

  return (
    <>
      <div className="chips">
        {Object.keys(UNITS).map((g) => (
          <button key={g} className={`chip ${g === group ? "active" : ""}`} onClick={() => { setGroup(g); setFrom(Object.keys(UNITS[g])[0]); }}>{g}</button>
        ))}
      </div>
      <Row>
        <Field label="Value"><input type="number" value={value} onChange={(e) => setValue(+e.target.value)} /></Field>
        <Field label="From">
          <select value={from} onChange={(e) => setFrom(e.target.value)}>
            {Object.keys(units).map((u) => <option key={u}>{u}</option>)}
          </select>
        </Field>
      </Row>
      <div className="list">
        {Object.keys(units).filter((u) => u !== from).map((u) => (
          <div key={u} className="list-item"><span>{fmt(convert(u))}</span><span className="field-hint">{u}</span></div>
        ))}
      </div>
      {group === "CSS" && <p className="field-hint">Assumes a 16px root font size.</p>}
    </>
  );
}
