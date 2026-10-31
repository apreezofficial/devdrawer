"use client";

import { useEffect, useState } from "react";
import { Field, FileDrop, formatBytes, Row, Stat } from "@/components/ui";

export default function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [quality, setQuality] = useState(0.75);
  const [format, setFormat] = useState("image/webp");
  const [maxW, setMaxW] = useState(1920);
  const [result, setResult] = useState<{ url: string; size: number; w: number; h: number } | null>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const i = new Image();
    i.onload = () => setImg(i);
    i.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!img) return;
    const scale = Math.min(1, maxW / img.naturalWidth);
    const w = Math.round(img.naturalWidth * scale), h = Math.round(img.naturalHeight * scale);
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d")!;
    if (format === "image/jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h); }
    ctx.drawImage(img, 0, 0, w, h);
    let url = "";
    c.toBlob((blob) => {
      if (!blob) return;
      url = URL.createObjectURL(blob);
      setResult({ url, size: blob.size, w, h });
    }, format, quality);
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [img, quality, format, maxW]);

  const ext = format.split("/")[1].replace("jpeg", "jpg");
  const saved = file && result ? Math.round((1 - result.size / file.size) * 100) : 0;

  return (
    <>
      <FileDrop accept="image/*" onFile={setFile} label="Choose an image to compress" />
      {file && (
        <>
          <Row>
            <Field label="Format">
              <select value={format} onChange={(e) => setFormat(e.target.value)}>
                <option value="image/webp">WebP</option><option value="image/jpeg">JPEG</option><option value="image/png">PNG (lossless)</option>
              </select>
            </Field>
            {format !== "image/png" && <Field label={`Quality: ${Math.round(quality * 100)}%`}><input type="range" min={0.05} max={1} step={0.05} value={quality} onChange={(e) => setQuality(+e.target.value)} /></Field>}
            <Field label="Max width (px)"><input type="number" min={16} value={maxW} onChange={(e) => setMaxW(Math.max(16, +e.target.value || 16))} /></Field>
          </Row>
          {result && (
            <>
              <div className="stats">
                <Stat label="Original" value={formatBytes(file.size)} />
                <Stat label="Compressed" value={formatBytes(result.size)} />
                <Stat label="Saved" value={<span className={saved > 0 ? "ok" : "error"}>{saved}%</span>} />
                <Stat label="Dimensions" value={`${result.w}×${result.h}`} />
              </div>
              <img src={result.url} alt="Compressed preview" className="preview-img" />
              <div className="btn-group">
                <a className="btn" href={result.url} download={`${file.name.replace(/\.[^.]+$/, "")}-compressed.${ext}`}>Download</a>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
