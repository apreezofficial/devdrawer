"use client";

import { useEffect, useState } from "react";
import { CopyButton, FileDrop, formatBytes, useSeed } from "@/components/ui";

const ALGOS = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;

const toHex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");

export default function HashTool() {
  const [text, setText] = useSeed("hello world");
  const [file, setFile] = useState<File | null>(null);
  const [upper, setUpper] = useState(false);
  const [hashes, setHashes] = useState<Record<string, string>>({});

  useEffect(() => {
    let alive = true;
    (async () => {
      const data = file ? await file.arrayBuffer() : new TextEncoder().encode(text);
      const entries = await Promise.all(ALGOS.map(async (a) => [a, toHex(await crypto.subtle.digest(a, data))] as const));
      if (alive) setHashes(Object.fromEntries(entries));
    })();
    return () => { alive = false; };
  }, [text, file]);

  return (
    <>
      {file ? (
        <div className="row-between">
          <span>Hashing file <strong>{file.name}</strong> ({formatBytes(file.size)})</span>
          <button className="btn btn-ghost" onClick={() => setFile(null)}>Use text instead</button>
        </div>
      ) : (
        <>
          <textarea rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder="Text to hash…" />
          <FileDrop accept="*/*" onFile={setFile} label="…or hash a file (checksum)" />
        </>
      )}
      <label className="check"><input type="checkbox" checked={upper} onChange={(e) => setUpper(e.target.checked)} /> Uppercase</label>
      <div className="list">
        {ALGOS.map((a) => {
          const v = upper ? hashes[a]?.toUpperCase() : hashes[a];
          return (
            <div key={a} className="list-item">
              <span><span className="field-hint" style={{ display: "inline-block", width: 70 }}>{a}</span>{v}</span>
              <CopyButton value={v ?? ""} />
            </div>
          );
        })}
      </div>
    </>
  );
}
