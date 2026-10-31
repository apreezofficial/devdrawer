"use client";

import { useEffect, useRef } from "react";
import { cssVar, MONO, runCanvas, trackPointer } from "./canvas";

const SCRAMBLE = "#%@&*+=-:;<>/\\{}[]01";
const CELL = 7;

/**
 * A giant wordmark rendered as a grid of cells. Solid at rest; under the cursor
 * (or a slow scanning band on touch screens) the letters dissolve into scrambling glyphs.
 */
export function GlyphWordmark({ text }: { text: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const pointer = trackPointer(canvas);
    let w = 0, h = 0, cols = 0, rows = 0, color = "#fff", fontPx = 0;
    let mask = new Uint8Array(0);
    let seed = new Float32Array(0);
    const theme = window.matchMedia("(prefers-color-scheme: dark)");
    const readColor = () => { color = cssVar(canvas, "--slab-fg"); };
    theme.addEventListener("change", readColor);

    const stop = runCanvas(canvas, {
      fps: 30,
      setup(ctx, cw, ch) {
        w = cw; h = ch;
        cols = Math.floor(w / CELL);
        rows = Math.floor(h / CELL);
        readColor();

        // Rasterize the word once at grid resolution to get the cell mask.
        const off = document.createElement("canvas");
        off.width = cols; off.height = rows;
        const o = off.getContext("2d")!;
        let size = rows * 1.15;
        o.font = `800 ${size}px ${MONO}`;
        const measured = o.measureText(text).width;
        if (measured > cols * 0.98) size *= (cols * 0.98) / measured;
        o.font = `800 ${size}px ${MONO}`;
        o.textAlign = "center";
        o.textBaseline = "middle";
        o.fillStyle = "#000";
        o.fillText(text, cols / 2, rows / 2 + size * 0.04);
        fontPx = size * CELL;
        const data = o.getImageData(0, 0, cols, rows).data;
        mask = new Uint8Array(cols * rows);
        seed = new Float32Array(cols * rows);
        for (let k = 0; k < mask.length; k++) { mask[k] = data[k * 4 + 3] > 110 ? 1 : 0; seed[k] = Math.random(); }

        ctx.font = `600 ${CELL + 2}px ${MONO}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
      },
      draw(ctx, t) {
        pointer.step();
        const { x: px, y: py, active } = pointer.p;
        // Without a cursor, a soft band sweeps across so the effect still shows.
        const bx = active ? px : ((t * 0.18) % 1.4 - 0.2) * w;
        const by = active ? py : h / 2;
        const radius = active ? 120 : 90;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = color;

        // Resting state: the word as smooth solid text, matching the cell mask.
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.font = `800 ${fontPx}px ${MONO}`;
        ctx.fillText(text, (cols * CELL) / 2, (rows * CELL) / 2 + fontPx * 0.04);
        ctx.restore();

        const tick = Math.floor(t * 14);
        for (let j = 0; j < rows; j++) {
          const y = j * CELL + CELL / 2;
          for (let i = 0; i < cols; i++) {
            const k = j * cols + i;
            const x = i * CELL + CELL / 2;
            const d = Math.hypot(x - bx, (y - by) * (active ? 1 : 0.15));
            const heat = Math.max(0, 1 - d / radius);
            if (mask[k]) {
              if (heat > seed[k] * 0.9) {
                // Punch the cell out of the solid word and replace it with a glyph.
                ctx.clearRect(x - CELL / 2, y - CELL / 2, CELL, CELL);
                ctx.globalAlpha = 0.55 + heat * 0.45;
                ctx.fillText(SCRAMBLE[(k * 7 + tick * (1 + (k % 3))) % SCRAMBLE.length], x, y);
              }
            } else if (heat > 0.35 && seed[k] < heat * 0.25) {
              ctx.globalAlpha = heat * 0.35;
              ctx.fillText("·", x, y);
            }
          }
        }
        ctx.globalAlpha = 1;
      },
    });

    return () => { stop(); pointer.dispose(); theme.removeEventListener("change", readColor); };
  }, [text]);

  return <canvas ref={ref} className="glyph-wordmark" role="img" aria-label={text} />;
}
