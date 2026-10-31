"use client";

import { useEffect, useRef } from "react";
import { decodeToolInput } from "@/lib/tool-input";

export const TOOL_INPUT_KEY = "devdrawer:tool-input";
export const TOOL_INPUT_EVENT = "devdrawer:tool-input";

type Handoff = { slug: string; input: string };

/** Queue only for the intended tool; mounted tools also receive same-page requests. */
export function handoffToolInput(slug: string, input?: string) {
  try {
    sessionStorage.removeItem(TOOL_INPUT_KEY);
    sessionStorage.removeItem("devdrawer:seed");
    if (input) sessionStorage.setItem(TOOL_INPUT_KEY, JSON.stringify({ slug, input }));
  } catch { /* same-page handoffs still work when storage is blocked */ }
  if (input) window.dispatchEvent(new CustomEvent<Handoff>(TOOL_INPUT_EVENT, { detail: { slug, input } }));
}

/** Validation happens before setters run; never expose generated output or secret fields. */
export function useToolInput(slug: string, apply: (settings: Record<string, unknown>) => void) {
  const callback = useRef(apply);
  callback.current = apply;
  useEffect(() => {
    const receive = (handoff: Handoff) => {
      if (handoff.slug !== slug || typeof handoff.input !== "string") return;
      const settings = decodeToolInput(slug, handoff.input);
      try { sessionStorage.removeItem(TOOL_INPUT_KEY); } catch { /* storage blocked */ }
      if (settings) callback.current(settings);
    };
    try {
      const pending = sessionStorage.getItem(TOOL_INPUT_KEY);
      if (pending) receive(JSON.parse(pending));
      else {
        const legacy = sessionStorage.getItem("devdrawer:seed");
        if (legacy) {
          sessionStorage.removeItem("devdrawer:seed");
          receive({ slug, input: legacy });
        }
      }
    } catch { /* invalid or unavailable storage */ }
    const onInput = (event: Event) => {
      const detail = (event as CustomEvent<Handoff>).detail;
      if (detail) receive(detail);
    };
    window.addEventListener(TOOL_INPUT_EVENT, onInput);
    return () => window.removeEventListener(TOOL_INPUT_EVENT, onInput);
  }, [slug]);
}
