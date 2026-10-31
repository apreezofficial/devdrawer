"use client";

import { useState } from "react";
import { ErrorText, Field, Output, Row, useSeed } from "@/components/ui";

const pascal = (s: string) => s.replace(/(^|[^A-Za-z0-9]+)([A-Za-z0-9])/g, (_, __, c: string) => c.toUpperCase()).replace(/^[^A-Za-z_]/, "_$&") || "Item";
const singular = (s: string) => (s.endsWith("ies") ? s.slice(0, -3) + "y" : s.endsWith("s") && s.length > 1 ? s.slice(0, -1) : s + "Item");
const safeKey = (k: string) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k));

function generate(root: unknown, rootName: string, useType: boolean, optionalNull: boolean) {
  const decls: string[] = [];
  const used = new Map<string, string>();

  const uniqueName = (base: string, shape: string) => {
    let name = base, n = 2;
    while (used.has(name) && used.get(name) !== shape) name = `${base}${n++}`;
    used.set(name, shape);
    return name;
  };

  const typeOf = (v: unknown, name: string): string => {
    if (v === null) return "unknown";
    if (Array.isArray(v)) {
      if (!v.length) return "unknown[]";
      const objs = v.filter((x) => x && typeof x === "object" && !Array.isArray(x)) as Record<string, unknown>[];
      if (objs.length === v.length) {
        // Merge all object shapes so optional keys are detected.
        const merged: Record<string, unknown> = {};
        const counts: Record<string, number> = {};
        for (const o of objs) for (const [k, val] of Object.entries(o)) { counts[k] = (counts[k] ?? 0) + 1; if (merged[k] == null) merged[k] = val; }
        const t = objectType(merged, singular(name), (k) => counts[k] < objs.length);
        return `${t}[]`;
      }
      const types = [...new Set(v.map((x) => typeOf(x, singular(name))))];
      return types.length === 1 ? `${types[0]}[]` : `(${types.join(" | ")})[]`;
    }
    if (typeof v === "object") return objectType(v as Record<string, unknown>, name, () => false);
    return typeof v;
  };

  const objectType = (o: Record<string, unknown>, name: string, isOptional: (k: string) => boolean) => {
    const fields = Object.entries(o).map(([k, v]) => {
      const opt = isOptional(k) || (optionalNull && v === null);
      return `  ${safeKey(k)}${opt ? "?" : ""}: ${typeOf(v, pascal(k))};`;
    });
    const body = `{\n${fields.join("\n")}\n}`;
    const typeName = uniqueName(pascal(name), body);
    if (!decls.some((d) => d.includes(` ${typeName} `)))
      decls.push(useType ? `export type ${typeName} = ${body};` : `export interface ${typeName} ${body}`);
    return typeName;
  };

  const top = typeOf(root, rootName);
  if (!(root && typeof root === "object" && !Array.isArray(root))) decls.push(`export type ${pascal(rootName)} = ${top};`);
  return decls.join("\n\n");
}

export default function JsonToTs() {
  const [input, setInput] = useSeed('{\n  "id": 1,\n  "name": "Ada",\n  "email": null,\n  "tags": ["admin", "dev"],\n  "address": { "city": "London", "zip": "N1" },\n  "posts": [{ "id": 1, "title": "Hi" }, { "id": 2, "title": "Yo", "draft": true }]\n}');
  const [name, setName] = useState("User");
  const [useType, setUseType] = useState(false);
  const [optNull, setOptNull] = useState(true);

  let out = "", error = "";
  try { out = generate(JSON.parse(input), name || "Root", useType, optNull); }
  catch (e) { error = input.trim() ? (e as Error).message : ""; }

  return (
    <>
      <Field label="JSON"><textarea rows={12} value={input} onChange={(e) => setInput(e.target.value)} /></Field>
      <Row>
        <Field label="Root name"><input value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <label className="check"><input type="checkbox" checked={useType} onChange={(e) => setUseType(e.target.checked)} /> Use type aliases</label>
        <label className="check"><input type="checkbox" checked={optNull} onChange={(e) => setOptNull(e.target.checked)} /> null → optional</label>
      </Row>
      <ErrorText>{error}</ErrorText>
      {!error && <Output label="TypeScript" value={out} rows={16} />}
    </>
  );
}
