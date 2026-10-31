"use client";

import { useToolInput } from "@/components/useToolInput";
import { useEffect, useState } from "react";
import { Field, FileDrop, Output, Row } from "@/components/ui";

const SIZES: [number, string][] = [
  [16, "favicon-16x16.png"], [32, "favicon-32x32.png"], [48, "favicon-48x48.png"],
  [180, "apple-touch-icon.png"], [192, "android-chrome-192x192.png"], [512, "android-chrome-512x512.png"],
];

/** Wraps PNG images into a single .ico container (PNG-in-ICO, supported everywhere modern). */
function buildIco(pngs: Uint8Array[], sizes: number[]) {
  const header = 6, entry = 16;
  let offset = header + entry * pngs.length;
  const total = offset + pngs.reduce((a, p) => a + p.length, 0);
  const buf = new Uint8Array(total);
  const dv = new DataView(buf.buffer);
  dv.setUint16(2, 1, true);
  dv.setUint16(4, pngs.length, true);
  pngs.forEach((png, i) => {
    const e = header + entry * i;
    buf[e] = sizes[i] >= 256 ? 0 : sizes[i];
    buf[e + 1] = sizes[i] >= 256 ? 0 : sizes[i];
    dv.setUint16(e + 4, 1, true);
    dv.setUint16(e + 6, 32, true);
    dv.setUint32(e + 8, png.length, true);
    dv.setUint32(e + 12, offset, true);
    buf.set(png, offset);
    offset += png.length;
  });
  return new Blob([buf], { type: "image/x-icon" });
}

export default function FaviconTool() {
  const [file, setFile] = useState<File | null>(null);
  const [radius, setRadius] = useState(0);
  const [padding, setPadding] = useState(0);
  const [bg, setBg] = useState("#ffffff");
  const [transparent, setTransparent] = useState(true);
  const [icons, setIcons] = useState<{ size: number; name: string; url: string; blob: Blob }[]>([]);
  const [ico, setIco] = useState("");
  useToolInput("favicon", (settings) => {
    if (settings.radius !== undefined) setRadius(settings.radius as typeof radius);
    if (settings.padding !== undefined) setPadding(settings.padding as typeof padding);
    if (settings.bg !== undefined) setBg(settings.bg as typeof bg);
    if (settings.transparent !== undefined) setTransparent(settings.transparent as typeof transparent);
  });

  useEffect(() => {
    if (!file) return;
    let alive = true;
    const urls: string[] = [];
    const img = new Image();
    const src = URL.createObjectURL(file);
    img.onload = async () => {
      const made = await Promise.all(SIZES.map(([size, name]) => new Promise<{ size: number; name: string; url: string; blob: Blob }>((resolve) => {
        const c = document.createElement("canvas");
        c.width = c.height = size;
        const ctx = c.getContext("2d")!;
        const r = (radius / 100) * size;
        ctx.beginPath();
        ctx.roundRect(0, 0, size, size, r);
        ctx.clip();
        if (!transparent) { ctx.fillStyle = bg; ctx.fillRect(0, 0, size, size); }
        const pad = (padding / 100) * size;
        const inner = size - pad * 2;
        const scale = Math.min(inner / img.naturalWidth, inner / img.naturalHeight);
        const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        c.toBlob((b) => { const url = URL.createObjectURL(b!); urls.push(url); resolve({ size, name, url, blob: b! }); }, "image/png");
      })));
      if (!alive) return;
      setIcons(made);
      const small = made.filter((m) => m.size <= 48);
      const pngs = await Promise.all(small.map(async (m) => new Uint8Array(await m.blob.arrayBuffer())));
      const icoUrl = URL.createObjectURL(buildIco(pngs, small.map((m) => m.size)));
      urls.push(icoUrl);
      setIco(icoUrl);
      URL.revokeObjectURL(src);
    };
    img.src = src;
    return () => { alive = false; urls.forEach(URL.revokeObjectURL); };
  }, [file, radius, padding, bg, transparent]);

  const html = `<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />`;

  return (
    <>
      <FileDrop accept="image/*" onFile={setFile} label="Choose a square logo (SVG or large PNG works best)" />
      {file && (
        <>
          <Row>
            <Field label={`Corner radius: ${radius}%`}><input type="range" min={0} max={50} value={radius} onChange={(e) => setRadius(+e.target.value)} /></Field>
            <Field label={`Padding: ${padding}%`}><input type="range" min={0} max={30} value={padding} onChange={(e) => setPadding(+e.target.value)} /></Field>
            <label className="check"><input type="checkbox" checked={transparent} onChange={(e) => setTransparent(e.target.checked)} /> Transparent</label>
            {!transparent && <Field label="Background"><input type="color" value={bg} onChange={(e) => setBg(e.target.value)} style={{ height: 40, padding: 2 }} /></Field>}
          </Row>
          <div className="swatches">
            {icons.map((i) => (
              <a key={i.name} className="swatch" href={i.url} download={i.name} title={`Download ${i.name}`}>
                <div className="swatch-color" style={{ display: "grid", placeItems: "center", background: "var(--faint-2)" }}>
                  <img src={i.url} alt="" width={Math.min(i.size, 56)} height={Math.min(i.size, 56)} />
                </div>
                <div className="swatch-label">{i.size}×{i.size}</div>
              </a>
            ))}
          </div>
          <div className="btn-group">
            {ico && <a className="btn" href={ico} download="favicon.ico">Download favicon.ico</a>}
            <span className="field-hint" style={{ alignSelf: "center" }}>Click any size above to download its PNG.</span>
          </div>
          <Output label="Add to your <head>" value={html} rows={5} />
        </>
      )}
    </>
  );
}
