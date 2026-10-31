import { NextResponse } from "next/server";
import { tools } from "@/tools/registry";
import { FAKE_DATA_FIELDS, parseFakeDataConfig } from "@/lib/fake-data-config";

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
{"reply": string, "tool"?: string, "input"?: string}
- "reply": your answer in concise Markdown. Use fenced code blocks for code. Keep it short and practical.
- "tool": include ONLY when one of the tools above would help the user right now; must be an exact slug from the list.
- "input": optional text to pre-fill that tool with (e.g. the regex, cron expression, SQL, JSON, curl command, or text to process).
For fake-data, input MUST be a JSON-encoded configuration string with fields, count, format (json/csv/sql), and optional seed. Supported fields: ${FAKE_DATA_FIELDS.join(", ")}.
Example request "50 fake users with email and city as CSV": {"reply":"Open the generator to create 50 fake users with email and city as CSV.","tool":"fake-data","input":"{\\"fields\\":[\\"email\\",\\"city\\"],\\"count\\":50,\\"format\\":\\"csv\\"}"}.
Use exactly the fields requested; map "name" to fullName. If no fields are specified use id, fullName, email, city, createdAt. Default to 10 rows and json unless requested otherwise. Generate fake data locally through this configuration rather than writing rows into input or reply. Never claim you have provided data or a file unless it is actually in reply; describe what opening the generator will do.
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
          max_completion_tokens: 1500,
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

function parse(content: string) {
  const json = content.match(/\{[\s\S]*\}/)?.[0];
  try {
    const obj = JSON.parse(json ?? content);
    const slug = typeof obj.tool === "string" && tools.some((t) => t.slug === obj.tool && t.status === "ready") ? obj.tool : undefined;
    const input = slug && typeof obj.input === "string" ? obj.input.slice(0, 4000) : undefined;
    const config = slug === "fake-data" && input ? parseFakeDataConfig(input) : null;
    return {
      reply: typeof obj.reply === "string" ? obj.reply : "",
      tool: slug,
      input: slug === "fake-data" ? (config ? JSON.stringify(config) : undefined) : input,
    };
  } catch {
    return { reply: content, tool: undefined, input: undefined };
  }
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
    const out = parse(content);
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
