/**
 * The devdrawer mark: curly braces holding three dots, an outline icon.
 * The braces draw in on load; the dots ripple like a typing indicator on hover of the parent .logo.
 */
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg className="mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path className="mark-brace" pathLength={1} d="M11 5.5c-2.6 0-3.6 1.2-3.6 3.6v3.4c0 1.9-.9 3.1-2.9 3.5 2 .4 2.9 1.6 2.9 3.5v3.4c0 2.4 1 3.6 3.6 3.6" />
      <path className="mark-brace" pathLength={1} d="M21 5.5c2.6 0 3.6 1.2 3.6 3.6v3.4c0 1.9.9 3.1 2.9 3.5-2 .4-2.9 1.6-2.9 3.5v3.4c0 2.4-1 3.6-3.6 3.6" />
      <circle className="mark-dot" cx="12.6" cy="16" r="1.25" />
      <circle className="mark-dot" cx="16" cy="16" r="1.25" />
      <circle className="mark-dot" cx="19.4" cy="16" r="1.25" />
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
