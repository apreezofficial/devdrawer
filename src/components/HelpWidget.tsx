"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { renderMarkdown } from "@/lib/markdown";
import { getTool } from "@/tools/registry";

type Msg = { role: "user" | "assistant"; content: string; tool?: string; input?: string; error?: boolean };

const SUGGESTIONS = [
  "50 fake users with email and city as CSV",
  "Regex that matches emails but not gmail",
  "Cron for every weekday at 9:30am",
  "Explain: TypeError: Cannot read properties of undefined (reading 'map')",
];

const STORE = "devdrawer:chat";

/** Animated gradient orb used on the launcher and in the panel header. */
function Orb({ size = 18 }: { size?: number }) {
  return <span className="orb" style={{ width: size, height: size }} aria-hidden="true" />;
}

export function HelpWidget() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Keep the conversation for this tab session only.
  useEffect(() => {
    try { setMessages(JSON.parse(sessionStorage.getItem(STORE) || "[]")); } catch { /* storage blocked */ }
    const onOpen = (e: Event) => {
      setOpen(true);
      const q = (e as CustomEvent<string>).detail;
      if (q) setInput(q);
    };
    window.addEventListener("devdrawer:ask", onOpen);
    return () => window.removeEventListener("devdrawer:ask", onOpen);
  }, []);

  useEffect(() => {
    try { sessionStorage.setItem(STORE, JSON.stringify(messages.slice(-30))); } catch { /* storage blocked */ }
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    const next = [...messages.filter((m) => !m.error), { role: "user" as const, content: q }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setMessages((m) => [...m, { role: "assistant", content: data.reply || "Here you go.", tool: data.tool, input: data.input }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: (e as Error).message, error: true }]);
    } finally {
      setBusy(false);
    }
  };

  const openTool = (slug: string, seed?: string) => {
    try { if (seed) sessionStorage.setItem("devdrawer:seed", seed); } catch { /* storage blocked */ }
    router.push(`/tools/${slug}`);
  };

  return (
    <>
      {open && (
        <div className="help-panel" role="dialog" aria-label="devdrawer AI">
          <div className="help-head">
            <Orb size={22} />
            <div className="help-title">
              <strong>devdrawer AI</strong>
              <span>{busy ? "Thinking…" : "Online · usually instant"}</span>
            </div>
            <button className="help-icon" onClick={() => setMessages([])} title="New chat" aria-label="New chat">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            </button>
            <button className="help-icon" onClick={() => setOpen(false)} title="Close" aria-label="Close">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          </div>

          <div className="help-body" ref={bodyRef}>
            <div className="help-msg ai">
              <p>Hi! What do you need? I can write regexes, cron and SQL, explain errors, and open the right tool for you.</p>
            </div>
            {!messages.length && (
              <div className="help-suggest">
                {SUGGESTIONS.map((s) => <button key={s} onClick={() => send(s)}>{s}</button>)}
              </div>
            )}
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="help-msg user">{m.content}</div>
              ) : (
                <div key={i} className={`help-msg ai ${m.error ? "err" : ""}`}>
                  <div className="md" dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }} />
                  {m.tool && getTool(m.tool) && (
                    <button className="help-tool" onClick={() => openTool(m.tool!, m.input)}>
                      Open {getTool(m.tool)!.name}{m.input ? " with this" : ""} →
                    </button>
                  )}
                </div>
              ),
            )}
            {busy && <div className="help-msg ai"><span className="typing"><i /><i /><i /></span></div>}
          </div>

          <form className="help-input" onSubmit={(e) => { e.preventDefault(); send(input); }}>
            <textarea
              ref={inputRef}
              rows={1}
              placeholder="Type your message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
              maxLength={6000}
            />
            <button type="submit" className="help-send" disabled={!input.trim() || busy} aria-label="Send">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
            </button>
          </form>
          <div className="help-foot">Powered by Groq · Don&apos;t paste passwords or keys</div>
        </div>
      )}

      <button className={`help-launch ${open ? "is-open" : ""}`} onClick={() => setOpen((o) => !o)} aria-label={open ? "Close help" : "Need help?"}>
        {open ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
        ) : (
          <><Orb /> <span>Need help?</span></>
        )}
      </button>
    </>
  );
}
