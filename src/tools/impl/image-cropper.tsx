"use client";

import { useToolInput } from "@/components/useToolInput";
import { useRef, useState, type PointerEvent } from "react";
import { Field, FileDrop, Row } from "@/components/ui";

type Box = { x: number; y: number; w: number; h: number };

const RATIOS: Record<string, number | null> = { Free: null, "1:1": 1, "16:9": 16 / 9, "4:3": 4 / 3, "3:2": 3 / 2, "9:16": 9 / 16 };

export default function ImageCropper() {
  const [src, setSrc] = useState("");
  const [name, setName] = useState("image");
  const [box, setBox] = useState<Box | null>(null);
  const [ratio, setRatio] = useState("Free");
  const [outUrl, setOutUrl] = useState("");
  useToolInput("image-cropper", (settings) => {
    if (settings.ratio !== undefined) setRatio(settings.ratio as typeof ratio);
  });
  const imgRef = useRef<HTMLImageElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);

  const rel = (e: PointerEvent) => {
    const r = imgRef.current!.getBoundingClientRect();
    return { x: Math.min(Math.max(e.clientX - r.left, 0), r.width), y: Math.min(Math.max(e.clientY - r.top, 0), r.height) };
  };

  const onMove = (e: PointerEvent) => {
    if (!start.current) return;
    const p = rel(e), s = start.current;
    let w = Math.abs(p.x - s.x), h = Math.abs(p.y - s.y);
    const r = RATIOS[ratio];
    if (r) { if (w / h > r) w = h * r; else h = w / r; }
    setBox({ x: p.x < s.x ? s.x - w : s.x, y: p.y < s.y ? s.y - h : s.y, w, h });
  };

  const crop = () => {
    const img = imgRef.current;
    if (!img || !box || box.w < 2) return;
    const k = img.naturalWidth / img.getBoundingClientRect().width;
    const c = document.createElement("canvas");
    c.width = Math.round(box.w * k); c.height = Math.round(box.h * k);
    c.getContext("2d")!.drawImage(img, box.x * k, box.y * k, c.width, c.height, 0, 0, c.width, c.height);
    c.toBlob((b) => b && setOutUrl(URL.createObjectURL(b)), "image/png");
  };

  return (
    <>
      <FileDrop accept="image/*" onFile={(f) => { setSrc(URL.createObjectURL(f)); setName(f.name.replace(/\.[^.]+$/, "")); setBox(null); setOutUrl(""); }} label="Choose an image to crop" />
      {src && (
        <>
          <Row>
            <Field label="Aspect ratio">
              <select value={ratio} onChange={(e) => setRatio(e.target.value)}>
                {Object.keys(RATIOS).map((r) => <option key={r}>{r}</option>)}
              </select>
            </Field>
            <button className="btn" onClick={crop} disabled={!box || box.w < 2}>Crop</button>
          </Row>
          <p className="field-hint">Drag on the image to select the area.</p>
          <div
            style={{ position: "relative", display: "inline-block", touchAction: "none", userSelect: "none", cursor: "crosshair", alignSelf: "flex-start" }}
            onPointerDown={(e) => { (e.target as Element).setPointerCapture(e.pointerId); start.current = rel(e); setBox(null); }}
            onPointerMove={onMove}
            onPointerUp={() => { start.current = null; }}
          >
            <img ref={imgRef} src={src} alt="" className="preview-img" draggable={false} style={{ maxHeight: 520 }} />
            {box && (
              <div style={{ position: "absolute", left: box.x, top: box.y, width: box.w, height: box.h, border: "2px solid #fff", boxShadow: "0 0 0 9999px rgba(0,0,0,.5)", pointerEvents: "none" }} />
            )}
          </div>
          {outUrl && (
            <div className="field">
              <span className="field-label">Result</span>
              <img src={outUrl} alt="Cropped" className="preview-img" />
              <div className="btn-group"><a className="btn" href={outUrl} download={`${name}-cropped.png`}>Download PNG</a></div>
            </div>
          )}
        </>
      )}
    </>
  );
}
