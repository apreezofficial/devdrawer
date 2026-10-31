"use client";

import { useToolInput } from "@/components/useToolInput";
import { useState } from "react";
import { format, type SqlLanguage } from "sql-formatter";
import { ErrorText, Field, Output, Row } from "@/components/ui";

const DIALECTS: [SqlLanguage, string][] = [
  ["sql", "Standard SQL"], ["postgresql", "PostgreSQL"], ["mysql", "MySQL"], ["mariadb", "MariaDB"],
  ["sqlite", "SQLite"], ["tsql", "SQL Server"], ["bigquery", "BigQuery"], ["snowflake", "Snowflake"],
];

export default function SqlFormatter() {
  const [sql, setSql] = useState("select u.id, u.name, count(o.id) as orders from users u left join orders o on o.user_id = u.id where u.active = 1 group by u.id, u.name order by orders desc limit 10;");
  const [lang, setLang] = useState<SqlLanguage>("sql");
  const [kwCase, setKwCase] = useState<"upper" | "lower" | "preserve">("upper");
  const [tab, setTab] = useState(2);
  useToolInput("sql-formatter", (settings) => {
    if (settings.sql !== undefined) setSql(settings.sql as typeof sql);
    if (settings.lang !== undefined) setLang(settings.lang as typeof lang);
    if (settings.kwCase !== undefined) setKwCase(settings.kwCase as typeof kwCase);
    if (settings.tab !== undefined) setTab(settings.tab as typeof tab);
  });

  let out = "", error = "";
  try {
    out = format(sql, { language: lang, keywordCase: kwCase, tabWidth: tab });
  } catch (e) {
    error = sql.trim() ? (e as Error).message : "";
  }

  return (
    <>
      <Field label="SQL"><textarea rows={8} value={sql} onChange={(e) => setSql(e.target.value)} /></Field>
      <Row>
        <Field label="Dialect"><select value={lang} onChange={(e) => setLang(e.target.value as SqlLanguage)}>{DIALECTS.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></Field>
        <Field label="Keywords"><select value={kwCase} onChange={(e) => setKwCase(e.target.value as typeof kwCase)}><option value="upper">UPPERCASE</option><option value="lower">lowercase</option><option value="preserve">Keep as is</option></select></Field>
        <Field label="Indent"><select value={tab} onChange={(e) => setTab(+e.target.value)}><option value={2}>2 spaces</option><option value={4}>4 spaces</option></select></Field>
      </Row>
      <ErrorText>{error}</ErrorText>
      {!error && <Output label="Formatted" value={out} rows={14} />}
    </>
  );
}
