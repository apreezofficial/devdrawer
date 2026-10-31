"use client";

import { useToolInput } from "@/components/useToolInput";
import { useState } from "react";
import { ErrorText, Field, Output, Row } from "@/components/ui";
import { parseCsv, toCsv } from "@/lib/csv";

const SAMPLE_JSON = '[\n  {"name":"Ada","lang":"Kotlin","stars":42},\n  {"name":"Linus","lang":"C","stars":99}\n]';

export default function JsonCsv() {
  const [mode, setMode] = useState<"json2csv" | "csv2json">("json2csv");
  const [input, setInput] = useState(SAMPLE_JSON);
  const [delim, setDelim] = useState(",");
  useToolInput("json-csv", (settings) => {
    if (settings.input !== undefined) setInput(settings.input as typeof input);
    if (settings.mode !== undefined) setMode(settings.mode as typeof mode);
    if (settings.delim !== undefined) setDelim(settings.delim as typeof delim);
  });

  let out = "", error = "";
  try {
    if (mode === "json2csv") {
      const data = JSON.parse(input);
      const rows = Array.isArray(data) ? data : [data];
      if (!rows.every((r) => r && typeof r === "object")) throw new Error("Expected an array of objects.");
      out = toCsv(rows, delim);
    } else {
      out = JSON.stringify(parseCsv(input, delim), null, 2);
    }
  } catch (e) {
    error = input.trim() ? (e as Error).message : "";
  }

  const swap = () => { setMode(mode === "json2csv" ? "csv2json" : "json2csv"); if (out) setInput(out); };

  return (
    <>
      <Row>
        <div className="btn-group">
          <button className={`btn ${mode === "json2csv" ? "" : "btn-ghost"}`} onClick={() => mode !== "json2csv" && swap()}>JSON → CSV</button>
          <button className={`btn ${mode === "csv2json" ? "" : "btn-ghost"}`} onClick={() => mode !== "csv2json" && swap()}>CSV → JSON</button>
        </div>
        <Field label="Delimiter">
          <select value={delim} onChange={(e) => setDelim(e.target.value)}>
            <option value=",">Comma</option><option value=";">Semicolon</option><option value={"\t"}>Tab</option><option value="|">Pipe</option>
          </select>
        </Field>
      </Row>
      <Field label={mode === "json2csv" ? "JSON" : "CSV"}><textarea rows={10} value={input} onChange={(e) => setInput(e.target.value)} /></Field>
      <ErrorText>{error}</ErrorText>
      {!error && <Output label={mode === "json2csv" ? "CSV" : "JSON"} value={out} rows={10} />}
    </>
  );
}
