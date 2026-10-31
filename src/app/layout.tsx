import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import { CommandPalette } from "@/components/CommandPalette";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "devdrawer — every tool a developer searches for",
  description: "Hash, UUID, color, fake data, regex, image and dozens more developer tools. Free, open source, 100% in your browser.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main className="container">{children}</main>
        <SiteFooter />
        <CommandPalette />
      </body>
    </html>
  );
}
