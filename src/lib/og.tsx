import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

const fontDir = join(process.cwd(), "node_modules/@fontsource/inter/files");
const fonts = Promise.all([
  readFile(join(fontDir, "inter-latin-500-normal.woff")),
  readFile(join(fontDir, "inter-latin-800-normal.woff")),
]);

export const OG_SIZE = { width: 1200, height: 630 };

/** Shared social card: dark panel, glyph texture, braces mark, big title. */
export async function ogCard({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  const glyphs = ".:-=+*<>{}/#";
  const rows = Array.from({ length: 14 }, (_, j) =>
    Array.from({ length: 64 }, (_, i) => {
      const v = (Math.sin(i * 0.35 + j * 0.6) * Math.cos(j * 0.45 - i * 0.12) + 1) / 2;
      return v > 0.55 ? glyphs[Math.floor(v * (glyphs.length - 1))] : " ";
    }).join(""),
  );

  const [medium, extraBold] = await fonts;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0b0b0c", color: "#ededed", padding: 72, position: "relative", fontFamily: "Inter", fontWeight: 500 }}>
        <div style={{ position: "absolute", right: -20, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", fontSize: 26, lineHeight: "40px", color: "rgba(237,237,237,0.13)", fontFamily: "monospace", whiteSpace: "pre" }}>
          {rows.map((r, i) => <div key={i} style={{ display: "flex" }}>{r}</div>)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="64" height="64" viewBox="0 0 32 32">
            <g fill="none" stroke="#ededed" strokeLinecap="round" strokeLinejoin="round">
              <path strokeWidth="2.1" d="M11 5.5c-2.6 0-3.6 1.2-3.6 3.6v3.4c0 1.9-.9 3.1-2.9 3.5 2 .4 2.9 1.6 2.9 3.5v3.4c0 2.4 1 3.6 3.6 3.6M21 5.5c2.6 0 3.6 1.2 3.6 3.6v3.4c0 1.9.9 3.1 2.9 3.5-2 .4-2.9 1.6-2.9 3.5v3.4c0 2.4-1 3.6-3.6 3.6" />
              <circle strokeWidth="1.5" cx="12.6" cy="16" r="1.3" /><circle strokeWidth="1.5" cx="16" cy="16" r="1.3" /><circle strokeWidth="1.5" cx="19.4" cy="16" r="1.3" />
            </g>
          </svg>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 800, letterSpacing: -2 }}>
            <span style={{ color: "rgba(237,237,237,0.55)" }}>dev</span>drawer
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 900 }}>
          <div style={{ display: "flex", fontSize: 26, color: "rgba(237,237,237,0.6)", marginBottom: 14 }}>{eyebrow}</div>
          <div style={{ display: "flex", fontSize: title.length > 26 ? 72 : 92, fontWeight: 800, letterSpacing: -4, lineHeight: 1.02 }}>{title}</div>
          <div style={{ display: "flex", fontSize: 30, color: "rgba(237,237,237,0.65)", marginTop: 22, lineHeight: 1.35 }}>{subtitle}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "rgba(237,237,237,0.55)" }}>
          <span>devdrawer.xyz</span>
          <span>Free · Open source · 100% in your browser</span>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Inter", data: medium, weight: 500, style: "normal" },
        { name: "Inter", data: extraBold, weight: 800, style: "normal" },
      ],
    },
  );
}
