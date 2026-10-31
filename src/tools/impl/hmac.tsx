"use client";

import { useToolInput } from "@/components/useToolInput";
import { useEffect, useState } from "react";
import { Field, Output, Row } from "@/components/ui";

export default function HmacTool() {
  const [msg, setMsg] = useState('{"event":"payment.succeeded"}');
  const [key, setKey] = useState("my-webhook-secret");
  const [algo, setAlgo] = useState("SHA-256");
  const [enc, setEnc] = useState<"hex" | "base64">("hex");
  const [out, setOut] = useState("");
  useToolInput("hmac", (settings) => {
    if (settings.msg !== undefined) setMsg(settings.msg as typeof msg);
    if (settings.algo !== undefined) setAlgo(settings.algo as typeof algo);
    if (settings.enc !== undefined) setEnc(settings.enc as typeof enc);
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!key) return setOut("");
      const te = new TextEncoder();
      const k = await crypto.subtle.importKey("raw", te.encode(key), { name: "HMAC", hash: algo }, false, ["sign"]);
      const sig = new Uint8Array(await crypto.subtle.sign("HMAC", k, te.encode(msg)));
      const v = enc === "hex" ? Array.from(sig, (b) => b.toString(16).padStart(2, "0")).join("") : btoa(String.fromCharCode(...sig));
      if (alive) setOut(v);
    })();
    return () => { alive = false; };
  }, [msg, key, algo, enc]);

  return (
    <>
      <Field label="Message"><textarea rows={5} value={msg} onChange={(e) => setMsg(e.target.value)} /></Field>
      <Row>
        <Field label="Secret key"><input value={key} onChange={(e) => setKey(e.target.value)} /></Field>
        <Field label="Algorithm">
          <select value={algo} onChange={(e) => setAlgo(e.target.value)}>
            <option>SHA-1</option><option>SHA-256</option><option>SHA-384</option><option>SHA-512</option>
          </select>
        </Field>
        <Field label="Output">
          <select value={enc} onChange={(e) => setEnc(e.target.value as typeof enc)}>
            <option value="hex">Hex</option><option value="base64">Base64</option>
          </select>
        </Field>
      </Row>
      <Output label={`HMAC-${algo}`} value={out} rows={3} />
    </>
  );
}
