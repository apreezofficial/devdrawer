"use client";

import { useToolInput } from "@/components/useToolInput";
import { useCallback, useEffect, useState } from "react";
import { Field, Output, Row } from "@/components/ui";

const hex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
const fmt = (h: string) => `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;

function uuidv7() {
  const b = crypto.getRandomValues(new Uint8Array(16));
  const ms = BigInt(Date.now());
  for (let i = 0; i < 6; i++) b[i] = Number((ms >> BigInt(8 * (5 - i))) & 0xffn);
  b[6] = (b[6] & 0x0f) | 0x70;
  b[8] = (b[8] & 0x3f) | 0x80;
  return fmt(hex(b));
}

const ALPHA = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
const nanoid = (size = 21) => Array.from(crypto.getRandomValues(new Uint8Array(size)), (x) => ALPHA[x & 63]).join("");

const gens = {
  v4: () => crypto.randomUUID(),
  v7: uuidv7,
  nanoid: () => nanoid(),
  nil: () => "00000000-0000-0000-0000-000000000000",
};

export default function UuidTool() {
  const [kind, setKind] = useState<keyof typeof gens>("v4");
  const [count, setCount] = useState(5);
  const [upper, setUpper] = useState(false);
  const [noDash, setNoDash] = useState(false);
  const [out, setOut] = useState("");
  useToolInput("uuid", (settings) => {
    if (settings.kind !== undefined) setKind(settings.kind as typeof kind);
    if (settings.count !== undefined) setCount(settings.count as typeof count);
    if (settings.upper !== undefined) setUpper(settings.upper as typeof upper);
    if (settings.noDash !== undefined) setNoDash(settings.noDash as typeof noDash);
  });

  const run = useCallback(() => {
    const list = Array.from({ length: count }, () => {
      let v = gens[kind]();
      if (kind !== "nanoid") {
        if (noDash) v = v.replace(/-/g, "");
        if (upper) v = v.toUpperCase();
      }
      return v;
    });
    setOut(list.join("\n"));
  }, [kind, count, upper, noDash]);

  useEffect(run, [run]);

  return (
    <>
      <Row>
        <Field label="Type">
          <select value={kind} onChange={(e) => setKind(e.target.value as keyof typeof gens)}>
            <option value="v4">UUID v4 (random)</option>
            <option value="v7">UUID v7 (time-ordered)</option>
            <option value="nanoid">nanoid (21 chars)</option>
            <option value="nil">Nil UUID</option>
          </select>
        </Field>
        <Field label="How many"><input type="number" min={1} max={1000} value={count} onChange={(e) => setCount(Math.max(1, Math.min(1000, +e.target.value || 1)))} /></Field>
        <label className="check"><input type="checkbox" checked={upper} onChange={(e) => setUpper(e.target.checked)} /> Uppercase</label>
        <label className="check"><input type="checkbox" checked={noDash} onChange={(e) => setNoDash(e.target.checked)} /> No dashes</label>
        <button className="btn" onClick={run}>Generate</button>
      </Row>
      <Output label="IDs" value={out} rows={Math.min(14, count + 1)} />
    </>
  );
}
