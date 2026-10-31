"use client";

import bcrypt from "bcryptjs";
import { useState } from "react";
import { Field, Output, Row } from "@/components/ui";

export default function BcryptTool() {
  const [password, setPassword] = useState("correct horse battery staple");
  const [rounds, setRounds] = useState(10);
  const [hash, setHash] = useState("");
  const [busy, setBusy] = useState(false);
  const [ms, setMs] = useState(0);

  const [checkPw, setCheckPw] = useState("");
  const [checkHash, setCheckHash] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const [checkErr, setCheckErr] = useState("");

  const run = async () => {
    setBusy(true);
    const t = performance.now();
    setHash(await bcrypt.hash(password, rounds));
    setMs(Math.round(performance.now() - t));
    setBusy(false);
  };

  const verify = async () => {
    try {
      setCheckErr("");
      setResult(await bcrypt.compare(checkPw, checkHash.trim()));
    } catch (e) {
      setResult(null);
      setCheckErr((e as Error).message);
    }
  };

  return (
    <>
      <Row>
        <Field label="Password"><input value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
        <Field label={`Cost (rounds): ${rounds}`} hint="Each +1 doubles the time"><input type="range" min={4} max={15} value={rounds} onChange={(e) => setRounds(+e.target.value)} /></Field>
        <button className="btn" onClick={run} disabled={busy}>{busy ? "Hashing…" : "Hash"}</button>
      </Row>
      {hash && <Output label={`Bcrypt hash · took ${ms} ms`} value={hash} rows={2} />}

      <div className="field-label" style={{ marginTop: 12 }}>Verify a password</div>
      <Row>
        <Field label="Password"><input value={checkPw} onChange={(e) => { setCheckPw(e.target.value); setResult(null); }} /></Field>
        <Field label="Hash"><input className="mono" value={checkHash} placeholder="$2b$10$…" onChange={(e) => { setCheckHash(e.target.value); setResult(null); }} /></Field>
        <button className="btn" onClick={verify} disabled={!checkHash}>Verify</button>
      </Row>
      {result !== null && <p className={result ? "ok" : "error"} style={{ margin: 0, fontWeight: 600 }}>{result ? "✓ Match" : "✗ Does not match"}</p>}
      {checkErr && <p className="error">{checkErr}</p>}
    </>
  );
}
