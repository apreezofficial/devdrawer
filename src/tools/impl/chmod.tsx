"use client";

import { useToolInput } from "@/components/useToolInput";
import { useState } from "react";

import { CopyButton, Field } from "@/components/ui";

const WHO = ["Owner", "Group", "Public"];
const PERMS: [string, number][] = [["Read", 4], ["Write", 2], ["Execute", 1]];

export default function Chmod() {
  const [octal, setOctal] = useState("755");
  useToolInput("chmod", (settings) => {
    if (settings.octal !== undefined) setOctal(settings.octal as typeof octal);
  });
  const digits = (/^[0-7]{3}$/.test(octal.slice(-3)) ? octal.slice(-3) : "000").split("").map(Number);
  const symbolic = digits.map((d) => (d & 4 ? "r" : "-") + (d & 2 ? "w" : "-") + (d & 1 ? "x" : "-")).join("");

  const toggle = (who: number, bit: number) => {
    const next = [...digits];
    next[who] ^= bit;
    setOctal(next.join(""));
  };

  return (
    <>
      <Field label="Octal"><input className="mono" value={octal} maxLength={4} onChange={(e) => setOctal(e.target.value.replace(/[^0-7]/g, ""))} /></Field>
      <table>
        <thead><tr><th></th>{WHO.map((w) => <th key={w}>{w}</th>)}</tr></thead>
        <tbody>
          {PERMS.map(([name, bit]) => (
            <tr key={name}>
              <td>{name}</td>
              {WHO.map((w, i) => (
                <td key={w}><input type="checkbox" checked={!!(digits[i] & bit)} onChange={() => toggle(i, bit)} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="list">
        <div className="list-item"><span>-{symbolic}</span><CopyButton value={symbolic} /></div>
        <div className="list-item"><span>chmod {digits.join("")} file</span><CopyButton value={`chmod ${digits.join("")} `} /></div>
      </div>
    </>
  );
}
