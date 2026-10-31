import type { Metadata } from "next";
import Link from "next/link";
import { CommandPalette, PaletteButton } from "@/components/CommandPalette";
import { GITHUB_URL } from "@/config";
import "./globals.css";

export const metadata: Metadata = {
  title: "AllDevNeedy — every tool a developer searches for",
  description: "Hash, UUID, color, fake data, regex, image and dozens more developer tools. Free, open source, 100% in your browser.",
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="container header-inner">
            <Link href="/" className="logo">all<span>dev</span>needy</Link>
            <span className="badge">v0.1</span>
            <div className="spacer" />
            <PaletteButton />
            <a className="btn btn-ghost" href={GITHUB_URL} target="_blank" rel="noreferrer">★ GitHub</a>
          </div>
        </header>
        <main className="container">{children}</main>
        <footer className="footer">
          <div className="container row-between">
            <span>Open source · Everything runs in your browser · No data leaves your device</span>
            <a href={`${GITHUB_URL}/issues/new?title=Tool+request:+`} target="_blank" rel="noreferrer">Request a tool →</a>
          </div>
        </footer>
        <CommandPalette />
      </body>
    </html>
  );
}
