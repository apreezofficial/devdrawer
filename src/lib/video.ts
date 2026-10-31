export const fmtTime = (s: number) => {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${(s - m * 60).toFixed(1).padStart(4, "0")}`;
};

/** Seek a video element and resolve once the frame is ready. */
export const seek = (v: HTMLVideoElement, t: number) =>
  new Promise<void>((resolve) => {
    const done = () => { v.removeEventListener("seeked", done); resolve(); };
    v.addEventListener("seeked", done);
    v.currentTime = t;
  });
