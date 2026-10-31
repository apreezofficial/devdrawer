import { ogCard, OG_SIZE } from "@/lib/og";
import { getTool, tools } from "@/tools/registry";

export const alt = "devdrawer tool";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return tools.filter((t) => t.status === "ready").map((t) => ({ slug: t.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const tool = getTool((await params).slug)!;
  return ogCard({ eyebrow: tool.category, title: tool.name, subtitle: tool.description });
}
