import { NextResponse } from "next/server";
import { tools } from "@/tools/registry";
import { TOOL_INPUT_GUIDE } from "@/lib/tool-input";
import { parseAIResponse } from "@/lib/ai-response";

export const runtime = "nodejs";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MAX_MESSAGES = 16;
const MAX_CHARS = 6000;

/** Up to five keys: GROQ_API_KEY_1..GROQ_API_KEY_5, plus a plain GROQ_API_KEY. */
const KEYS = [
  process.env.GROQ_API_KEY,
  ...[1, 2, 3, 4, 5].map((n) => process.env[`GROQ_API_KEY_${n}`]),
].filter((k): k is string => !!k && k.trim().length > 0);

const MODELS = [process.env.GROQ_MODEL || "openai/gpt-oss-120b", process.env.GROQ_FALLBACK_MODEL || "openai/gpt-oss-20b"];

// Round-robin start so load spreads across keys; on 429/5xx we fail over to the next one.
let cursor = 0;

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

type Msg = { role: "user" | "assistant"; content: string };

async function callGroq(messages: Msg[]) {
  let lastStatus = 0;
  for (const model of MODELS) {
    for (let i = 0; i < KEYS.length; i++) {
      const key = KEYS[(cursor + i) % KEYS.length];
      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [{ role: "system", content: SYSTEM }, ...messages],
          response_format: { type: "json_object" },
          reasoning_effort: "low",
          temperature: 0.3,
          max_completion_tokens: 3000,
        }),
        signal: AbortSignal.timeout(25_000),
      }).catch(() => null);

      if (res?.ok) {
        cursor = (cursor + i + 1) % KEYS.length;
        const data = await res.json();
        return { content: String(data.choices?.[0]?.message?.content ?? ""), model };
      }
      lastStatus = res?.status ?? 0;
      // Bad request won't be fixed by another key; a missing model is fixed by the fallback model.
      if (lastStatus === 400) break;
      if (lastStatus === 404) break;
    }
  }
  throw Object.assign(new Error("All AI providers failed"), { status: lastStatus });
}


export async function POST(req: Request) {
  if (!KEYS.length) {
    return NextResponse.json({ error: "AI isn't configured yet. Add GROQ_API_KEY_1 in your environment." }, { status: 503 });
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "anon";
  if (limited(ip)) {
    return NextResponse.json({ error: "Slow down a little. Try again in a few minutes." }, { status: 429 });
  }

  let messages: Msg[];
  try {
    const body = await req.json();
    messages = (Array.isArray(body?.messages) ? body.messages : [])
      .filter((m: Msg) => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string")
      .slice(-MAX_MESSAGES)
      .map((m: Msg) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "Send a message first." }, { status: 400 });
  }

  try {
    const { content } = await callGroq(messages);
    const out = parseAIResponse(content, tools.filter((t) => t.status === "ready").map((t) => t.slug));
    if (!out.reply && !out.tool) throw new Error("empty");
    return NextResponse.json(out);
  } catch (e) {
    const status = (e as { status?: number }).status;
    const busy = status === 429;
    return NextResponse.json(
      { error: busy ? "The AI is busy right now. Try again in a moment." : "The AI couldn't answer that. Try again." },
      { status: busy ? 429 : 502 },
    );
  }
}
