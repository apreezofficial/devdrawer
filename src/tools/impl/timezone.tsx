"use client";

import { useToolInput } from "@/components/useToolInput";
import { useMemo, useState } from "react";
import { Field, Row } from "@/components/ui";

const ZONES: string[] =
  typeof Intl.supportedValuesOf === "function" ? ["UTC", ...Intl.supportedValuesOf("timeZone")] : ["UTC", "Europe/London", "America/New_York", "Asia/Tokyo"];
const DEFAULTS = ["UTC", "America/Los_Angeles", "America/New_York", "Europe/London", "Africa/Lagos", "Asia/Kolkata", "Asia/Tokyo"];

/** Offset of `zone` from UTC, in minutes, at instant `d`. */
function offsetMin(zone: string, d: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: zone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
      .formatToParts(d).map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return Math.round((asUtc - d.getTime()) / 60000);
}

/** Interpret a wall-clock "YYYY-MM-DDTHH:mm" as being in `zone`. */
function zonedToInstant(local: string, zone: string) {
  const [date, time] = local.split("T");
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  const first = guess - offsetMin(zone, new Date(guess)) * 60000;
  return new Date(guess - offsetMin(zone, new Date(first)) * 60000);
}

const fmtOffset = (m: number) => `UTC${m >= 0 ? "+" : "−"}${String(Math.floor(Math.abs(m) / 60)).padStart(2, "0")}:${String(Math.abs(m) % 60).padStart(2, "0")}`;

export default function TimezoneTool() {
  const here = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const nowLocal = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };
  const [when, setWhen] = useState(nowLocal);
  const [from, setFrom] = useState(here);
  const [zones, setZones] = useState<string[]>(() => [...new Set([here, ...DEFAULTS])]);
  const [add, setAdd] = useState("");
  useToolInput("timezone", (settings) => {
    if (settings.when !== undefined) setWhen(settings.when as typeof when);
    if (settings.from !== undefined) setFrom(settings.from as typeof from);
    if (settings.zones !== undefined) setZones(settings.zones as typeof zones);
  });

  const instant = useMemo(() => (when ? zonedToInstant(when, from) : new Date()), [when, from]);

  return (
    <>
      <Row>
        <Field label="Date & time"><input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} /></Field>
        <Field label="In time zone">
          <select value={from} onChange={(e) => setFrom(e.target.value)}>{ZONES.map((z) => <option key={z}>{z}</option>)}</select>
        </Field>
        <button className="btn btn-ghost" onClick={() => { setWhen(nowLocal()); setFrom(here); }}>Now</button>
      </Row>
      <table>
        <thead><tr><th>Zone</th><th>Time</th><th>Offset</th><th></th></tr></thead>
        <tbody>
          {zones.map((z) => (
            <tr key={z}>
              <td style={{ fontWeight: z === from ? 700 : 500 }}>{z.replace(/_/g, " ")}{z === here && <span className="field-hint"> · you</span>}</td>
              <td className="mono">{instant.toLocaleString(undefined, { timeZone: z, weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
              <td className="field-hint">{fmtOffset(offsetMin(z, instant))}</td>
              <td style={{ textAlign: "right" }}><button className="btn btn-ghost" onClick={() => setZones(zones.filter((x) => x !== z))}>✕</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <Row>
        <Field label="Add a time zone">
          <input list="tz-list" value={add} placeholder="Start typing, e.g. Berlin" onChange={(e) => setAdd(e.target.value)} />
          <datalist id="tz-list">{ZONES.map((z) => <option key={z} value={z} />)}</datalist>
        </Field>
        <button className="btn" disabled={!ZONES.includes(add) || zones.includes(add)} onClick={() => { setZones([...zones, add]); setAdd(""); }}>Add</button>
      </Row>
    </>
  );
}
