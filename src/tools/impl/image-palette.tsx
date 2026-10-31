"use client";

import { useToolInput } from "@/components/useToolInput";
import { useState } from "react";
import { CopyButton, Field, FileDrop } from "@/components/ui";
import { toHex, type RGB } from "@/lib/color";

/** Quantize to 5 bits/channel, bucket, then merge near-duplicates. */
function extract(img: HTMLImageElement, count: number): RGB[] {
  const size = 96;
  const scale = Math.min(1, size / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale)), h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;

  const buckets = new Map<number, { r: number; g: number; b: number; n: number }>();
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    const key = ((data[i] >> 3) << 10) | ((data[i + 1] >> 3) << 5) | (data[i + 2] >> 3);
    const bk = buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0 };
    bk.r += data[i]; bk.g += data[i + 1]; bk.b += data[i + 2]; bk.n++;
    buckets.set(key, bk);
  }
  const sorted = [...buckets.values()].sort((a, b) => b.n - a.n).map((x) => ({ r: x.r / x.n, g: x.g / x.n, b: x.b / x.n }));
  const out: RGB[] = [];
  for (const c of sorted) {
    if (out.every((o) => Math.hypot(o.r - c.r, o.g - c.g, o.b - c.b) > 40)) out.push(c);
    if (out.length >= count) break;
  }
  return out;
}

export default function ImagePalette() {
  const [src, setSrc] = useState("");
  const [count, setCount] = useState(8);
  const [colors, setColors] = useState<RGB[]>([]);
  useToolInput("image-palette", (settings) => {
    if (settings.count !== undefined) setCount(settings.count as typeof count);
    if (src && settings.count !== undefined) load(src, settings.count as number);
  });

  const load = (url: string, n = count) => {
    const img = new Image();
    img.onload = () => setColors(extract(img, n));
    img.src = url;
  };

  const onFile = (f: File) => {
    const url = URL.createObjectURL(f);
    setSrc(url);
    load(url);
  };

  const hexes = colors.map(toHex);

  return (
    <>
      <FileDrop accept="image/*" onFile={onFile} label="Choose an image to extract its palette" />
      {src && (
        <>
          <img src={src} alt="" className="preview-img" />
          <Field label={`Colors: ${count}`}>
            <input type="range" min={2} max={16} value={count} onChange={(e) => { setCount(+e.target.value); load(src, +e.target.value); }} />
          </Field>
          <div className="swatches">
            {hexes.map((h) => (
              <button key={h} className="swatch" onClick={() => navigator.clipboard.writeText(h)} title="Click to copy">
                <div className="swatch-color" style={{ background: h }} />
                <div className="swatch-label">{h}</div>
              </button>
            ))}
          </div>
          <div className="btn-group">
            <CopyButton value={hexes.join(", ")} label="Copy HEX list" />
            <CopyButton value={`:root {\n${hexes.map((h, i) => `  --palette-${i + 1}: ${h};`).join("\n")}\n}`} label="Copy as CSS vars" />
            <CopyButton value={JSON.stringify(hexes)} label="Copy as JSON" />
          </div>
        </>
      )}
    </>
  );
}
