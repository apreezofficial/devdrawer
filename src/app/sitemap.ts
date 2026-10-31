import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config";
import { tools } from "@/tools/registry";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    ...tools
      .filter((t) => t.status === "ready")
      .map((t) => ({ url: `${SITE_URL}/tools/${t.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
