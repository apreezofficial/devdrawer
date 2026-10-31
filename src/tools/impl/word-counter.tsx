"use client";

import { Stat, useSeed } from "@/components/ui";

export default function WordCounter() {
  const [text, setText] = useSeed();
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const sentences = text.split(/[.!?]+(\s|$)/).filter((s) => s.trim().length > 0).length;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim()).length;
  const lines = text ? text.split("\n").length : 0;

  return (
    <>
      <textarea rows={10} placeholder="Type or paste text…" value={text} onChange={(e) => setText(e.target.value)} style={{ fontFamily: "inherit", fontSize: 15 }} />
      <div className="stats">
        <Stat label="Words" value={words} />
        <Stat label="Characters" value={text.length} />
        <Stat label="No spaces" value={text.replace(/\s/g, "").length} />
        <Stat label="Sentences" value={sentences} />
        <Stat label="Paragraphs" value={paragraphs} />
        <Stat label="Lines" value={lines} />
        <Stat label="Reading time" value={`${Math.max(words ? 1 : 0, Math.round(words / 238))} min`} />
        <Stat label="Speaking time" value={`${Math.max(words ? 1 : 0, Math.round(words / 140))} min`} />
      </div>
    </>
  );
}
