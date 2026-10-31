"use client";

import { useEffect, useState, type ReactNode } from "react";

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className="btn btn-ghost"
      disabled={!value}
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setDone(true);
        setTimeout(() => setDone(false), 1200);
      }}
    >
      {done ? "Copied ✓" : label}
    </button>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

export function Output({ label, value, mono = true, rows = 6 }: { label: string; value: string; mono?: boolean; rows?: number }) {
  return (
    <div className="field">
      <div className="row-between">
        <span className="field-label">{label}</span>
        <CopyButton value={value} />
      </div>
      <textarea className={mono ? "mono" : ""} readOnly value={value} rows={rows} />
    </div>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return <div className="row">{children}</div>;
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  return children ? <p className="error">{children}</p> : null;
}

/** Initial input handed over from smart paste (read once, then cleared). */
export function useSeed(fallback = ""): [string, (v: string) => void] {
  const [value, setValue] = useState(fallback);
  useEffect(() => {
    try {
      const q = sessionStorage.getItem("adn:seed");
      sessionStorage.removeItem("adn:seed");
      if (q) setValue(q);
    } catch { /* storage blocked */ }
  }, []);
  return [value, setValue];
}

export function FileDrop({ accept, onFile, label }: { accept: string; onFile: (f: File) => void; label: string }) {
  const [over, setOver] = useState(false);
  return (
    <label
      className={`drop ${over ? "drop-over" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const f = e.dataTransfer.files[0];
        if (f) onFile(f);
      }}
    >
      <input type="file" accept={accept} hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      <span>{label}</span>
      <span className="field-hint">Drop a file or click to choose. Nothing leaves your browser.</span>
    </label>
  );
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 ** 2).toFixed(2)} MB`;
}
