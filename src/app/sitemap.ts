import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config";
import { tools } from "@/tools/registry";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...tools
      .filter((t) => t.status === "ready")
      .map((t) => ({ url: `${SITE_URL}/tools/${t.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
