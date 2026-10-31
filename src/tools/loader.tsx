"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/**
 * Adding a tool: create `src/tools/impl/<slug>.tsx` with a default export,
 * add one line here, and flip its status to "ready" in registry.ts.
 */
const Loading = () => <p className="field-hint">Loading tool…</p>;

const impls: Record<string, ComponentType> = {
  "word-counter": dynamic(() => import("./impl/word-counter"), { ssr: false, loading: Loading }),
  "case-converter": dynamic(() => import("./impl/case-converter"), { ssr: false, loading: Loading }),
  "text-diff": dynamic(() => import("./impl/text-diff"), { ssr: false, loading: Loading }),
  "lorem-ipsum": dynamic(() => import("./impl/lorem-ipsum"), { ssr: false, loading: Loading }),
  slugify: dynamic(() => import("./impl/slugify"), { ssr: false, loading: Loading }),
  "line-tools": dynamic(() => import("./impl/line-tools"), { ssr: false, loading: Loading }),
  "find-replace": dynamic(() => import("./impl/find-replace"), { ssr: false, loading: Loading }),
  uuid: dynamic(() => import("./impl/uuid"), { ssr: false, loading: Loading }),
  password: dynamic(() => import("./impl/password"), { ssr: false, loading: Loading }),
  "fake-data": dynamic(() => import("./impl/fake-data"), { ssr: false, loading: Loading }),
  "random-number": dynamic(() => import("./impl/random-number"), { ssr: false, loading: Loading }),
  hash: dynamic(() => import("./impl/hash"), { ssr: false, loading: Loading }),
  hmac: dynamic(() => import("./impl/hmac"), { ssr: false, loading: Loading }),
  jwt: dynamic(() => import("./impl/jwt"), { ssr: false, loading: Loading }),
  base64: dynamic(() => import("./impl/base64"), { ssr: false, loading: Loading }),
  "url-encode": dynamic(() => import("./impl/url-encode"), { ssr: false, loading: Loading }),
  "html-entities": dynamic(() => import("./impl/html-entities"), { ssr: false, loading: Loading }),
  "number-base": dynamic(() => import("./impl/number-base"), { ssr: false, loading: Loading }),
  "image-base64": dynamic(() => import("./impl/image-base64"), { ssr: false, loading: Loading }),
  "json-formatter": dynamic(() => import("./impl/json-formatter"), { ssr: false, loading: Loading }),
  "json-csv": dynamic(() => import("./impl/json-csv"), { ssr: false, loading: Loading }),
  regex: dynamic(() => import("./impl/regex"), { ssr: false, loading: Loading }),
  "color-picker": dynamic(() => import("./impl/color-picker"), { ssr: false, loading: Loading }),
  contrast: dynamic(() => import("./impl/contrast"), { ssr: false, loading: Loading }),
  "image-palette": dynamic(() => import("./impl/image-palette"), { ssr: false, loading: Loading }),
  gradient: dynamic(() => import("./impl/gradient"), { ssr: false, loading: Loading }),
  "image-compressor": dynamic(() => import("./impl/image-compressor"), { ssr: false, loading: Loading }),
  "image-cropper": dynamic(() => import("./impl/image-cropper"), { ssr: false, loading: Loading }),
  timestamp: dynamic(() => import("./impl/timestamp"), { ssr: false, loading: Loading }),
  "http-status": dynamic(() => import("./impl/http-status"), { ssr: false, loading: Loading }),
  "user-agent": dynamic(() => import("./impl/user-agent"), { ssr: false, loading: Loading }),
  chmod: dynamic(() => import("./impl/chmod"), { ssr: false, loading: Loading }),
  "unit-converter": dynamic(() => import("./impl/unit-converter"), { ssr: false, loading: Loading }),
  percentage: dynamic(() => import("./impl/percentage"), { ssr: false, loading: Loading }),
};

export function ToolView({ slug }: { slug: string }) {
  const Impl = impls[slug];
  return Impl ? <Impl /> : <p className="error">This tool isn&apos;t wired up yet.</p>;
}
