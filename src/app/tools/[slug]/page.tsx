import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE_NAME, SITE_URL } from "@/config";
import { ToolView } from "@/tools/loader";
import { categoryId, getTool, tools } from "@/tools/registry";

export function generateStaticParams() {
  return tools.filter((t) => t.status === "ready").map((t) => ({ slug: t.slug }));
}

export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

const describe = (name: string, description: string) =>
  `${description} Free online ${name.toLowerCase()}: no sign-up, no uploads, runs 100% in your browser.`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = getTool((await params).slug);
  if (!tool) return {};
  const title = `${tool.name}: Free Online Tool`;
  const description = describe(tool.name, tool.description);
  const url = `/tools/${tool.slug}`;
  return {
    title,
    description,
    keywords: [tool.name.toLowerCase(), ...tool.keywords, `${tool.name.toLowerCase()} online`, "free", tool.category.toLowerCase()],
    alternates: { canonical: url },
    openGraph: { type: "website", url, title: `${tool.name} · ${SITE_NAME}`, description, siteName: SITE_NAME },
    twitter: { card: "summary_large_image", title: `${tool.name} · ${SITE_NAME}`, description },
  };
}

export default async function ToolPage({ params }: Props) {
  const tool = getTool((await params).slug);
  if (!tool || tool.status !== "ready") notFound();

  const related = tools.filter((t) => t.category === tool.category && t.slug !== tool.slug && t.status === "ready").slice(0, 6);
  const url = `${SITE_URL}/tools/${tool.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: tool.name,
      url,
      description: describe(tool.name, tool.description),
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any (runs in the browser)",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "All tools", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: tool.category, item: `${SITE_URL}/#${categoryId(tool.category)}` },
        { "@type": "ListItem", position: 3, name: tool.name, item: url },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="tool-head">
        <nav className="crumb" aria-label="Breadcrumb"><Link href="/">All tools</Link> / <Link href={`/#${categoryId(tool.category)}`}>{tool.category}</Link></nav>
        <h1>{tool.name}</h1>
        <p>{tool.description}</p>
      </div>
      <div className="panel">
        <ToolView slug={tool.slug} />
      </div>

      <section className="tool-about">
        <div>
          <h2>About the {tool.name}</h2>
          <p>
            {tool.description} It&apos;s part of {SITE_NAME}, a free collection of {tools.filter((t) => t.status === "ready").length} developer
            tools. Everything runs locally in your browser, so what you paste or upload never leaves your device. There&apos;s nothing to
            install and no account to create.
          </p>
          {tool.keywords.length > 0 && (
            <p className="tool-tags">
              {tool.keywords.map((k) => <span key={k}>{k}</span>)}
            </p>
          )}
        </div>
        {related.length > 0 && (
          <div>
            <h2>Related {tool.category.toLowerCase()} tools</h2>
            <ul className="tool-related">
              {related.map((t) => (
                <li key={t.slug}><Link href={`/tools/${t.slug}`}><strong>{t.name}</strong><span>{t.description}</span></Link></li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </>
  );
}
