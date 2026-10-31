"use client";

import { useState } from "react";
import { ErrorText, Field, Output, Row } from "@/components/ui";

const pem = (label: string, buf: ArrayBuffer) => {
  let bin = "";
  for (const b of new Uint8Array(buf)) bin += String.fromCharCode(b);
  const b64 = btoa(bin).match(/.{1,64}/g)!.join("\n");
  return `-----BEGIN ${label}-----\n${b64}\n-----END ${label}-----`;
};

const ALGOS = {
  "RSA-OAEP": { usages: ["encrypt", "decrypt"], note: "Encryption" },
  "RSASSA-PKCS1-v1_5": { usages: ["sign", "verify"], note: "Signatures (RS256)" },
  "RSA-PSS": { usages: ["sign", "verify"], note: "Signatures (PS256)" },
} as const;

export default function RsaKeys() {
  const [bits, setBits] = useState(2048);
  const [algo, setAlgo] = useState<keyof typeof ALGOS>("RSASSA-PKCS1-v1_5");
  const [keys, setKeys] = useState<{ pub: string; priv: string; jwk: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setBusy(true);
    setError("");
    try {
      const pair = await crypto.subtle.generateKey(
        { name: algo, modulusLength: bits, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
        true,
        ALGOS[algo].usages as unknown as KeyUsage[],
      );
      const [spki, pkcs8, jwk] = await Promise.all([
        crypto.subtle.exportKey("spki", pair.publicKey),
        crypto.subtle.exportKey("pkcs8", pair.privateKey),
        crypto.subtle.exportKey("jwk", pair.publicKey),
      ]);
      setKeys({ pub: pem("PUBLIC KEY", spki), priv: pem("PRIVATE KEY", pkcs8), jwk: JSON.stringify(jwk, null, 2) });
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(false);
  };

  return (
    <>
      <Row>
        <Field label="Key size">
          <select value={bits} onChange={(e) => setBits(+e.target.value)}><option value={2048}>2048 bits</option><option value={3072}>3072 bits</option><option value={4096}>4096 bits</option></select>
        </Field>
        <Field label="Algorithm">
          <select value={algo} onChange={(e) => setAlgo(e.target.value as keyof typeof ALGOS)}>
            {Object.entries(ALGOS).map(([k, v]) => <option key={k} value={k}>{k} · {v.note}</option>)}
          </select>
        </Field>
        <button className="btn" onClick={generate} disabled={busy}>{busy ? "Generating…" : "Generate key pair"}</button>
      </Row>
      <ErrorText>{error}</ErrorText>
      {keys && (
        <>
          <Output label="Public key (SPKI PEM)" value={keys.pub} rows={8} />
          <Output label="Private key (PKCS#8 PEM). Keep this secret." value={keys.priv} rows={10} />
          <Output label="Public key (JWK)" value={keys.jwk} rows={8} />
        </>
      )}
      <p className="field-hint">Generated with the Web Crypto API. Keys never leave this tab.</p>
    </>
  );
}
