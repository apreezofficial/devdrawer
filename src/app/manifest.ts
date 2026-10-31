import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME}: every tool a developer ends up Googling`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#171717",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
