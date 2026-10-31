import { decodeToolInput, encodeToolInput, TOOL_INPUTS } from "./tool-input";

export function parseAIResponse(content: string, allowed = Object.keys(TOOL_INPUTS)) {
  try {
    const cleaned = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    const obj = JSON.parse(cleaned);
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) throw new Error("Expected an object");
    const tool = typeof obj.tool === "string" && allowed.includes(obj.tool) ? obj.tool : undefined;
    let input: string | undefined;
    if (tool) {
      if (obj.settings !== undefined) input = encodeToolInput(tool, obj.settings);
      else if (typeof obj.input === "string") {
        const settings = decodeToolInput(tool, obj.input);
        if (settings) input = encodeToolInput(tool, settings);
      }
    }
    let reply = typeof obj.reply === "string" ? obj.reply : "";
    if (tool && (obj.settings !== undefined || obj.input !== undefined) && !input) {
      reply += "\n\nI couldn't apply those settings. Open the tool and enter them directly.";
    }
    return { reply, tool, input };
  } catch {
    // Never display internal settings JSON as though it were an answer.
    return { reply: "I couldn't read that response. Please try again.", tool: undefined, input: undefined };
  }
}
