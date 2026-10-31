"use client";

import { useMemo, useState } from "react";
import { Output } from "@/components/ui";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Inline markdown on already-escaped text. Only http(s)/relative links are allowed. */
function inline(s: string) {
  return s
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/!\[([^\]]*)\]\(((?:https?:\/\/|\/)[^)\s]+)\)/g, '<img alt="$1" src="$2" />')
    .replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/|#)[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
    .replace(/~~([^~]+)~~/g, "<del>$1</del>");
}

/** Small, safe markdown renderer: all input is HTML-escaped before formatting. */
export function renderMarkdown(src: string) {
  const lines = esc(src).split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
      out.push(`<pre><code>${code.join("\n")}</code></pre>`);
      i++;
      continue;
    }
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) { out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); i++; continue; }
    if (/^(-{3,}|\*{3,})$/.test(line.trim())) { out.push("<hr />"); i++; continue; }
    if (/^&gt;\s?/.test(line)) {
      const q: string[] = [];
      while (i < lines.length && /^&gt;\s?/.test(lines[i])) q.push(lines[i++].replace(/^&gt;\s?/, ""));
      out.push(`<blockquote>${inline(q.join(" "))}</blockquote>`);
      continue;
    }
    if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) {
        let t = lines[i++].replace(/^\s*([-*+]|\d+\.)\s+/, "");
        t = t.replace(/^\[( |x)\]\s/, (_, c) => `<input type="checkbox" disabled ${c === "x" ? "checked" : ""}/> `);
        items.push(`<li>${inline(t)}</li>`);
      }
      out.push(ordered ? `<ol>${items.join("")}</ol>` : `<ul>${items.join("")}</ul>`);
      continue;
    }
    if (line.includes("|") && /^\s*\|?[\s:-]+\|[\s|:-]*$/.test(lines[i + 1] ?? "")) {
      const cells = (l: string) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => inline(c.trim()));
      const head = cells(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|")) rows.push(cells(lines[i++]));
      out.push(`<table><thead><tr>${head.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
      continue;
    }
    if (!line.trim()) { i++; continue; }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|```|&gt;|\s*([-*+]|\d+\.)\s)/.test(lines[i])) para.push(lines[i++]);
    out.push(`<p>${inline(para.join(" "))}</p>`);
  }
  return out.join("\n");
}

const SAMPLE = `# Hello devdrawer

Write **bold**, *italic*, ~~strike~~ and \`code\`.

- [x] Smart paste
- [ ] Your tool here

> Everything runs in your browser.

| Tool | Status |
| --- | --- |
| Markdown | Ready |

\`\`\`js
console.log("hi");
\`\`\`
`;

export default function MarkdownPreview() {
  const [md, setMd] = useState(SAMPLE);
  const html = useMemo(() => renderMarkdown(md), [md]);
  return (
    <>
      <div className="row" style={{ alignItems: "stretch" }}>
        <textarea rows={18} value={md} onChange={(e) => setMd(e.target.value)} />
        <div className="md-preview" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      <Output label="HTML" value={html} rows={6} />
    </>
  );
}
