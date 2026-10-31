"use client";

import { useState } from "react";
import { ErrorText, Field, Output, Row, useSeed } from "@/components/ui";

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default function FindReplace() {
  const [text, setText] = useSeed("Hello world. The world is big.");
  const [find, setFind] = useState("world");
  const [repl, setRepl] = useState("planet");
  const [regex, setRegex] = useState(false);
  const [ci, setCi] = useState(false);

  let out = text, count = 0, error = "";
  if (find) {
    try {
      const re = new RegExp(regex ? find : escape(find), ci ? "gi" : "g");
      count = (text.match(re) || []).length;
      out = text.replace(re, repl);
    } catch (e) {
      error = (e as Error).message;
    }
  }

  return (
    <>
      <textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} />
      <Row>
        <Field label="Find"><input value={find} onChange={(e) => setFind(e.target.value)} /></Field>
        <Field label="Replace with" hint={regex ? "Use $1, $2 for groups" : undefined}><input value={repl} onChange={(e) => setRepl(e.target.value)} /></Field>
      </Row>
      <Row>
        <label className="check"><input type="checkbox" checked={regex} onChange={(e) => setRegex(e.target.checked)} /> Regex</label>
        <label className="check"><input type="checkbox" checked={ci} onChange={(e) => setCi(e.target.checked)} /> Ignore case</label>
      </Row>
      <ErrorText>{error}</ErrorText>
      <Output label={`Result · ${count} replacement${count === 1 ? "" : "s"}`} value={out} rows={8} />
    </>
  );
}
