# Contributing to AllDevNeedy

## Add a tool in 3 steps
1. **Create** `src/tools/impl/<slug>.tsx` with a default-exported React component (`"use client"` at the top). Reuse the helpers in `src/components/ui.tsx` (`Field`, `Output`, `CopyButton`, `FileDrop`, `useSeed`…).
2. **Register** it in `src/tools/registry.ts`: add an entry (pass `"soon"` as the last argument to list it before it's built).
3. **Wire** it in `src/tools/loader.tsx`: add one `dynamic(() => import("./impl/<slug>"), …)` line.

Optional: teach smart paste to recognise your input in `src/tools/detect.ts`.

## Rules
- **Everything runs in the browser.** No servers, no analytics, no network calls with user data.
- **Prefer browser APIs** (Web Crypto, Canvas, Intl) over new dependencies. If you add a package, explain why in the PR.
- Use the CSS classes in `src/app/globals.css`; it supports light and dark mode.
- Run `npm run build` before opening a PR.

## Ideas
Check the issues labeled `good first issue`, or open a "Tool request" issue and claim it.
