import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/config";
import { tools } from "@/tools/registry";
import { Home } from "./Home";

export default function Page() {
  const ready = tools.filter((t) => t.status === "ready");
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME, url: SITE_URL, description: SITE_DESCRIPTION },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Developer tools",
      numberOfItems: ready.length,
      itemListElement: ready.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, url: `${SITE_URL}/tools/${t.slug}` })),
    },
  ];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Home />
    </>
  );
}
