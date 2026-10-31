"use client";

import { useEffect, useRef, useState } from "react";
import { ErrorText, Field, FileDrop, formatBytes, Row } from "@/components/ui";
import { fmtTime, seek } from "@/lib/video";

type CapturableVideo = HTMLVideoElement & { captureStream?: () => MediaStream; mozCaptureStream?: () => MediaStream };

export default function VideoTrimmer() {
  const [src, setSrc] = useState("");
  const [name, setName] = useState("video");
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [progress, setProgress] = useState<number | null>(null);
  const [out, setOut] = useState<{ url: string; size: number; type: string } | null>(null);
  const [error, setError] = useState("");
  const videoRef = useRef<CapturableVideo>(null);

  useEffect(() => () => { if (src) URL.revokeObjectURL(src); }, [src]);

  const onFile = (f: File) => {
    setOut(null); setError("");
    setName(f.name.replace(/\.[^.]+$/, ""));
    setSrc(URL.createObjectURL(f));
  };

  const trim = async () => {
    const v = videoRef.current;
    if (!v) return;
    const capture = v.captureStream?.bind(v) ?? v.mozCaptureStream?.bind(v);
    if (!capture || typeof MediaRecorder === "undefined") return setError("Your browser can't record video. Try Chrome, Edge or Firefox.");
    setError(""); setOut(null);

    const type = ["video/webm;codecs=vp9,opus", "video/webm", "video/mp4"].find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
    await seek(v, start);
    const stream = capture();
    const rec = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: rec.mimeType || "video/webm" });
      setOut({ url: URL.createObjectURL(blob), size: blob.size, type: blob.type });
      setProgress(null);
      v.pause();
    };

    // The clip is recorded in real time while it plays.
    const tick = () => {
      if (rec.state !== "recording") return;
      setProgress((v.currentTime - start) / (end - start));
      if (v.currentTime >= end || v.ended) rec.stop();
      else requestAnimationFrame(tick);
    };
    rec.start(250);
    setProgress(0);
    await v.play();
    requestAnimationFrame(tick);
  };

  const ext = out?.type.includes("mp4") ? "mp4" : "webm";

  return (
    <>
      <FileDrop accept="video/*" onFile={onFile} label="Choose a video to trim" />
      {src && (
        <>
          <video
            ref={videoRef} src={src} controls playsInline className="preview-img" style={{ width: "100%" }}
            onLoadedMetadata={(e) => { const d = e.currentTarget.duration; setDuration(d); setStart(0); setEnd(d); }}
          />
          <Row>
            <Field label={`Start: ${fmtTime(start)}`}>
              <input type="range" min={0} max={duration} step={0.1} value={start} onChange={(e) => { const s = Math.min(+e.target.value, end - 0.1); setStart(s); if (videoRef.current) videoRef.current.currentTime = s; }} />
            </Field>
            <Field label={`End: ${fmtTime(end)}`}>
              <input type="range" min={0} max={duration} step={0.1} value={end} onChange={(e) => { const s = Math.max(+e.target.value, start + 0.1); setEnd(s); if (videoRef.current) videoRef.current.currentTime = s; }} />
            </Field>
          </Row>
          <div className="row-between">
            <span className="field-hint">Clip length: {fmtTime(Math.max(0, end - start))}. Recording runs in real time.</span>
            <button className="btn" onClick={trim} disabled={progress !== null || end - start < 0.1}>
              {progress !== null ? `Trimming… ${Math.round(progress * 100)}%` : "Trim clip"}
            </button>
          </div>
          <ErrorText>{error}</ErrorText>
          {out && (
            <div className="field">
              <span className="field-label">Result · {formatBytes(out.size)}</span>
              <video src={out.url} controls className="preview-img" style={{ width: "100%" }} />
              <div className="btn-group"><a className="btn" href={out.url} download={`${name}-trimmed.${ext}`}>Download .{ext}</a></div>
            </div>
          )}
        </>
      )}
    </>
  );
}
