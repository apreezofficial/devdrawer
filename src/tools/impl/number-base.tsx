"use client";

import { useState } from "react";
import { CopyButton, ErrorText } from "@/components/ui";

const BASES = [
  { name: "Binary", radix: 2, prefix: "0b" },
  { name: "Octal", radix: 8, prefix: "0o" },
  { name: "Decimal", radix: 10, prefix: "" },
  { name: "Hexadecimal", radix: 16, prefix: "0x" },
  { name: "Base36", radix: 36, prefix: "" },
];

function parse(s: string, radix: number): bigint | null {
  const clean = s.trim().toLowerCase().replace(/^0[box]/, "").replace(/[_\s]/g, "");
  if (!clean) return null;
  const digits = "0123456789abcdefghijklmnopqrstuvwxyz".slice(0, radix);
  let n = 0n;
  for (const c of clean) {
    const d = digits.indexOf(c);
    if (d < 0) throw new Error(`“${c}” isn't a valid base-${radix} digit`);
    n = n * BigInt(radix) + BigInt(d);
  }
  return n;
}

export default function NumberBase() {
  const [value, setValue] = useState<bigint | null>(255n);
  const [editing, setEditing] = useState<{ radix: number; text: string } | null>(null);
  const [error, setError] = useState("");

  return (
    <>
      {BASES.map((b) => {
        const text = editing?.radix === b.radix ? editing.text : value == null ? "" : value.toString(b.radix);
        return (
          <div key={b.radix} className="field">
            <span className="field-label">{b.name} <span className="field-hint">{b.prefix && `(${b.prefix})`}</span></span>
            <div className="row-between">
              <input
                className="mono"
                value={text}
                onChange={(e) => {
                  setEditing({ radix: b.radix, text: e.target.value });
                  try { setValue(parse(e.target.value, b.radix)); setError(""); }
                  catch (err) { setError((err as Error).message); }
                }}
                onBlur={() => setEditing(null)}
              />
              <CopyButton value={text} />
            </div>
          </div>
        );
      })}
      <ErrorText>{error}</ErrorText>
      <p className="field-hint">Uses BigInt, so arbitrarily large numbers work.</p>
    </>
  );
}
