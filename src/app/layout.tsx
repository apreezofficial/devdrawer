import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import { CommandPalette } from "@/components/CommandPalette";
import { HelpWidget } from "@/components/HelpWidget";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WinnerCelebration } from "@/components/WinnerCelebration";
import { AUTHOR_X_HANDLE, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} · ${SITE_TAGLINE}`, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "developer tools", "online dev tools", "json formatter", "regex tester", "uuid generator", "hash generator",
    "jwt decoder", "base64 encode decode", "qr code generator", "cron expression", "color picker", "image compressor",
    "fake data generator", "free developer utilities", "privacy friendly tools",
  ],
  authors: [{ name: "ap", url: "https://x.com/apcodesphere" }],
  creator: "ap",
  verification: { google: "6oOtFBAfrY_VNePuX9khruR2TSwXjHBwuLeEMPBLvW8" },
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: SITE_URL, siteName: SITE_NAME, title: `${SITE_NAME} · ${SITE_TAGLINE}`, description: SITE_DESCRIPTION, locale: "en_US" },
  twitter: { card: "summary_large_image", creator: AUTHOR_X_HANDLE, site: AUTHOR_X_HANDLE, title: `${SITE_NAME} · ${SITE_TAGLINE}`, description: SITE_DESCRIPTION },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  category: "technology",
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0c" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WinnerCelebration />
        <SiteHeader />
        <main className="container">{children}</main>
        <SiteFooter />
        <CommandPalette />
        <HelpWidget />
      </body>
    </html>
  );
}
