/** Shared plumbing for the glyph canvases: DPR sizing, visibility-aware RAF loop, theme color. */

export const MONO = '"JetBrains Mono Variable", ui-monospace, Menlo, monospace';

export function cssVar(el: Element, name: string) {
  return getComputedStyle(el).getPropertyValue(name).trim() || "#171717";
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Runs `draw` at most `fps` times a second while the canvas is on screen and the tab is visible.
 * `setup` is called on every resize with CSS-pixel width/height. Returns a cleanup function.
 */
export function runCanvas(
  canvas: HTMLCanvasElement,
  opts: { fps?: number; setup: (ctx: CanvasRenderingContext2D, w: number, h: number) => void; draw: (ctx: CanvasRenderingContext2D, t: number) => void },
) {
  const ctx = canvas.getContext("2d")!;
  const frameMs = 1000 / (opts.fps ?? 30);
  let raf = 0, last = 0, visible = true, w = 0, h = 0;
  const reduced = prefersReducedMotion();

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect();
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    opts.setup(ctx, w, h);
    opts.draw(ctx, performance.now() / 1000);
  };

  const loop = (now: number) => {
    raf = 0;
    if (!visible || document.hidden || reduced) return;
    if (now - last >= frameMs) { last = now; opts.draw(ctx, now / 1000); }
    raf = requestAnimationFrame(loop);
  };
  const start = () => { if (!raf && !reduced) raf = requestAnimationFrame(loop); };

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); });
  io.observe(canvas);
  const onVis = () => !document.hidden && start();
  document.addEventListener("visibilitychange", onVis);
  resize();
  start();

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    document.removeEventListener("visibilitychange", onVis);
  };
}

/** Tracks the pointer relative to `el`, eased; `active` is false when the pointer is away. */
export function trackPointer(el: HTMLElement) {
  const p = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false };
  const move = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    p.tx = e.clientX - r.left;
    p.ty = e.clientY - r.top;
    if (!p.active) { p.x = p.tx; p.y = p.ty; }
    p.active = true;
  };
  const leave = () => { p.active = false; };
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerleave", leave);
  return {
    p,
    step() { p.x += (p.tx - p.x) * 0.2; p.y += (p.ty - p.y) * 0.2; },
    dispose() { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); },
  };
}
