import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ToolView } from "@/tools/loader";
import { getTool, tools } from "@/tools/registry";

export function generateStaticParams() {
  return tools.filter((t) => t.status === "ready").map((t) => ({ slug: t.slug }));
}

export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = getTool((await params).slug);
  return tool ? { title: `${tool.name} — devdrawer`, description: tool.description } : {};
}

export default async function ToolPage({ params }: Props) {
  const tool = getTool((await params).slug);
  if (!tool || tool.status !== "ready") notFound();
  return (
    <>
      <div className="tool-head">
        <div className="crumb"><Link href="/">All tools</Link> / {tool.category}</div>
        <h1>{tool.name}</h1>
        <p>{tool.description}</p>
      </div>
      <div className="panel">
        <ToolView slug={tool.slug} />
      </div>
    </>
  );
}
