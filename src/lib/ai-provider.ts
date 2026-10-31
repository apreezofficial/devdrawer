/** Server-side provider routing: Gemini when configured, then Groq fallback. */
export type AIMessage = { role: "user" | "assistant"; content: string };
export type AIProvider = "Gemini" | "Groq";
type Environment = Record<string, string | undefined>;

function usable(content: string) {
  try {
    const obj = JSON.parse(content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, ""));
    return obj && typeof obj.reply === "string" && !!obj.reply.trim();
  } catch { return false; }
}

export function createAIClient(env: Environment, request: typeof fetch = fetch) {
  const geminiKey = env.GEMINI_API_KEY?.trim() || env.GOOGLE_API_KEY?.trim();
  const geminiModel = env.GEMINI_MODEL?.trim() || "gemini-3.8-flash";
  const groqKeys = [...new Set([env.GROQ_API_KEY, ...[1, 2, 3, 4, 5].map(n => env[`GROQ_API_KEY_${n}`])].map(k => k?.trim()).filter((k): k is string => !!k))];
  const groqModels = [...new Set([env.GROQ_MODEL?.trim() || "openai/gpt-oss-120b", env.GROQ_FALLBACK_MODEL?.trim() || "openai/gpt-oss-20b"])];
  let cursor = 0;
  return {
    configured: !!geminiKey || !!groqKeys.length,
    async complete(system: string, messages: AIMessage[]): Promise<{ content: string; provider: AIProvider; model: string }> {
      let lastStatus = 0;
      if (geminiKey) {
        try {
          const model = geminiModel.replace(/^models\//, "");
          const response = await request(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
            method: "POST",
            headers: { "x-goog-api-key": geminiKey, "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: system }] },
              contents: messages.map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
              generationConfig: { responseMimeType: "application/json", temperature: 0.3, maxOutputTokens: 4096 },
            }),
            signal: AbortSignal.timeout(12_000),
          });
          lastStatus = response.status;
          if (response.ok) {
            const data = await response.json();
            const content = (data.candidates?.[0]?.content?.parts ?? [])
              .filter((part: { text?: unknown; thought?: boolean }) => typeof part.text === "string" && !part.thought)
              .map((part: { text: string }) => part.text).join("");
            if (usable(content)) return { content, provider: "Gemini", model };
            lastStatus = 502;
          }
        } catch { lastStatus = 502; }
      }
      for (const model of groqModels) {
        for (let i = 0; i < groqKeys.length; i++) {
          try {
            const response = await request("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: { Authorization: `Bearer ${groqKeys[(cursor + i) % groqKeys.length]}`, "Content-Type": "application/json" },
              body: JSON.stringify({ model, messages: [{ role: "system", content: system }, ...messages], response_format: { type: "json_object" }, reasoning_effort: "low", temperature: 0.3, max_completion_tokens: 3000 }),
              signal: AbortSignal.timeout(25_000),
            });
            lastStatus = response.status;
            if (response.ok) {
              const data = await response.json();
              const content = String(data.choices?.[0]?.message?.content ?? "");
              if (usable(content)) {
                cursor = (cursor + i + 1) % groqKeys.length;
                return { content, provider: "Groq", model };
              }
              lastStatus = 502;
            }
            if ([400, 404].includes(lastStatus)) break;
          } catch { lastStatus = 502; }
        }
      }
      throw Object.assign(new Error("AI providers unavailable"), { status: lastStatus });
    },
  };
}
