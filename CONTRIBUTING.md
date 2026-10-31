# Contributing to AllDevNeedy

## Add a tool in 3 steps
1. **Create** `src/tools/impl/<slug>.tsx` with a default-exported React component (`"use client"` at the top). Reuse the helpers in `src/components/ui.tsx` (`Field`, `Output`, `CopyButton`, `FileDrop`, `useSeed`…).
2. **Register** it in `src/tools/registry.ts`: add an entry (or flip an existing `"soon"` entry to ready by removing the last argument).
3. **Wire** it in `src/tools/loader.tsx`: add one `dynamic(() => import("./impl/<slug>"), …)` line.

Optional: teach smart paste to recognise your input in `src/tools/detect.ts`.

## Rules
- **Everything runs in the browser.** No servers, no analytics, no network calls with user data.
- **Prefer browser APIs** (Web Crypto, Canvas, Intl) over new dependencies. If you add a package, explain why in the PR.
- Use the CSS classes in `src/app/globals.css`; it supports light and dark mode.
- Run `npm run build` before opening a PR.

## Good first issues
Every card marked **Soon** on the home page is a good first issue. Comment on the matching GitHub issue to claim it.
