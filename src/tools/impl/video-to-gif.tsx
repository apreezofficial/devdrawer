"use client";

import { applyPalette, GIFEncoder, quantize } from "gifenc";
import { useEffect, useRef, useState } from "react";
import { Field, FileDrop, formatBytes, Row } from "@/components/ui";
import { fmtTime, seek } from "@/lib/video";

export default function VideoToGif() {
  const [src, setSrc] = useState("");
  const [name, setName] = useState("clip");
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [length, setLength] = useState(3);
  const [fps, setFps] = useState(10);
  const [width, setWidth] = useState(480);
  const [progress, setProgress] = useState<number | null>(null);
  const [out, setOut] = useState<{ url: string; size: number } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => () => { if (src) URL.revokeObjectURL(src); }, [src]);

  const convert = async () => {
    const v = videoRef.current;
    if (!v) return;
    setOut(null);
    v.pause();
    const scale = Math.min(1, width / v.videoWidth);
    const w = Math.round(v.videoWidth * scale), h = Math.round(v.videoHeight * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    const gif = GIFEncoder();
    const end = Math.min(duration, start + length);
    const frames = Math.max(1, Math.round((end - start) * fps));
    const delay = Math.round(1000 / fps);

    for (let i = 0; i < frames; i++) {
      await seek(v, start + i / fps);
      ctx.drawImage(v, 0, 0, w, h);
      const { data } = ctx.getImageData(0, 0, w, h);
      const palette = quantize(data, 256);
      gif.writeFrame(applyPalette(data, palette), w, h, { palette, delay });
      setProgress((i + 1) / frames);
      // Yield so the UI can repaint between frames.
      await new Promise((r) => setTimeout(r));
    }
    gif.finish();
    const blob = new Blob([gif.bytes()], { type: "image/gif" });
    setOut({ url: URL.createObjectURL(blob), size: blob.size });
    setProgress(null);
  };

  return (
    <>
      <FileDrop accept="video/*" onFile={(f) => { setOut(null); setName(f.name.replace(/\.[^.]+$/, "")); setSrc(URL.createObjectURL(f)); }} label="Choose a short video" />
      {src && (
        <>
          <video ref={videoRef} src={src} controls muted playsInline className="preview-img" style={{ width: "100%" }}
            onLoadedMetadata={(e) => { setDuration(e.currentTarget.duration); setStart(0); setLength(Math.min(3, e.currentTarget.duration)); }} />
          <Row>
            <Field label={`Start: ${fmtTime(start)}`}><input type="range" min={0} max={Math.max(0, duration - 0.1)} step={0.1} value={start} onChange={(e) => { setStart(+e.target.value); if (videoRef.current) videoRef.current.currentTime = +e.target.value; }} /></Field>
            <Field label={`Length: ${length.toFixed(1)}s`}><input type="range" min={0.5} max={Math.max(0.5, Math.min(15, duration - start))} step={0.1} value={length} onChange={(e) => setLength(+e.target.value)} /></Field>
          </Row>
          <Row>
            <Field label={`Frame rate: ${fps} fps`}><input type="range" min={5} max={24} value={fps} onChange={(e) => setFps(+e.target.value)} /></Field>
            <Field label="Width">
              <select value={width} onChange={(e) => setWidth(+e.target.value)}>{[240, 320, 480, 640, 800].map((x) => <option key={x} value={x}>{x}px</option>)}</select>
            </Field>
            <button className="btn" onClick={convert} disabled={progress !== null}>{progress !== null ? `Encoding… ${Math.round(progress * 100)}%` : "Make GIF"}</button>
          </Row>
          <p className="field-hint">GIFs grow fast. Keep clips short and small for sharing.</p>
          {out && (
            <div className="field">
              <span className="field-label">Result · {formatBytes(out.size)}</span>
              <img src={out.url} alt="GIF preview" className="preview-img" />
              <div className="btn-group"><a className="btn" href={out.url} download={`${name}.gif`}>Download GIF</a></div>
            </div>
          )}
        </>
      )}
    </>
  );
}
