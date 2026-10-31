import { NextResponse } from "next/server";
import { tools } from "@/tools/registry";
import { TOOL_INPUT_GUIDE } from "@/lib/tool-input";
import { parseAIResponse } from "@/lib/ai-response";
import { createAIClient, type AIMessage } from "@/lib/ai-provider";

export const runtime = "nodejs";

const MAX_MESSAGES = 16;
const MAX_CHARS = 6000;
const ai = createAIClient(process.env);

// Best-effort per-IP limiter. Serverless instances don't share memory, so this caps
// bursts per instance rather than being a global quota.
const LIMIT = Number(process.env.AI_RATE_LIMIT || 20);
const WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, number[]>();

function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > LIMIT;
}

const TOOL_LIST = tools
  .filter((t) => t.status === "ready")
  .map((t) => `- ${t.slug}: ${t.name}. ${t.description}`)
  .join("\n");

const SYSTEM = `You are the assistant inside devdrawer, a free, open-source collection of in-browser developer tools.
Help developers quickly: write regexes, cron expressions, SQL, code snippets, explain errors, stack traces and code, and route them to the right tool.

Available tools (slug: name. description):
${TOOL_LIST}

Always reply with a single JSON object, no prose around it:
{"reply": string, "tool"?: string, "settings"?: object}
- "reply": your answer in concise Markdown. Use fenced code blocks for code. Keep it short and practical.
- "tool": include ONLY when a tool above helps right now; use an exact slug.
- "settings": editable tool settings matching the contracts below. Include only settings the user requested, with exact property names, enum values and types. Never put generated output in settings.
The Open button applies settings and tools with live results update automatically. Tools with a Generate/Hash/Convert button require the user to click it. File tools require a local file upload. Never claim to have created a file, completed a conversion, or provided data unless it is actually in reply. Say what opening the tool will configure.
Examples:
{"reply":"Open the generator for 50 users with email and city as CSV.","tool":"fake-data","settings":{"fields":["email","city"],"count":50,"format":"csv"}}
{"reply":"Open the decoder with this Base64 text.","tool":"base64","settings":{"input":"SGVsbG8=","mode":"decode"}}
{"reply":"Test this expression against your sample.","tool":"regex","settings":{"pattern":"^hello$","flags":"im","text":"HELLO"}}
For fake-data map "name" to fullName; when unspecified use id, fullName, email, city, createdAt, 10 rows and json. When fields are specified use exactly those fields.
For regex supply the pattern without / delimiters and flags separately. For number-base supply input as a string plus numeric radix. For unit-converter supply the group and a matching from unit; results show all target units. Percentage a and b populate all five calculation forms. For aspect-ratio, supply w, h, newW and newH consistent with the requested ratio.
Never put passwords, HMAC secrets, Wi-Fi passwords, private keys or other credentials in settings; users enter these locally. Do not claim file tools can process a remote URL. If no settings apply, omit settings and simply link the tool with a helpful next step.
Tool setting contracts (JSON schema properties; numeric bounds apply):
${TOOL_INPUT_GUIDE}
Never ask for or repeat passwords, API keys or other secrets. If the user pastes one, tell them to rotate it.`;

export async function POST(req: Request) {
  if (!ai.configured) {
    return NextResponse.json({ error: "AI isn't configured yet. Add GEMINI_API_KEY or GROQ_API_KEY_1 in your environment." }, { status: 503 });
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "anon";
  if (limited(ip)) {
    return NextResponse.json({ error: "Slow down a little. Try again in a few minutes." }, { status: 429 });
  }

  let messages: AIMessage[];
  try {
    const body = await req.json();
    messages = (Array.isArray(body?.messages) ? body.messages : [])
      .filter((m: AIMessage) => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string")
      .slice(-MAX_MESSAGES)
      .map((m: AIMessage) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "Send a message first." }, { status: 400 });
  }

  try {
    const { content, provider } = await ai.complete(SYSTEM, messages);
    const out = parseAIResponse(content, tools.filter((t) => t.status === "ready").map((t) => t.slug));
    if (!out.reply && !out.tool) throw new Error("empty");
    return NextResponse.json({ ...out, provider });
  } catch (e) {
    const status = (e as { status?: number }).status;
    const busy = status === 429;
    return NextResponse.json(
      { error: busy ? "The AI is busy right now. Try again in a moment." : "The AI couldn't answer that. Try again." },
      { status: busy ? 429 : 502 },
    );
  }
}
