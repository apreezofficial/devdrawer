"use client";

import { useMemo, useState } from "react";
import { Field, Output, Row } from "@/components/ui";

const WORDS =
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum".split(" ");

const rand = (n: number) => Math.floor(Math.random() * n);
const sentence = () => {
  const len = 6 + rand(10);
  const s = Array.from({ length: len }, () => WORDS[rand(WORDS.length)]).join(" ");
  return s.charAt(0).toUpperCase() + s.slice(1) + ".";
};
const paragraph = () => Array.from({ length: 3 + rand(4) }, sentence).join(" ");

export default function LoremIpsum() {
  const [count, setCount] = useState(3);
  const [unit, setUnit] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const [classic, setClassic] = useState(true);
  const [seed, setSeed] = useState(0);

  const text = useMemo(() => {
    void seed;
    let out: string;
    if (unit === "words") out = Array.from({ length: count }, () => WORDS[rand(WORDS.length)]).join(" ");
    else if (unit === "sentences") out = Array.from({ length: count }, sentence).join(" ");
    else out = Array.from({ length: count }, paragraph).join("\n\n");
    if (classic) out = "Lorem ipsum dolor sit amet, " + out.charAt(0).toLowerCase() + out.slice(1);
    return out;
  }, [count, unit, classic, seed]);

  return (
    <>
      <Row>
        <Field label="Amount"><input type="number" min={1} max={500} value={count} onChange={(e) => setCount(Math.max(1, Math.min(500, +e.target.value || 1)))} /></Field>
        <Field label="Unit">
          <select value={unit} onChange={(e) => setUnit(e.target.value as typeof unit)}>
            <option value="paragraphs">Paragraphs</option>
            <option value="sentences">Sentences</option>
            <option value="words">Words</option>
          </select>
        </Field>
        <label className="check"><input type="checkbox" checked={classic} onChange={(e) => setClassic(e.target.checked)} /> Start with “Lorem ipsum”</label>
        <button className="btn" onClick={() => setSeed((s) => s + 1)}>Regenerate</button>
      </Row>
      <Output label="Result" value={text} mono={false} rows={12} />
    </>
  );
}
