"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { searchTools } from "@/tools/registry";

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchTools(query).filter((t) => t.status === "ready").slice(0, 12), [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("adn:palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("adn:palette", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSel(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  if (!open) return null;

  const go = (slug: string) => {
    setOpen(false);
    router.push(`/tools/${slug}`);
  };

  return (
    <div className="palette-backdrop" onClick={() => setOpen(false)}>
      <div className="palette" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          placeholder="Search tools… (uuid, hash, base64, color)"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSel(0); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
            if (e.key === "Enter" && results[sel]) go(results[sel].slug);
          }}
        />
        <ul>
          {results.map((t, i) => (
            <li key={t.slug} className={i === sel ? "sel" : ""} onMouseEnter={() => setSel(i)} onClick={() => go(t.slug)}>
              <span>{t.name}</span>
              <small>{t.category}</small>
            </li>
          ))}
          {!results.length && <li><small>No tools match. Request one on GitHub.</small></li>}
        </ul>
      </div>
    </div>
  );
}

export function PaletteButton() {
  return (
    <button className="kbd-btn" onClick={() => window.dispatchEvent(new Event("adn:palette"))}>
      <span className="lbl">Search tools</span><kbd>⌘K</kbd>
    </button>
  );
}
