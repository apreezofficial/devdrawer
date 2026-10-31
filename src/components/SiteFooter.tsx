import Link from "next/link";
import { GITHUB_URL, SITE_NAME } from "@/config";
import { tools } from "@/tools/registry";
import { GlyphWordmark } from "./GlyphWordmark";

/** The CTA flows straight into the footer on one dark slab, topped by the interactive wordmark. */
export function SiteFooter() {
  return (
    <footer className="slab">
      <div className="slab-inner">
        <div className="slab-cta">
          <span className="slab-eyebrow">Open source · MIT · {tools.length} tools</span>
          <h2>Missing a tool?<br />Ship it in five minutes.</h2>
          <p>One file, one registry line, and your tool reaches every developer who lands here. Nothing ever leaves the browser.</p>
          <div className="cta-row">
            <a className="btn btn-lg slab-btn" href={`${GITHUB_URL}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer">Contribute a tool</a>
            <a className="btn btn-lg btn-ghost slab-ghost" href={GITHUB_URL} target="_blank" rel="noreferrer">★ Star on GitHub</a>
          </div>
        </div>

        <GlyphWordmark text={SITE_NAME} />

        <div className="slab-bottom">
          <Link href="/" className="logo"><span className="logo-mark slab-mark">{"{}"}</span>{SITE_NAME}</Link>
          <nav>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
            <a href={`${GITHUB_URL}/issues/new?title=Tool+request:+`} target="_blank" rel="noreferrer">Request a tool</a>
            <a href={`${GITHUB_URL}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer">Contributing</a>
          </nav>
          <span className="slab-note">Runs entirely in your browser</span>
        </div>
      </div>
    </footer>
  );
}
