/**
 * The devdrawer mark: a two-drawer cabinet. On hover (of the parent .logo) the top
 * drawer slides open and a </> peeks out of it.
 */
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg className="mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect className="mark-body" x="4" y="4" width="24" height="24" rx="7" />
      {/* Code that lives in the top drawer, revealed when it slides open */}
      <path className="mark-code" d="M12.2 9.4 10 11.25l2.2 1.85M19.8 9.4 22 11.25l-2.2 1.85M17 8.6l-2 5.3" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <g className="mark-drawer-top">
        <rect className="mark-front" x="7.5" y="7.5" width="17" height="7.5" rx="2.6" />
        <rect className="mark-handle" x="13" y="10.5" width="6" height="1.6" rx=".8" />
      </g>
      <rect className="mark-front" x="7.5" y="17" width="17" height="7.5" rx="2.6" />
      <rect className="mark-handle" x="13" y="20" width="6" height="1.6" rx=".8" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="wordmark">
      <span className="wm-dev">dev</span>drawer
    </span>
  );
}
