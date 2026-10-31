"use client";

import { useEffect, useState } from "react";
import { Field, FileDrop, formatBytes, Row, Stat } from "@/components/ui";

const FORMATS = [["image/png", "PNG"], ["image/jpeg", "JPG"], ["image/webp", "WebP"]] as const;

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<string>("image/webp");
  const [quality, setQuality] = useState(0.9);
  const [bg, setBg] = useState("#ffffff");
  const [out, setOut] = useState<{ url: string; size: number } | null>(null);

  useEffect(() => {
    if (!file) return;
    let url = "", alive = true;
    const src = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext("2d")!;
      // JPG has no alpha channel, so fill transparent areas.
      if (format === "image/jpeg") { ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height); }
      ctx.drawImage(img, 0, 0);
      c.toBlob((b) => {
        if (!b || !alive) return;
        url = URL.createObjectURL(b);
        setOut({ url, size: b.size });
      }, format, quality);
      URL.revokeObjectURL(src);
    };
    img.src = src;
    return () => { alive = false; if (url) URL.revokeObjectURL(url); };
  }, [file, format, quality, bg]);

  const ext = FORMATS.find((f) => f[0] === format)![1].toLowerCase();

  return (
    <>
      <FileDrop accept="image/*" onFile={setFile} label="Choose an image (PNG, JPG, WebP, GIF, BMP, SVG…)" />
      {file && (
        <>
          <Row>
            <Field label="Convert to"><select value={format} onChange={(e) => setFormat(e.target.value)}>{FORMATS.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></Field>
            {format !== "image/png" && <Field label={`Quality: ${Math.round(quality * 100)}%`}><input type="range" min={0.1} max={1} step={0.05} value={quality} onChange={(e) => setQuality(+e.target.value)} /></Field>}
            {format === "image/jpeg" && <Field label="Background for transparency"><input type="color" value={bg} onChange={(e) => setBg(e.target.value)} style={{ height: 40, padding: 2 }} /></Field>}
          </Row>
          {out && (
            <>
              <div className="stats">
                <Stat label={`Original (${file.type.split("/")[1] || "?"})`} value={formatBytes(file.size)} />
                <Stat label={`Converted (${ext})`} value={formatBytes(out.size)} />
              </div>
              <img src={out.url} alt="Converted" className="preview-img" />
              <div className="btn-group"><a className="btn" href={out.url} download={`${file.name.replace(/\.[^.]+$/, "")}.${ext}`}>Download .{ext}</a></div>
            </>
          )}
        </>
      )}
    </>
  );
}
