"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GITHUB_URL } from "@/config";
import { categories, categoryIcons, categoryId, tools } from "@/tools/registry";
import { prefersReducedMotion } from "./canvas";
import { LogoMark, Wordmark } from "./Logo";

/** Placeholder that types tool names in and out, like a live search hint. */
function TypedHint() {
  const [hint, setHint] = useState("");
  useEffect(() => {
    if (prefersReducedMotion()) return setHint("uuid");
    const words = ["uuid", "jwt", "qr code", "base64", "regex", "cron", "hash", "favicon", "json → ts"];
    let w = 0, i = 0, deleting = false, timer = 0;
    const step = () => {
      const word = words[w];
      i += deleting ? -1 : 1;
      setHint(word.slice(0, i));
      let delay = deleting ? 45 : 90;
      if (!deleting && i === word.length) { deleting = true; delay = 1400; }
      else if (deleting && i === 0) { deleting = false; w = (w + 1) % words.length; delay = 300; }
      timer = window.setTimeout(step, delay);
    };
    timer = window.setTimeout(step, 600);
    return () => clearTimeout(timer);
  }, []);
  return <span className="typed">Search <b>{hint}</b><i className="caret" /></span>;
}

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenu(false), [pathname]);

  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => { if (!menuRef.current?.contains(e.target as Node)) setMenu(false); };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [menu]);

  const hover = (e: React.MouseEvent<HTMLElement>) => {
    const box = linksRef.current!.getBoundingClientRect();
    const r = e.currentTarget.getBoundingClientRect();
    setPill({ left: r.left - box.left, width: r.width });
  };

  const ready = tools.filter((t) => t.status === "ready");

  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <div className="header-inner">
        <Link href="/" className="logo" aria-label="devdrawer home">
          <LogoMark />
          <Wordmark />
        </Link>

        <nav className="nav-links" ref={linksRef} onMouseLeave={() => !menu && setPill(null)}>
          {pill && <span className="nav-pill" style={{ transform: `translateX(${pill.left}px)`, width: pill.width }} />}
          <Link href="/#tools" onMouseEnter={hover}>Tools <span className="nav-count">{ready.length}</span></Link>
          <div className="nav-menu" ref={menuRef}>
            <button onMouseEnter={hover} onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-haspopup="true">
              Categories <span className={`chev ${menu ? "open" : ""}`}>⌄</span>
            </button>
            {menu && (
              <div className="mega" role="menu">
                {categories.map((c) => (
                  <Link key={c} href={`/#${categoryId(c)}`} className="mega-item" role="menuitem" onClick={() => setMenu(false)}>
                    <span className="km-icon">{categoryIcons[c]}</span>
                    <span>{c}</span>
                    <span className="mega-count">{ready.filter((t) => t.category === c).length}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <a href={`${GITHUB_URL}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer" onMouseEnter={hover}>Contribute</a>
        </nav>

        <div className="spacer" />

        <button className="search-pill" onClick={() => window.dispatchEvent(new Event("devdrawer:palette"))} aria-label="Search tools">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <TypedHint />
          <kbd>⌘K</kbd>
        </button>
        <a className="btn nav-gh" href={GITHUB_URL} target="_blank" rel="noreferrer"><GithubIcon /><span className="lbl">Star</span></a>
      </div>
    </header>
  );
}
