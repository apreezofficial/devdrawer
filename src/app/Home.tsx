"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { GlyphField } from "@/components/GlyphField";
import { handoffToolInput } from "@/components/useToolInput";
import { encodeToolInput } from "@/lib/tool-input";
import { GITHUB_URL } from "@/config";
import { detect } from "@/tools/detect";
import { categoryTint, previews } from "@/tools/previews";
import { categories, categoryId, searchTools, tools, type ToolMeta } from "@/tools/registry";

const SUBTITLES: Record<string, string> = {
  Text: "Count it, case it, diff it, clean it.",
  Generators: "IDs, passwords and realistic fake data on demand.",
  "Crypto & Security": "Hashes, signatures and tokens, decoded locally.",
  Encoding: "Base64, URLs, entities and number bases.",
  "Data & Code": "Format, convert and test what you ship.",
  "Color & Design": "Pick, check and extract colors.",
  Image: "Compress and crop without uploading anything.",
  "Video & Audio": "Trim clips and make GIFs, no upload.",
  "Time & Date": "Timestamps, zones and schedules.",
  "Web & Network": "Status codes, user agents and permissions.",
  "Math & Units": "Quick conversions and calculations.",
};

/** Hero fan: five tilted tool cards. */
const FAN: { slug: string; label: string; big: string; bg: string; fg: string }[] = [
  { slug: "json-formatter", label: "JSON", big: '{\n "ok": true\n}', bg: "#0f1115", fg: "#a5f3c0" },
  { slug: "color-picker", label: "Color", big: "#6366F1", bg: "linear-gradient(160deg,#818cf8,#6366f1 55%,#4338ca)", fg: "#fff" },
  { slug: "uuid", label: "UUID v7", big: "0192e4c1-7b3a", bg: "#f6f6f6", fg: "#171717" },
  { slug: "hash", label: "SHA-256", big: "9f86d081 884c7d65", bg: "#171717", fg: "#f5f5f5" },
  { slug: "password", label: "Password", big: "x7#Kq!9vL$", bg: "linear-gradient(160deg,#fde68a,#fb923c)", fg: "#3d2606" },
];
const FAN_POS = [
  { x: -340, y: 34, r: -14 },
  { x: -170, y: 8, r: -7 },
  { x: 0, y: 0, r: 0 },
  { x: 170, y: 8, r: 7 },
  { x: 340, y: 34, r: 14 },
];

export function Home() {
  const router = useRouter();
  const [paste, setPaste] = useState("");
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [hover, setHover] = useState<number | null>(null);

  const detections = useMemo(() => detect(paste), [paste]);
  const visible = useMemo(() => searchTools(query).filter((t) => !cat || t.category === cat), [query, cat]);
  const ready = tools.filter((t) => t.status === "ready").length;

  const open = (slug: string) => {
    // Hand the input over via sessionStorage, never the URL, so tokens stay out of history.
    const input = slug === "base64" ? encodeToolInput(slug, { input: paste.trim(), mode: "decode" }) : paste.trim();
    handoffToolInput(slug, input);
    router.push(`/tools/${slug}`);
  };

  return (
    <>
      <div className="hero-wrap">
        <GlyphField />
      <section className="hero">
        <div className="eyebrow"><span className="eyebrow-dot" />{ready} tools live{tools.length > ready ? ` · ${tools.length - ready} in the works` : " · all free"}</div>
        <h1>Every tool a developer<br /><span className="dim">ends up Googling.</span></h1>
        <p className="lead">Hashes, UUIDs, colors, fake data, regex, images and more. Open source, and everything runs in your browser.</p>

        <div className="fan" onMouseLeave={() => setHover(null)}>
          {FAN.map((c, i) => {
            const p = FAN_POS[i];
            const lift = hover === i ? -18 : 0;
            const spread = hover == null ? 0 : (i - hover) * 14;
            return (
              <Link
                key={c.slug}
                href={`/tools/${c.slug}`}
                className="fan-card"
                onMouseEnter={() => setHover(i)}
                style={{
                  background: c.bg, color: c.fg, zIndex: hover === i ? 10 : 5 - Math.abs(i - 2),
                  transform: `translate(${p.x + spread}px, ${p.y + lift}px) rotate(${hover === i ? 0 : p.r}deg)`,
                }}
              >
                <span className="fc-label">{c.label}</span>
                <span className="fc-big" style={{ whiteSpace: "pre-wrap" }}>{c.big}</span>
                <span className="fc-foot"><span>devdrawer</span><span className="fc-pill">Open →</span></span>
              </Link>
            );
          })}
        </div>

        <div className="cta-row">
          <a className="btn btn-lg" href="#tools">Explore tools</a>
          <a className="btn btn-lg btn-text" href={GITHUB_URL} target="_blank" rel="noreferrer">Star on GitHub</a>
        </div>

        <div className="smart">
          <textarea
            placeholder="Smart paste: drop a JWT, hex color, timestamp, JSON or base64 and we'll pick the tool."
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            rows={2}
          />
          {detections.length > 0 ? (
            <div className="chips">
              {detections.map((d, i) => (
                <button key={d.slug + i} className={`chip ${i === 0 ? "chip-strong" : ""}`} onClick={() => open(d.slug)}>
                  {d.label} →
                </button>
              ))}
            </div>
          ) : (
            <div className="smart-hint"><span>Detected tools show up here</span><span>Press <kbd>⌘K</kbd> to search</span></div>
          )}
        </div>
      </section>
      </div>

      <div className="toolbar" id="tools">
        <input type="search" placeholder="Filter tools…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="chips">
          <button className={`chip ${!cat ? "active" : ""}`} onClick={() => setCat(null)}>All</button>
          {categories.map((c) => (
            <button key={c} className={`chip ${cat === c ? "active" : ""}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
      </div>

      {query ? (
        <section className="section"><Grid tools={visible} /></section>
      ) : (
        categories
          .filter((c) => !cat || c === cat)
          .map((c) => (
            <section key={c} id={categoryId(c)} className="section">
              <div className="section-head">
                <h2>{c}</h2>
                <p>{SUBTITLES[c]}</p>
              </div>
              <Grid tools={visible.filter((t) => t.category === c)} />
            </section>
          ))
      )}
      {!visible.length && <p className="field-hint" style={{ textAlign: "center", marginTop: 32 }}>No match. Request it on GitHub and someone might build it this week.</p>}
      <div style={{ height: 96 }} />

    </>
  );
}

function Card({ t }: { t: ToolMeta }) {
  const [bg, fg] = categoryTint[t.category];
  const inner = (
    <>
      {t.status === "soon" && <span className="soon-tag">Soon</span>}
      <div className="card-preview" style={{ background: bg, color: fg }}>
        <span>{previews[t.slug] ?? t.name}</span>
      </div>
      <div className="card-body">
        <h3>{t.name}</h3>
        <p>{t.description}</p>
        <div className="card-meta">
          <span className="mini">{"{}"}</span>
          <span>{t.status === "ready" ? "Free" : "Help wanted"}</span>
          <span className="dot" />
          <span>{t.category}</span>
        </div>
      </div>
    </>
  );
  return t.status === "ready" ? (
    <Link href={`/tools/${t.slug}`} className="card">{inner}</Link>
  ) : (
    <div className="card soon" title="Coming soon. Contributions welcome!">{inner}</div>
  );
}

function Grid({ tools }: { tools: ToolMeta[] }) {
  return <div className="grid">{tools.map((t) => <Card key={t.slug} t={t} />)}</div>;
}
