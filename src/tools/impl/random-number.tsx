"use client";

import { useToolInput } from "@/components/useToolInput";
import { useCallback, useEffect, useState } from "react";
import { Field, Output, Row } from "@/components/ui";
import { randomInteger as randInt } from "@/lib/random";


export default function RandomNumber() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [unique, setUnique] = useState(false);
  const [out, setOut] = useState("");
  useToolInput("random-number", (settings) => {
    if (settings.min !== undefined) setMin(settings.min as typeof min);
    if (settings.max !== undefined) setMax(settings.max as typeof max);
    if (settings.count !== undefined) setCount(settings.count as typeof count);
    if (settings.unique !== undefined) setUnique(settings.unique as typeof unique);
  });

  const roll = useCallback(() => {
    if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max)) return setOut("Enter safe whole numbers for the minimum and maximum.");
    const lo = Math.min(min, max), hi = Math.max(min, max);
    if (unique && count > hi - lo + 1) return setOut("Range is too small for that many unique numbers.");
    const set = new Set<number>(), list: number[] = [];
    while (list.length < count) {
      const n = randInt(lo, hi);
      if (unique && set.has(n)) continue;
      set.add(n);
      list.push(n);
    }
    setOut(list.join("\n"));
  }, [min, max, count, unique]);

  useEffect(roll, [roll]);

  return (
    <>
      <Row>
        <Field label="Min"><input type="number" value={min} onChange={(e) => setMin(Math.trunc(+e.target.value))} /></Field>
        <Field label="Max"><input type="number" value={max} onChange={(e) => setMax(Math.trunc(+e.target.value))} /></Field>
        <Field label="How many"><input type="number" min={1} max={10000} value={count} onChange={(e) => setCount(Math.max(1, Math.min(10000, +e.target.value || 1)))} /></Field>
        <label className="check"><input type="checkbox" checked={unique} onChange={(e) => setUnique(e.target.checked)} /> Unique</label>
      </Row>
      <div className="btn-group">
        <button className="btn" onClick={roll}>Generate</button>
        <button className="btn btn-ghost" onClick={() => setOut(`🎲 ${randInt(1, 6)}`)}>Roll a die</button>
        <button className="btn btn-ghost" onClick={() => setOut(randInt(0, 1) ? "🪙 Heads" : "🪙 Tails")}>Flip a coin</button>
      </div>
      <Output label="Result" value={out} rows={Math.min(12, count + 1)} />
    </>
  );
}
