"use client";

import { useToolInput } from "@/components/useToolInput";
import { useState } from "react";
import { Field, Row, Stat } from "@/components/ui";
import { contrastRatio, parseColor, toHex } from "@/lib/color";

export default function Contrast() {
  const [fg, setFg] = useState("#1c1b19");
  const [bg, setBg] = useState("#fafaf9");
  useToolInput("contrast", (settings) => {
    if (settings.fg !== undefined) setFg(settings.fg as typeof fg);
    if (settings.bg !== undefined) setBg(settings.bg as typeof bg);
  });
  const f = parseColor(fg), b = parseColor(bg);
  const ratio = f && b ? contrastRatio(f, b) : 0;
  const pass = (n: number) => (ratio >= n ? <span className="ok">Pass</span> : <span className="error">Fail</span>);

  const ColorInput = ({ label, value, set }: { label: string; value: string; set: (v: string) => void }) => {
    const c = parseColor(value);
    return (
      <Field label={label}>
        <div className="row" style={{ flexWrap: "nowrap" }}>
          <input type="color" value={c ? toHex(c) : "#000000"} onChange={(e) => set(e.target.value)} style={{ flex: "0 0 44px", height: 38, padding: 0, border: "none", background: "none" }} />
          <input className="mono" value={value} onChange={(e) => set(e.target.value)} />
        </div>
      </Field>
    );
  };

  return (
    <>
      <Row>
        {ColorInput({ label: "Text color", value: fg, set: setFg })}
        {ColorInput({ label: "Background", value: bg, set: setBg })}
        <button className="btn btn-ghost" onClick={() => { setFg(bg); setBg(fg); }}>⇄ Swap</button>
      </Row>
      <div style={{ background: b ? toHex(b) : "#fff", color: f ? toHex(f) : "#000", borderRadius: 12, padding: 24, border: "1px solid var(--border)" }}>
        <div style={{ fontSize: 28, fontWeight: 700 }}>Large heading text</div>
        <p style={{ margin: "8px 0 0" }}>Normal body text looks like this. The quick brown fox jumps over the lazy dog.</p>
      </div>
      <div className="stats">
        <Stat label="Contrast ratio" value={`${ratio.toFixed(2)}:1`} />
        <Stat label="AA normal (4.5)" value={pass(4.5)} />
        <Stat label="AA large (3)" value={pass(3)} />
        <Stat label="AAA normal (7)" value={pass(7)} />
        <Stat label="AAA large (4.5)" value={pass(4.5)} />
      </div>
    </>
  );
}
