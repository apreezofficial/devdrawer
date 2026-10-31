"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { detect } from "@/tools/detect";
import { categories, searchTools, type ToolMeta } from "@/tools/registry";

export function Home() {
  const router = useRouter();
  const [paste, setPaste] = useState("");
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  const detections = useMemo(() => detect(paste), [paste]);
  const visible = useMemo(() => searchTools(query).filter((t) => !cat || t.category === cat), [query, cat]);
  const ready = searchTools("").filter((t) => t.status === "ready").length;

  const open = (slug: string) => {
    // Hand the input over via sessionStorage, never the URL, so tokens stay out of history.
    try { sessionStorage.setItem("adn:seed", paste.trim()); } catch { /* storage blocked */ }
    router.push(`/tools/${slug}`);
  };

  return (
    <>
      <section className="hero">
        <h1>Every tool a developer<br />ends up Googling.</h1>
        <p>{ready} tools ready and growing. Hashes, UUIDs, colors, fake data, regex, images and more. Open source, and nothing ever leaves your browser.</p>
        <div className="smart">
          <textarea
            placeholder="Smart paste: drop anything here (a JWT, hex color, timestamp, JSON, base64…) and we'll pick the tool."
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
          />
          {detections.length > 0 && (
            <div className="chips">
              {detections.map((d, i) => (
                <button key={d.slug + i} className={`chip ${i === 0 ? "chip-strong" : ""}`} onClick={() => open(d.slug)}>
                  {d.label} →
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="filters">
        <input type="search" placeholder="Filter tools…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="chips">
        <button className={`chip ${!cat ? "active" : ""}`} onClick={() => setCat(null)}>All</button>
        {categories.map((c) => (
          <button key={c} className={`chip ${cat === c ? "active" : ""}`} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      {query ? (
        <Grid tools={visible} />
      ) : (
        categories
          .filter((c) => !cat || c === cat)
          .map((c) => (
            <section key={c}>
              <h2 className="section-title">{c}</h2>
              <Grid tools={visible.filter((t) => t.category === c)} />
            </section>
          ))
      )}
      {!visible.length && <p className="field-hint">No match. Request it on GitHub and someone might build it this week.</p>}
      <div style={{ height: 48 }} />
    </>
  );
}

function Grid({ tools }: { tools: ToolMeta[] }) {
  return (
    <div className="grid">
      {tools.map((t) =>
        t.status === "ready" ? (
          <Link key={t.slug} href={`/tools/${t.slug}`} className="card">
            <h3>{t.name}</h3>
            <p>{t.description}</p>
          </Link>
        ) : (
          <div key={t.slug} className="card soon" title="Coming soon. Contributions welcome!">
            <span className="soon-tag">Soon</span>
            <h3>{t.name}</h3>
            <p>{t.description}</p>
          </div>
        ),
      )}
    </div>
  );
}
