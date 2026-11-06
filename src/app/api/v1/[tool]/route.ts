import { NextResponse } from "next/server";
import { ApiError, findApiTool } from "@/lib/api-tools";
import { clientIp, corsHeaders, overLimit } from "@/lib/api-http";

export const runtime = "nodejs";

const MAX_BODY = 60_000;

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: Request, { params }: { params: Promise<{ tool: string }> }) {
  const { tool: slug } = await params;
  const headers = corsHeaders();
  const tool = findApiTool(slug);
  if (!tool) return NextResponse.json({ error: `No API tool called "${slug}". See GET /api/v1.` }, { status: 404, headers });
  if (overLimit(clientIp(req))) {
    return NextResponse.json({ error: "Rate limit reached. Try again in a minute." }, { status: 429, headers });
  }

  let input: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY) throw new ApiError("Request body is too large.", 413);
    const body = raw.trim() ? JSON.parse(raw) : {};
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new ApiError("Send a JSON object.");
    input = body as Record<string, unknown>;
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 400;
    return NextResponse.json({ error: e instanceof ApiError ? e.message : "Body must be valid JSON." }, { status, headers });
  }

  try {
    const result = await tool.run(input);
    return NextResponse.json({ tool: tool.slug, result }, { headers });
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    const message = e instanceof ApiError ? e.message : "Something went wrong on our side.";
    return NextResponse.json({ error: message }, { status, headers });
  }
}

/** GET returns the docs for one tool, so you can explore it in a browser. */
export async function GET(_req: Request, { params }: { params: Promise<{ tool: string }> }) {
  const { tool: slug } = await params;
  const headers = corsHeaders();
  const tool = findApiTool(slug);
  if (!tool) return NextResponse.json({ error: `No API tool called "${slug}".` }, { status: 404, headers });
  const { run: _run, ...doc } = tool;
  return NextResponse.json(doc, { headers });
}
