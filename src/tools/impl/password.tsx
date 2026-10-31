"use client";

import { useToolInput } from "@/components/useToolInput";
import { useCallback, useEffect, useState } from "react";
import { CopyButton, Field, Row } from "@/components/ui";

const SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?/~",
};
const AMBIGUOUS = /[Il1O0o]/g;

/** Unbiased random index via rejection sampling. */
function randIndex(n: number) {
  const max = Math.floor(0x100000000 / n) * n;
  const buf = new Uint32Array(1);
  do crypto.getRandomValues(buf); while (buf[0] >= max);
  return buf[0] % n;
}

export default function PasswordTool() {
  const [length, setLength] = useState(20);
  const [opts, setOpts] = useState({ lower: true, upper: true, digits: true, symbols: true });
  const [noAmbig, setNoAmbig] = useState(false);
  const [list, setList] = useState<string[]>([]);
  useToolInput("password", (settings) => {
    if (settings.length !== undefined) setLength(settings.length as typeof length);
    if (settings.opts !== undefined) setOpts((current) => ({ ...current, ...settings.opts as typeof opts }));
    if (settings.noAmbig !== undefined) setNoAmbig(settings.noAmbig as typeof noAmbig);
  });

  let pool = Object.entries(opts).filter(([, on]) => on).map(([k]) => SETS[k as keyof typeof SETS]).join("");
  if (noAmbig) pool = pool.replace(AMBIGUOUS, "");
  const entropy = pool ? Math.round(length * Math.log2(pool.length)) : 0;
  const strength = entropy >= 100 ? ["Very strong", "var(--ok)"] : entropy >= 70 ? ["Strong", "var(--ok)"] : entropy >= 45 ? ["Okay", "orange"] : ["Weak", "var(--danger)"];

  const run = useCallback(() => {
    if (!pool) return setList([]);
    setList(Array.from({ length: 5 }, () => Array.from({ length }, () => pool[randIndex(pool.length)]).join("")));
  }, [pool, length]);

  useEffect(run, [run]);

  return (
    <>
      <Field label={`Length: ${length}`}><input type="range" min={4} max={128} value={length} onChange={(e) => setLength(+e.target.value)} /></Field>
      <Row>
        {(Object.keys(SETS) as (keyof typeof SETS)[]).map((k) => (
          <label key={k} className="check">
            <input type="checkbox" checked={opts[k]} onChange={(e) => setOpts({ ...opts, [k]: e.target.checked })} /> {k}
          </label>
        ))}
        <label className="check"><input type="checkbox" checked={noAmbig} onChange={(e) => setNoAmbig(e.target.checked)} /> No look-alikes (Il1O0)</label>
        <button className="btn" onClick={run}>Regenerate</button>
      </Row>
      <p style={{ margin: 0 }}>
        <strong style={{ color: strength[1] }}>{strength[0]}</strong> <span className="field-hint">· ~{entropy} bits of entropy</span>
      </p>
      <div className="list">
        {list.map((p, i) => (
          <div key={i} className="list-item"><span>{p}</span><CopyButton value={p} /></div>
        ))}
        {!pool && <p className="error">Pick at least one character set.</p>}
      </div>
    </>
  );
}
