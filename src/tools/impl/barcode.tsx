"use client";

import JsBarcode from "jsbarcode";
import { useEffect, useRef, useState } from "react";
import { ErrorText, Field, Row } from "@/components/ui";

const FORMATS: [string, string, string][] = [
  ["CODE128", "Code 128 (any text)", "AllDevNeedy-123"],
  ["EAN13", "EAN-13", "5901234123457"],
  ["EAN8", "EAN-8", "96385074"],
  ["UPC", "UPC-A", "123456789999"],
  ["CODE39", "Code 39", "ADN 2026"],
  ["ITF14", "ITF-14", "15400141288763"],
];

export default function BarcodeTool() {
  const [format, setFormat] = useState("CODE128");
  const [value, setValue] = useState("AllDevNeedy-123");
  const [showText, setShowText] = useState(true);
  const [height, setHeight] = useState(100);
  const [error, setError] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    try {
      JsBarcode(svgRef.current, value, {
        format, displayValue: showText, height, margin: 12, background: "#ffffff", lineColor: "#171717",
        valid: (ok) => setError(ok ? "" : `“${value}” isn't valid for ${format}.`),
      });
    } catch (e) {
      setError((e as Error).message);
    }
  }, [format, value, showText, height]);

  const download = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" }));
    const a = document.createElement("a");
    a.href = url; a.download = `barcode-${format.toLowerCase()}.svg`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Row>
        <Field label="Format">
          <select value={format} onChange={(e) => { setFormat(e.target.value); setValue(FORMATS.find((f) => f[0] === e.target.value)![2]); }}>
            {FORMATS.map(([k, n]) => <option key={k} value={k}>{n}</option>)}
          </select>
        </Field>
        <Field label="Value"><input className="mono" value={value} onChange={(e) => setValue(e.target.value)} /></Field>
      </Row>
      <Row>
        <Field label={`Height: ${height}px`}><input type="range" min={40} max={200} value={height} onChange={(e) => setHeight(+e.target.value)} /></Field>
        <label className="check"><input type="checkbox" checked={showText} onChange={(e) => setShowText(e.target.checked)} /> Show text</label>
      </Row>
      <ErrorText>{error}</ErrorText>
      <div style={{ background: "#fff", borderRadius: 20, padding: 12, overflowX: "auto", textAlign: "center", border: "1px solid var(--border)", opacity: error ? 0.3 : 1 }}>
        <svg ref={svgRef} />
      </div>
      <div className="btn-group"><button className="btn" onClick={download} disabled={!!error}>Download SVG</button></div>
    </>
  );
}
