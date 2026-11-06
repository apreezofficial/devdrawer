import { NextResponse } from "next/server";
import { apiDocs } from "@/lib/api-tools";
import { corsHeaders } from "@/lib/api-http";

export const runtime = "nodejs";

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

/** List every API tool with its inputs and an example body. */
export function GET() {
  return NextResponse.json({ version: "v1", tools: apiDocs() }, { headers: corsHeaders() });
}
