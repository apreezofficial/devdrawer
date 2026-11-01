import { AUTHOR_SITE_URL, AUTHOR_X_URL, GITHUB_URL, SITE_NAME } from "@/config";
import { tools } from "@/tools/registry";
import { GlyphWordmark } from "./GlyphWordmark";
import { Signature } from "./Signature";

/**
 * The CTA flows into the footer on one always-dark slab. The giant wordmark peeks up
 * from behind the bottom row, which holds the signature and an X link.
 */
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

        <div className="slab-mark">
          <GlyphWordmark text={SITE_NAME} />
        </div>

        <div className="slab-bottom">
          <a href={AUTHOR_SITE_URL} target="_blank" rel="noreferrer" aria-label="ap's portfolio">
            <Signature />
          </a>
          <a href={AUTHOR_X_URL} target="_blank" rel="noreferrer" aria-label="ap on X" className="slab-x">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
