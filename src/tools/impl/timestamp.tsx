"use client";

import { useToolInput } from "@/components/useToolInput";
import { useEffect, useState } from "react";
import { CopyButton, ErrorText, Field } from "@/components/ui";

function relative(ms: number) {
  const diff = ms - Date.now();
  const abs = Math.abs(diff);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [["year", 31536e6], ["month", 2592e6], ["day", 864e5], ["hour", 36e5], ["minute", 6e4], ["second", 1e3]];
  const [unit, size] = units.find(([, s]) => abs >= s) ?? ["second", 1e3];
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(Math.round(diff / size), unit);
}

export default function Timestamp() {
  const [now, setNow] = useState(() => Date.now());
  const [input, setInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  useToolInput("timestamp", (settings) => {
    if (settings.input !== undefined) setInput(settings.input as typeof input);
    if (typeof settings.dateInput === "string") {
      setDateInput(settings.dateInput);
      const ms = new Date(settings.dateInput).getTime();
      if (Number.isFinite(ms)) setInput(String(Math.floor(ms / 1000)));
    }
  });

  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);

  const raw = input.trim();
  const n = Number(raw);
  const ms = raw ? (/^-?\d+$/.test(raw) ? (raw.replace("-", "").length > 11 ? n : n * 1000) : Date.parse(raw)) : NaN;
  const valid = Number.isFinite(ms) && !Number.isNaN(new Date(ms).getTime());
  const d = new Date(ms);

  const rows: [string, string][] = valid ? [
    ["Local", d.toLocaleString()],
    ["UTC", d.toUTCString()],
    ["ISO 8601", d.toISOString()],
    ["Unix (seconds)", String(Math.floor(ms / 1000))],
    ["Unix (milliseconds)", String(ms)],
    ["Relative", relative(ms)],
  ] : [];

  return (
    <>
      <div className="list-item">
        <span>Now: <strong>{Math.floor(now / 1000)}</strong> <span className="field-hint">({now} ms)</span></span>
        <CopyButton value={String(Math.floor(now / 1000))} />
      </div>
      <Field label="Timestamp or date" hint="Seconds, milliseconds, or any date string like 2026-10-31 12:00">
        <input className="mono" value={input} onChange={(e) => setInput(e.target.value)} placeholder={String(Math.floor(now / 1000))} />
      </Field>
      <ErrorText>{raw && !valid ? "Couldn't understand that date." : ""}</ErrorText>
      {valid && (
        <div className="list">
          {rows.map(([k, v]) => <div key={k} className="list-item"><span><span className="field-hint" style={{ display: "inline-block", width: 160 }}>{k}</span>{v}</span><CopyButton value={v} /></div>)}
        </div>
      )}
      <Field label="Pick a date → timestamp">
        <input type="datetime-local" value={dateInput} onChange={(e) => { setDateInput(e.target.value); const t = new Date(e.target.value).getTime(); if (!Number.isNaN(t)) setInput(String(Math.floor(t / 1000))); }} />
      </Field>
    </>
  );
}
