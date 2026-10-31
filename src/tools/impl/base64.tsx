"use client";

import { useState } from "react";
import { ErrorText, Output, Row, useSeed } from "@/components/ui";

export const utf8ToB64 = (s: string) => {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
};

export const b64ToUtf8 = (s: string) => {
  const bin = atob(s.replace(/\s/g, ""));
  return new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
};

export default function Base64Tool() {
  const [input, setInput] = useSeed("Hello, AllDevNeedy 👋");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [urlSafe, setUrlSafe] = useState(false);

  let out = "", error = "";
  try {
    if (mode === "encode") {
      out = utf8ToB64(input);
      if (urlSafe) out = out.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    } else {
      let s = input.trim().replace(/-/g, "+").replace(/_/g, "/");
      s += "=".repeat((4 - (s.length % 4)) % 4);
      out = b64ToUtf8(s);
    }
  } catch {
    error = mode === "decode" ? "That's not valid Base64 (or it isn't UTF-8 text)." : "Couldn't encode.";
  }

  return (
    <>
      <Row>
        <div className="btn-group">
          <button className={`btn ${mode === "encode" ? "" : "btn-ghost"}`} onClick={() => setMode("encode")}>Encode</button>
          <button className={`btn ${mode === "decode" ? "" : "btn-ghost"}`} onClick={() => setMode("decode")}>Decode</button>
          <button className="btn btn-ghost" onClick={() => { setInput(out); setMode(mode === "encode" ? "decode" : "encode"); }} disabled={!out}>⇅ Swap</button>
        </div>
        {mode === "encode" && <label className="check"><input type="checkbox" checked={urlSafe} onChange={(e) => setUrlSafe(e.target.checked)} /> URL-safe</label>}
      </Row>
      <textarea rows={6} value={input} onChange={(e) => setInput(e.target.value)} />
      <ErrorText>{error}</ErrorText>
      <Output label={mode === "encode" ? "Base64" : "Decoded text"} value={out} />
    </>
  );
}
