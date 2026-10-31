"use client";

import { useToolInput } from "@/components/useToolInput";
import { useEffect, useRef, useState } from "react";
import { ErrorText, Field, Row } from "@/components/ui";

/**
 * Chrome cuts long utterances off after ~15s and online voices can stall, so speech is
 * queued as short sentence-sized chunks.
 */
function chunk(text: string, max = 180) {
  const parts = text.replace(/\s+/g, " ").match(/[^.!?;:\n]+[.!?;:]*\s*/g) ?? [text];
  const out: string[] = [];
  for (const p of parts) {
    if (p.length <= max) { out.push(p); continue; }
    let rest = p;
    while (rest.length > max) {
      const cut = rest.lastIndexOf(" ", max);
      out.push(rest.slice(0, cut > 40 ? cut : max));
      rest = rest.slice(cut > 40 ? cut : max);
    }
    if (rest.trim()) out.push(rest);
  }
  return out.filter((s) => s.trim());
}

/** Prefer an on-device voice in the user's language; online voices fail silently offline. */
function pickDefault(voices: SpeechSynthesisVoice[]) {
  const lang = navigator.language.toLowerCase();
  const local = voices.filter((v) => v.localService);
  return (
    local.find((v) => v.default) ??
    local.find((v) => v.lang.toLowerCase() === lang) ??
    local.find((v) => v.lang.toLowerCase().startsWith(lang.split("-")[0])) ??
    local[0] ?? voices.find((v) => v.default) ?? voices[0]
  );
}

export default function TextToSpeech() {
  const [text, setText] = useState("Hello! devdrawer can read any text aloud, right in your browser.");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voice, setVoice] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [state, setState] = useState<"idle" | "speaking" | "paused">("idle");
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  useToolInput("text-to-speech", (settings) => {
    if (settings.text !== undefined) setText(settings.text as typeof text);
    if (settings.rate !== undefined) setRate(settings.rate as typeof rate);
    if (settings.pitch !== undefined) setPitch(settings.pitch as typeof pitch);
  });
  // Holding references stops Chrome from garbage-collecting utterances mid-speech.
  const queue = useRef<SpeechSynthesisUtterance[]>([]);
  const run = useRef(0);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    if (!supported) return;
    const load = () => {
      const list = speechSynthesis.getVoices();
      setVoices(list);
      setVoice((v) => v || pickDefault(list)?.voiceURI || "");
    };
    load();
    speechSynthesis.addEventListener("voiceschanged", load);
    return () => { speechSynthesis.removeEventListener("voiceschanged", load); speechSynthesis.cancel(); };
  }, [supported]);

  const stop = () => {
    run.current++;
    queue.current = [];
    speechSynthesis.cancel();
    setState("idle");
    setProgress("");
  };

  const speak = () => {
    stop();
    setError("");
    const id = run.current;
    const parts = chunk(text);
    const v = voices.find((x) => x.voiceURI === voice);
    queue.current = parts.map((p, i) => {
      const u = new SpeechSynthesisUtterance(p);
      if (v) { u.voice = v; u.lang = v.lang; }
      u.rate = rate;
      u.pitch = pitch;
      u.onstart = () => { if (run.current === id) { setState("speaking"); setProgress(parts.length > 1 ? `${i + 1} / ${parts.length}` : ""); } };
      u.onend = () => { if (run.current === id && i === parts.length - 1) { setState("idle"); setProgress(""); } };
      u.onerror = (e) => {
        // "interrupted"/"canceled" are expected when the user stops or restarts.
        if (run.current !== id || e.error === "interrupted" || e.error === "canceled") return;
        setError(`Speech failed (${e.error}). ${v && !v.localService ? "This is an online voice; try one marked (offline)." : "Try another voice."}`);
        setState("idle");
      };
      return u;
    });
    // Chrome can drop a speak() issued in the same tick as cancel(); give it a beat.
    setTimeout(() => {
      if (run.current !== id) return;
      speechSynthesis.resume();
      queue.current.forEach((u) => speechSynthesis.speak(u));
      setState("speaking");
    }, 60);
  };

  if (!supported) return <ErrorText>Your browser doesn&apos;t support speech synthesis.</ErrorText>;

  return (
    <>
      <textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} style={{ fontFamily: "inherit", fontSize: 15 }} />
      <Row>
        <Field label="Voice" hint={voices.length ? undefined : "No voices found. Your OS may need a speech voice installed."}>
          <select value={voice} onChange={(e) => setVoice(e.target.value)}>
            {voices.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang}){v.localService ? " · offline" : " · online"}</option>)}
          </select>
        </Field>
        <Field label={`Speed: ${rate}×`}><input type="range" min={0.5} max={2} step={0.1} value={rate} onChange={(e) => setRate(+e.target.value)} /></Field>
        <Field label={`Pitch: ${pitch}`}><input type="range" min={0} max={2} step={0.1} value={pitch} onChange={(e) => setPitch(+e.target.value)} /></Field>
      </Row>
      <div className="btn-group">
        <button className="btn" onClick={speak} disabled={!text.trim()}>▶ {state === "idle" ? "Speak" : "Restart"}</button>
        {state === "paused"
          ? <button className="btn btn-ghost" onClick={() => { speechSynthesis.resume(); setState("speaking"); }}>Resume</button>
          : <button className="btn btn-ghost" onClick={() => { speechSynthesis.pause(); setState("paused"); }} disabled={state !== "speaking"}>Pause</button>}
        <button className="btn btn-ghost" onClick={stop} disabled={state === "idle"}>Stop</button>
        {progress && <span className="field-hint" style={{ alignSelf: "center" }}>Part {progress}</span>}
      </div>
      <ErrorText>{error}</ErrorText>
    </>
  );
}
