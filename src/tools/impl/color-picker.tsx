"use client";

import { useToolInput } from "@/components/useToolInput";
import { useState } from "react";

import { CopyButton, ErrorText, Field, Row } from "@/components/ui";
import { hslToRgb, luminance, parseColor, rgbToHsl, toHex, type RGB } from "@/lib/color";

declare global {
  interface Window { EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> } }
}

export default function ColorPicker() {
  const [input, setInput] = useState("#4f46e5");
  useToolInput("color-picker", (settings) => {
    if (settings.input !== undefined) setInput(settings.input as typeof input);
  });
  const rgb = parseColor(input);
  const hex = rgb ? toHex(rgb) : "#000000";
  const hsl = rgb ? rgbToHsl(rgb) : { h: 0, s: 0, l: 0 };

  const formats = rgb ? [
    ["HEX", hex],
    ["RGB", `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`],
    ["HSL", `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`],
    ["CSS var", `--color-primary: ${hex};`],
    ["Tailwind", `bg-[${hex}]`],
    ["Swift", `Color(red: ${(rgb.r / 255).toFixed(3)}, green: ${(rgb.g / 255).toFixed(3)}, blue: ${(rgb.b / 255).toFixed(3)})`],
    ["Kotlin / Compose", `Color(0xFF${hex.slice(1).toUpperCase()})`],
  ] : [];

  const shades: RGB[] = [95, 85, 75, 65, 55, 45, 35, 25, 15].map((l) => hslToRgb(hsl.h, hsl.s, l));

  const pick = async () => {
    if (!window.EyeDropper) return alert("Your browser doesn't support the EyeDropper API (try Chrome or Edge).");
    try { setInput((await new window.EyeDropper().open()).sRGBHex); } catch { /* cancelled */ }
  };

  return (
    <>
      <Row>
        <input type="color" value={hex} onChange={(e) => setInput(e.target.value)} style={{ height: 44, flex: "0 0 64px", padding: 0, border: "none", background: "none" }} />
        <Field label="Color (HEX, rgb() or hsl())"><input className="mono" value={input} onChange={(e) => setInput(e.target.value)} /></Field>
        <button className="btn btn-ghost" onClick={pick}>🎯 Pick from screen</button>
      </Row>
      <ErrorText>{rgb ? "" : "Couldn't read that color."}</ErrorText>
      {rgb && (
        <>
          <div style={{ height: 96, borderRadius: 12, background: hex, display: "flex", alignItems: "center", justifyContent: "center", color: luminance(rgb) > 0.4 ? "#000" : "#fff", fontFamily: "var(--mono)", fontWeight: 700 }}>{hex}</div>
          <div className="list">
            {formats.map(([k, v]) => (
              <div key={k} className="list-item"><span><span className="field-hint" style={{ display: "inline-block", width: 130 }}>{k}</span>{v}</span><CopyButton value={v} /></div>
            ))}
          </div>
          <div className="field">
            <span className="field-label">Shades</span>
            <div className="swatches">
              {shades.map((c, i) => (
                <button key={i} className="swatch" onClick={() => setInput(toHex(c))}>
                  <div className="swatch-color" style={{ background: toHex(c), height: 48 }} />
                  <div className="swatch-label">{(i + 1) * 100} · {toHex(c)}</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
