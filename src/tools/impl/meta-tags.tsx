"use client";

import { useState } from "react";
import { Field, Output, Row } from "@/components/ui";

const attr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

export default function MetaTags() {
  const [m, setM] = useState({
    title: "AllDevNeedy: every tool a developer ends up Googling",
    description: "Hashes, UUIDs, colors, fake data, regex and more. Free, open source and 100% in your browser.",
    url: "https://alldevneedy.dev",
    image: "https://alldevneedy.dev/og.png",
    site: "AllDevNeedy",
    twitter: "",
    theme: "#171717",
  });
  const set = (k: keyof typeof m) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setM({ ...m, [k]: e.target.value });

  const tags = [
    `<title>${attr(m.title)}</title>`,
    `<meta name="description" content="${attr(m.description)}" />`,
    m.url ? `<link rel="canonical" href="${attr(m.url)}" />` : null,
    `<meta name="theme-color" content="${attr(m.theme)}" />`,
    "",
    "<!-- Open Graph -->",
    `<meta property="og:type" content="website" />`,
    m.site ? `<meta property="og:site_name" content="${attr(m.site)}" />` : null,
    `<meta property="og:title" content="${attr(m.title)}" />`,
    `<meta property="og:description" content="${attr(m.description)}" />`,
    m.url ? `<meta property="og:url" content="${attr(m.url)}" />` : null,
    m.image ? `<meta property="og:image" content="${attr(m.image)}" />` : null,
    "",
    "<!-- Twitter / X -->",
    `<meta name="twitter:card" content="${m.image ? "summary_large_image" : "summary"}" />`,
    m.twitter ? `<meta name="twitter:site" content="${attr(m.twitter.startsWith("@") ? m.twitter : "@" + m.twitter)}" />` : null,
    `<meta name="twitter:title" content="${attr(m.title)}" />`,
    `<meta name="twitter:description" content="${attr(m.description)}" />`,
    m.image ? `<meta name="twitter:image" content="${attr(m.image)}" />` : null,
  ].filter((x) => x !== null).join("\n");

  let host = "";
  try { host = new URL(m.url).host; } catch { host = m.url; }

  return (
    <>
      <Field label={`Title · ${m.title.length}/60`} hint={m.title.length > 60 ? "Google usually cuts titles around 60 characters." : undefined}><input value={m.title} onChange={set("title")} /></Field>
      <Field label={`Description · ${m.description.length}/160`} hint={m.description.length > 160 ? "Descriptions over ~160 characters get truncated." : undefined}><textarea rows={3} value={m.description} onChange={set("description")} style={{ fontFamily: "inherit", fontSize: 15 }} /></Field>
      <Row>
        <Field label="Page URL"><input value={m.url} onChange={set("url")} /></Field>
        <Field label="Share image URL (1200×630)"><input value={m.image} onChange={set("image")} /></Field>
      </Row>
      <Row>
        <Field label="Site name"><input value={m.site} onChange={set("site")} /></Field>
        <Field label="X / Twitter handle"><input value={m.twitter} placeholder="@yourhandle" onChange={set("twitter")} /></Field>
        <Field label="Theme color"><input type="color" value={m.theme} onChange={set("theme")} style={{ height: 40, padding: 2 }} /></Field>
      </Row>

      <div className="row" style={{ alignItems: "flex-start" }}>
        <div className="field">
          <span className="field-label">Google preview</span>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 16 }}>
            <div className="field-hint">{host}</div>
            <div style={{ color: "#1a0dab", fontSize: 19, margin: "2px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</div>
            <div className="field-hint" style={{ fontSize: 13.5 }}>{m.description.slice(0, 160)}{m.description.length > 160 ? "…" : ""}</div>
          </div>
        </div>
        <div className="field">
          <span className="field-label">Social card preview</span>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ aspectRatio: "1.91", background: m.image ? `center/cover url("${encodeURI(m.image)}"), var(--faint)` : "var(--faint)" }} />
            <div style={{ padding: 12 }}>
              <div className="field-hint">{host}</div>
              <div style={{ fontWeight: 650 }}>{m.title}</div>
            </div>
          </div>
        </div>
      </div>
      <Output label="Paste into <head>" value={tags} rows={16} />
    </>
  );
}
