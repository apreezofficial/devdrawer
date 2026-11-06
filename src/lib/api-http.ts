/** Shared HTTP helpers for /api/v1: CORS, a per-IP limiter, and JSON error replies. */

export function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
  };
}

const LIMIT = Number(process.env.API_RATE_LIMIT || 60);
const WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

/** Best-effort: each serverless instance counts on its own, so this is a brake, not a global quota. */
export function overLimit(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > LIMIT;
}

export const clientIp = (req: Request) => (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "anon";
