import { ogCard, OG_SIZE } from "@/lib/og";
import { tools } from "@/tools/registry";

export const alt = "devdrawer: every tool a developer ends up Googling";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    eyebrow: `${tools.filter((t) => t.status === "ready").length} free developer tools`,
    title: "Every tool a developer ends up Googling.",
    subtitle: "JSON, regex, UUID, hash, JWT, QR, cron, colors, images and more.",
  });
}
