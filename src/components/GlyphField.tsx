"use client";

import { useEffect, useRef } from "react";
import { cssVar, MONO, runCanvas, trackPointer } from "./canvas";

/** Density ramp, sparse → dense, with a few dev characters mixed in. */
const RAMP = " .·:;-=+*<>{}/#%@";
const CELL = 14;

/**
 * Hero background: a field of monospace glyphs drifting in slow interference waves,
 * faded behind the headline and brightened around the cursor.
 */
export function GlyphField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const host = canvas.parentElement!;
    const pointer = trackPointer(host);
    let cols = 0, rows = 0, w = 0, h = 0, ink = "#171717";
    const theme = window.matchMedia("(prefers-color-scheme: dark)");
    const readInk = () => { ink = cssVar(canvas, "--ink"); };
    theme.addEventListener("change", readInk);

    const stop = runCanvas(canvas, {
      fps: 30,
      setup(ctx, cw, ch) {
        w = cw; h = ch;
        cols = Math.ceil(w / CELL);
        rows = Math.ceil(h / CELL);
        readInk();
        ctx.font = `500 11px ${MONO}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
      },
      draw(ctx, t) {
        pointer.step();
        const { x: px, y: py, active } = pointer.p;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = ink;
        // On narrow screens the text spans the full width, so clear a wider area and dim the field.
        const narrow = w < 700;
        const cx = w / 2, cy = h * (narrow ? 0.28 : 0.32);
        const rx = w * (narrow ? 0.62 : 0.36), ry = h * (narrow ? 0.26 : 0.3);
        const gain = narrow ? 0.6 : 1;
        for (let j = 0; j < rows; j++) {
          const y = j * CELL + CELL / 2;
          for (let i = 0; i < cols; i++) {
            const x = i * CELL + CELL / 2;
            // Two drifting wave fields multiplied give organic moving bands.
            const a = Math.sin(i * 0.11 + t * 0.7) * Math.cos(j * 0.17 - t * 0.45);
            const b = Math.sin((i + j) * 0.06 - t * 0.35 + Math.sin(j * 0.05 + t * 0.2) * 2);
            let v = (a * 0.55 + b * 0.45 + 1) / 2;

            // Fade an ellipse behind the headline, and fade toward the bottom edge.
            const dx = (x - cx) / rx, dy = (y - cy) / ry;
            const hole = Math.min(1, Math.max(0, Math.sqrt(dx * dx + dy * dy) - 0.55));
            const bottom = Math.min(1, (h - y) / (h * 0.35));
            v *= hole * bottom * gain;

            if (active) {
              const d = Math.hypot(x - px, y - py);
              if (d < 190) v = Math.max(v, (1 - d / 190) * 1.05);
            }
            if (v < 0.1) continue;
            const ch = RAMP[Math.min(RAMP.length - 1, Math.floor(v * RAMP.length))];
            ctx.globalAlpha = Math.min(0.75, 0.1 + v * 0.55);
            ctx.fillText(ch, x, y);
          }
        }
        ctx.globalAlpha = 1;
      },
    });

    return () => { stop(); pointer.dispose(); theme.removeEventListener("change", readInk); };
  }, []);

  return <canvas ref={ref} className="glyph-field" aria-hidden="true" />;
}
