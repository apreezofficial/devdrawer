"use client";

import { faker } from "@faker-js/faker";
import { useCallback, useEffect, useState } from "react";
import { Field, Output, Row } from "@/components/ui";
import { toCsv } from "@/lib/csv";

const FIELDS: Record<string, () => unknown> = {
  id: () => faker.string.uuid(),
  firstName: () => faker.person.firstName(),
  lastName: () => faker.person.lastName(),
  fullName: () => faker.person.fullName(),
  email: () => faker.internet.email(),
  username: () => faker.internet.username(),
  phone: () => faker.phone.number(),
  avatar: () => faker.image.avatar(),
  jobTitle: () => faker.person.jobTitle(),
  company: () => faker.company.name(),
  street: () => faker.location.streetAddress(),
  city: () => faker.location.city(),
  country: () => faker.location.country(),
  zip: () => faker.location.zipCode(),
  latitude: () => faker.location.latitude(),
  longitude: () => faker.location.longitude(),
  birthdate: () => faker.date.birthdate().toISOString().slice(0, 10),
  createdAt: () => faker.date.past().toISOString(),
  url: () => faker.internet.url(),
  ipv4: () => faker.internet.ipv4(),
  color: () => faker.color.rgb(),
  product: () => faker.commerce.productName(),
  price: () => Number(faker.commerce.price()),
  creditCardTest: () => faker.finance.creditCardNumber(),
  iban: () => faker.finance.iban(),
  sentence: () => faker.lorem.sentence(),
  paragraph: () => faker.lorem.paragraph(),
  boolean: () => faker.datatype.boolean(),
  number: () => faker.number.int({ min: 1, max: 1000 }),
};

const DEFAULT = ["id", "fullName", "email", "city", "createdAt"];

export default function FakeData() {
  const [selected, setSelected] = useState<string[]>(DEFAULT);
  const [count, setCount] = useState(10);
  const [format, setFormat] = useState<"json" | "csv" | "sql">("json");
  const [seed, setSeed] = useState("");
  const [out, setOut] = useState("");

  const run = useCallback(() => {
    if (seed) faker.seed(Number(seed) || [...seed].reduce((a, c) => a + c.charCodeAt(0), 0));
    else faker.seed();
    const rows = Array.from({ length: count }, () => Object.fromEntries(selected.map((f) => [f, FIELDS[f]()])));
    if (format === "json") setOut(JSON.stringify(rows, null, 2));
    else if (format === "csv") setOut(toCsv(rows));
    else {
      const cols = selected.join(", ");
      setOut(rows.map((r) => `INSERT INTO users (${cols}) VALUES (${selected.map((f) => (typeof r[f] === "string" ? `'${String(r[f]).replace(/'/g, "''")}'` : String(r[f]))).join(", ")});`).join("\n"));
    }
  }, [selected, count, format, seed]);

  useEffect(run, [run]);

  const toggle = (f: string) => setSelected((s) => (s.includes(f) ? s.filter((x) => x !== f) : [...s, f]));

  return (
    <>
      <div className="field">
        <span className="field-label">Fields</span>
        <div className="chips">
          {Object.keys(FIELDS).map((f) => (
            <button key={f} className={`chip ${selected.includes(f) ? "active" : ""}`} onClick={() => toggle(f)}>{f}</button>
          ))}
        </div>
      </div>
      <Row>
        <Field label="Rows"><input type="number" min={1} max={5000} value={count} onChange={(e) => setCount(Math.max(1, Math.min(5000, +e.target.value || 1)))} /></Field>
        <Field label="Format">
          <select value={format} onChange={(e) => setFormat(e.target.value as typeof format)}>
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="sql">SQL INSERT</option>
          </select>
        </Field>
        <Field label="Seed (optional)" hint="Same seed → same data"><input value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="e.g. 42" /></Field>
        <button className="btn" onClick={run}>Generate</button>
      </Row>
      <Output label="Data" value={out} rows={16} />
    </>
  );
}
