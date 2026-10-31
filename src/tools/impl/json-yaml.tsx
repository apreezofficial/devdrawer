"use client";

import { useToolInput } from "@/components/useToolInput";
import { useState } from "react";
import YAML from "yaml";
import { ErrorText, Field, Output, Row } from "@/components/ui";

const SAMPLE = '{\n  "name": "devdrawer",\n  "version": "0.1.0",\n  "tools": ["uuid", "hash"],\n  "private": true\n}';

export default function JsonYaml() {
  const [mode, setMode] = useState<"j2y" | "y2j">("j2y");
  const [input, setInput] = useState(SAMPLE);
  const [indent, setIndent] = useState(2);
  useToolInput("json-yaml", (settings) => {
    if (settings.input !== undefined) setInput(settings.input as typeof input);
    if (settings.mode !== undefined) setMode(settings.mode as typeof mode);
    if (settings.indent !== undefined) setIndent(settings.indent as typeof indent);
  });

  let out = "", error = "";
  try {
    out = mode === "j2y" ? YAML.stringify(JSON.parse(input), { indent }) : JSON.stringify(YAML.parse(input), null, indent);
  } catch (e) {
    error = input.trim() ? (e as Error).message : "";
  }

  const swap = () => { setMode(mode === "j2y" ? "y2j" : "j2y"); if (out && !error) setInput(out); };

  return (
    <>
      <Row>
        <div className="btn-group">
          <button className={`btn ${mode === "j2y" ? "" : "btn-ghost"}`} onClick={() => mode !== "j2y" && swap()}>JSON → YAML</button>
          <button className={`btn ${mode === "y2j" ? "" : "btn-ghost"}`} onClick={() => mode !== "y2j" && swap()}>YAML → JSON</button>
        </div>
        <Field label="Indent"><select value={indent} onChange={(e) => setIndent(+e.target.value)}><option value={2}>2 spaces</option><option value={4}>4 spaces</option></select></Field>
      </Row>
      <Field label={mode === "j2y" ? "JSON" : "YAML"}><textarea rows={12} value={input} onChange={(e) => setInput(e.target.value)} /></Field>
      <ErrorText>{error}</ErrorText>
      {!error && <Output label={mode === "j2y" ? "YAML" : "JSON"} value={out} rows={12} />}
    </>
  );
}
