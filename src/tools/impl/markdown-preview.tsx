"use client";

import { useMemo, useState } from "react";
import { Output } from "@/components/ui";
import { renderMarkdown } from "@/lib/markdown";

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
