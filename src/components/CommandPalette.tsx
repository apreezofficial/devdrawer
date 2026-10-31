"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { GITHUB_URL } from "@/config";
import { categories, categoryIcons, getTool, searchTools, tools, type Category } from "@/tools/registry";

const ICONS = categoryIcons;

const RECENT_KEY = "devdrawer:recent";

export function rememberTool(slug: string) {
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]") as string[];
    localStorage.setItem(RECENT_KEY, JSON.stringify([slug, ...list.filter((s) => s !== slug)].slice(0, 5)));
  } catch { /* storage blocked */ }
}

function readRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
}

type Item = {
  id: string;
  label: string;
  icon: string;
  hint?: string;
  keys?: string[];
  run: () => void;
};
type Group = { heading: string; items: Item[] };

export function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState<Category | null>(null);
  const [sel, setSel] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ top: number; height: number } | null>(null);

  const close = () => setOpen(false);
  const go = (href: string) => { close(); router.push(href); };
  const external = (href: string) => { close(); window.open(href, "_blank", "noopener"); };

  const toolItem = (slug: string, hint?: string): Item | null => {
    const t = getTool(slug);
    return t && t.status === "ready" ? { id: `tool:${slug}`, label: t.name, icon: ICONS[t.category], hint: hint ?? t.category, run: () => go(`/tools/${slug}`) } : null;
  };

  const actions: Item[] = [
    { id: "home", label: "Go to all tools", icon: "⌂", run: () => go("/") },
    {
      id: "copy-url", label: "Copy current URL", icon: "⧉", hint: "Clipboard",
      run: async () => { await navigator.clipboard.writeText(location.href); setToast("Link copied"); setTimeout(() => { setToast(""); close(); }, 700); },
    },
    { id: "star", label: "Star on GitHub", icon: "★", hint: "github.com", run: () => external(GITHUB_URL) },
    { id: "request", label: "Request a tool…", icon: "+", hint: "Opens an issue", run: () => external(`${GITHUB_URL}/issues/new?title=Tool+request:+`) },
  ];

  const groups: Group[] = useMemo(() => {
    const q = query.trim();
    if (page) {
      const list = tools.filter((t) => t.category === page && t.status === "ready" && (!q || searchTools(q).includes(t)));
      return [{ heading: page, items: list.map((t) => toolItem(t.slug, "↵")!).filter(Boolean) }];
    }
    if (q) {
      const found = searchTools(q).filter((t) => t.status === "ready").slice(0, 14).map((t) => toolItem(t.slug)!);
      const acts = actions.filter((a) => a.label.toLowerCase().includes(q.toLowerCase()));
      return [{ heading: "Tools", items: found }, { heading: "Actions", items: acts }].filter((g) => g.items.length);
    }
    const rec = recent.map((s) => toolItem(s)).filter((x): x is Item => !!x);
    return [
      ...(rec.length ? [{ heading: "Recent", items: rec }] : []),
      {
        heading: "Browse",
        items: categories.map((c) => ({
          id: `cat:${c}`, label: c, icon: ICONS[c],
          hint: `${tools.filter((t) => t.category === c && t.status === "ready").length} tools →`,
          run: () => { setPage(c); setQuery(""); setSel(0); },
        })),
      },
      { heading: "Actions", items: actions },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, page, recent, pathname]);

  const flat = groups.flatMap((g) => g.items);

  // Global shortcuts: ⌘K / Ctrl+K toggles, "/" opens when not typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
      if (mod && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); }
      else if (e.key === "/" && !typing) { e.preventDefault(); setOpen(true); }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("devdrawer:palette", onOpen);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("devdrawer:palette", onOpen); };
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery(""); setPage(null); setSel(0); setToast("");
    setRecent(readRecent());
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setTimeout(() => inputRef.current?.focus(), 0);
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Slide the highlight to the selected row and keep it in view.
  useLayoutEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${sel}"]`);
    if (!el) return setPill(null);
    setPill({ top: el.offsetTop, height: el.offsetHeight });
    el.scrollIntoView({ block: "nearest" });
  }, [sel, groups, open]);

  if (!open) return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => (s + 1) % Math.max(flat.length, 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => (s - 1 + flat.length) % Math.max(flat.length, 1)); }
    else if (e.key === "Enter") { e.preventDefault(); flat[sel]?.run(); }
    else if (e.key === "Escape") { e.preventDefault(); if (page) { setPage(null); setSel(0); } else close(); }
    else if (e.key === "Backspace" && !query && page) { setPage(null); setSel(0); }
  };

  let index = -1;
  return (
    <div className="km-backdrop" onMouseDown={close}>
      <div className="km" role="dialog" aria-modal="true" aria-label="Command menu" onMouseDown={(e) => e.stopPropagation()} onKeyDown={onKeyDown}>
        <div className="km-crumbs">
          <button className={`km-crumb ${page ? "" : "active"}`} onClick={() => { setPage(null); setSel(0); inputRef.current?.focus(); }}>Home</button>
          {page && <><span className="km-sep">›</span><span className="km-crumb active">{page}</span></>}
        </div>
        <div className="km-search">
          <input
            ref={inputRef}
            placeholder={page ? `Search ${page.toLowerCase()}…` : "What do you need?"}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSel(0); }}
            role="combobox"
            aria-expanded="true"
            aria-controls="km-list"
            aria-activedescendant={flat[sel] ? `km-${flat[sel].id}` : undefined}
          />
          <kbd className="km-kbd" onClick={() => (page ? setPage(null) : close())}>Esc</kbd>
        </div>

        <div className="km-list" id="km-list" role="listbox" ref={listRef}>
          {pill && <div className="km-pill" style={{ transform: `translateY(${pill.top}px)`, height: pill.height }} />}
          {groups.map((g) => (
            <div key={g.heading} className="km-group">
              <div className="km-heading">{g.heading}</div>
              {g.items.map((item) => {
                index++;
                const i = index;
                return (
                  <div
                    key={item.id}
                    id={`km-${item.id}`}
                    role="option"
                    aria-selected={i === sel}
                    data-index={i}
                    className={`km-item ${i === sel ? "selected" : ""}`}
                    onMouseMove={() => sel !== i && setSel(i)}
                    onClick={() => item.run()}
                  >
                    <span className="km-icon">{item.icon}</span>
                    <span className="km-label">{item.label}</span>
                    {item.keys ? (
                      <span className="km-keys">{item.keys.map((k) => <kbd key={k} className="km-kbd">{k}</kbd>)}</span>
                    ) : item.hint && <span className="km-hint">{item.hint}</span>}
                  </div>
                );
              })}
            </div>
          ))}
          {!flat.length && (
            <div className="km-empty">
              No tools match “{query}”.
              <button className="btn btn-ghost" onClick={() => external(`${GITHUB_URL}/issues/new?title=${encodeURIComponent(`Tool request: ${query}`)}`)}>Request it →</button>
            </div>
          )}
        </div>

        <div className="km-footer">
          {toast ? <span className="ok">✓ {toast}</span> : (
            <>
              <span><kbd className="km-kbd">↑</kbd><kbd className="km-kbd">↓</kbd> navigate</span>
              <span><kbd className="km-kbd">↵</kbd> open</span>
              {page && <span><kbd className="km-kbd">⌫</kbd> back</span>}
              <span className="km-spacer" />
              <span className="km-brand">devdrawer</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function PaletteButton() {
  return (
    <button className="kbd-btn" onClick={() => window.dispatchEvent(new Event("devdrawer:palette"))}>
      <span className="lbl">Search tools</span><kbd>⌘K</kbd>
    </button>
  );
}
