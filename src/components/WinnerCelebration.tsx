"use client";

import { useEffect, useState, type CSSProperties } from "react";

const RESULTS_URL = "https://www.mlh.com/events/hacktoberfest-hack-day-ikole-ekiti-x-google-developers-group-on-campus-fuoye/submissions";
const SEEN_KEY = "devdrawer:first-place-celebration:v1";

export function WinnerCelebration() {
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(SEEN_KEY)) return;
      localStorage.setItem(SEEN_KEY, "seen");
    } catch { return; }
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setCelebrate(true);
  }, []);

  useEffect(() => {
    if (!celebrate) return;
    const timer = window.setTimeout(() => setCelebrate(false), 3600);
    return () => window.clearTimeout(timer);
  }, [celebrate]);

  return (
    <>
      <a className="winner-banner" href={RESULTS_URL} target="_blank" rel="noopener noreferrer" aria-label="devdrawer won first place at Hacktoberfest Hack Day. View the submissions.">
        <span className="winner-flag" aria-hidden="true">⚑</span>
        <strong>devdrawer won 1st place!</strong>
        <span className="winner-event">Hacktoberfest Hack Day</span>
        <span className="winner-link">See the win <span aria-hidden="true">↗</span></span>
      </a>
      {celebrate && (
        <div className="winner-celebration" aria-hidden="true">
          <div className="winner-toast"><span>🏆</span><strong>A little win. A big thank you.</strong><span>1st place · Hacktoberfest Hack Day</span></div>
          {Array.from({ length: 28 }, (_, i) => (
            <span key={i} className="winner-bubble" style={{
              "--bubble-left": `${(i * 37 + 9) % 100}%`,
              "--bubble-size": `${14 + (i * 19) % 66}px`,
              "--bubble-drift": `${((i * 43) % 180) - 90}px`,
              "--bubble-delay": `${(i % 7) * 0.06}s`,
              "--bubble-duration": `${2.2 + (i % 5) * 0.17}s`,
              "--bubble-hue": `${36 + (i % 4) * 6}`,
            } as CSSProperties} />
          ))}
        </div>
      )}
    </>
  );
}
