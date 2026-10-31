"use client";

import { ErrorText, useSeed } from "@/components/ui";

const FIELDS = [
  { name: "minute", min: 0, max: 59 },
  { name: "hour", min: 0, max: 23 },
  { name: "day of month", min: 1, max: 31 },
  { name: "month", min: 1, max: 12, names: ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"] },
  { name: "day of week", min: 0, max: 6, names: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] },
];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MACROS: Record<string, string> = {
  "@yearly": "0 0 1 1 *", "@annually": "0 0 1 1 *", "@monthly": "0 0 1 * *",
  "@weekly": "0 0 * * 0", "@daily": "0 0 * * *", "@midnight": "0 0 * * *", "@hourly": "0 * * * *",
};

type Parsed = { values: Set<number>; any: boolean; raw: string }[];

function parse(expr: string): Parsed {
  const parts = (MACROS[expr.trim().toLowerCase()] ?? expr).trim().split(/\s+/);
  if (parts.length !== 5) throw new Error(`Expected 5 fields (minute hour day month weekday), got ${parts.length}.`);
  return parts.map((raw, i) => {
    const f = FIELDS[i];
    const num = (s: string) => {
      const idx = f.names?.indexOf(s.toLowerCase()) ?? -1;
      const n = idx >= 0 ? idx + f.min : Number(s);
      if (!Number.isInteger(n) || n < f.min || n > (i === 4 ? 7 : f.max)) throw new Error(`“${s}” is out of range for ${f.name} (${f.min}–${f.max}).`);
      return i === 4 && n === 7 ? 0 : n;
    };
    const values = new Set<number>();
    for (const piece of raw.split(",")) {
      const [range, stepStr] = piece.split("/");
      const step = stepStr ? Number(stepStr) : 1;
      if (!Number.isInteger(step) || step < 1) throw new Error(`Bad step “${stepStr}” in ${f.name}.`);
      let lo = f.min, hi = f.max;
      if (range !== "*") {
        const [a, b] = range.split("-");
        lo = num(a);
        hi = b !== undefined ? num(b) : stepStr ? f.max : lo;
      }
      if (lo > hi) throw new Error(`Range ${range} goes backwards in ${f.name}.`);
      for (let v = lo; v <= hi; v += step) values.add(v);
    }
    return { values, any: raw === "*", raw };
  });
}

const list = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);
const pad = (n: number) => String(n).padStart(2, "0");

function describe(p: Parsed) {
  const [min, hour, dom, mon, dow] = p;
  let time: string;
  const step = (raw: string) => /^\*\/(\d+)$/.exec(raw)?.[1];
  if (min.any && hour.any) time = "Every minute";
  else if (step(min.raw) && hour.any) time = `Every ${step(min.raw)} minutes`;
  else if (hour.any) time = `At minute ${list([...min.values].map(String))} of every hour`;
  else if (min.values.size === 1 && hour.values.size <= 6)
    time = `At ${list([...hour.values].map((h) => `${pad(h)}:${pad([...min.values][0])}`))}`;
  else time = `At minute ${list([...min.values].map(String))} past ${step(hour.raw) ? `every ${step(hour.raw)} hours` : `hour ${list([...hour.values].map(String))}`}`;

  const bits = [time];
  if (!dom.any) bits.push(`on day ${list([...dom.values].map(String))} of the month`);
  if (!dow.any) bits.push(`${dom.any ? "on" : "or on"} ${list([...dow.values].map((d) => DAYS[d]))}`);
  if (!mon.any) bits.push(`in ${list([...mon.values].map((m) => MONTHS[m - 1]))}`);
  return bits.join(" ") + ".";
}

function nextRuns(p: Parsed, count: number) {
  const [min, hour, dom, mon, dow] = p;
  const out: Date[] = [];
  const d = new Date();
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() + 1);
  // Standard cron: if both day fields are restricted, either may match.
  const dayOk = (x: Date) =>
    dom.any && dow.any ? true
    : dom.any ? dow.values.has(x.getDay())
    : dow.any ? dom.values.has(x.getDate())
    : dom.values.has(x.getDate()) || dow.values.has(x.getDay());
  for (let guard = 0; out.length < count && guard < 600000; guard++) {
    if (!mon.values.has(d.getMonth() + 1)) { d.setMonth(d.getMonth() + 1, 1); d.setHours(0, 0); continue; }
    if (!dayOk(d)) { d.setDate(d.getDate() + 1); d.setHours(0, 0); continue; }
    if (!hour.values.has(d.getHours())) { d.setHours(d.getHours() + 1, 0); continue; }
    if (!min.values.has(d.getMinutes())) { d.setMinutes(d.getMinutes() + 1); continue; }
    out.push(new Date(d));
    d.setMinutes(d.getMinutes() + 1);
  }
  return out;
}

const EXAMPLES = ["*/5 * * * *", "0 9 * * 1-5", "30 2 1 * *", "0 0 * * 0", "15 14 1,15 * *", "@hourly"];

export default function CronTool() {
  const [expr, setExpr] = useSeed("0 9 * * 1-5");
  let parsed: Parsed | null = null, error = "";
  try { parsed = parse(expr); } catch (e) { error = (e as Error).message; }

  return (
    <>
      <input className="mono" style={{ fontSize: 22, textAlign: "center", padding: 16 }} value={expr} onChange={(e) => setExpr(e.target.value)} />
      <div className="chips" style={{ justifyContent: "center" }}>
        {EXAMPLES.map((x) => <button key={x} className="chip mono" onClick={() => setExpr(x)}>{x}</button>)}
      </div>
      <ErrorText>{expr.trim() ? error : ""}</ErrorText>
      {parsed && (
        <>
          <p style={{ fontSize: 22, fontWeight: 650, letterSpacing: "-0.02em", textAlign: "center", margin: "8px 0" }}>“{describe(parsed)}”</p>
          <table>
            <thead><tr><th>Field</th><th>Value</th><th>Matches</th></tr></thead>
            <tbody>
              {parsed.map((f, i) => (
                <tr key={i}><td>{FIELDS[i].name}</td><td className="mono">{f.raw}</td><td className="field-hint">{f.any ? "any" : [...f.values].join(", ")}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="field">
            <span className="field-label">Next 5 runs (your local time)</span>
            <div className="list">{nextRuns(parsed, 5).map((d) => <div key={+d} className="list-item">{d.toLocaleString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>)}</div>
          </div>
        </>
      )}
    </>
  );
}
