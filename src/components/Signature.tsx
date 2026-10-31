"use client";

import "@fontsource/mrs-saint-delafield/latin-400.css";
import { useEffect, useRef, useState } from "react";

/** "By ap" in a signature hand, revealed left-to-right like it's being written when it scrolls into view. */
export function Signature() {
  const ref = useRef<HTMLSpanElement>(null);
  const [written, setWritten] = useState(false);

  useEffect(() => {
    // Watch the parent: the span's own clip-path makes it count as invisible until revealed.
    const el = ref.current!.parentElement ?? ref.current!;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setWritten(true); io.disconnect(); }
    }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <span ref={ref} className={`signature ${written ? "written" : ""}`} aria-label="By ap">
      By ap
    </span>
  );
}
