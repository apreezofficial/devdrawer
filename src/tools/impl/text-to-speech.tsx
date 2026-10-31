"use client";

import { useEffect, useState } from "react";
import { ErrorText, Field, Row, useSeed } from "@/components/ui";

export default function TextToSpeech() {
  const [text, setText] = useSeed("Hello! AllDevNeedy can read any text aloud, right in your browser.");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voice, setVoice] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    if (!supported) return;
    const load = () => setVoices(speechSynthesis.getVoices());
    load();
    speechSynthesis.addEventListener("voiceschanged", load);
    return () => { speechSynthesis.removeEventListener("voiceschanged", load); speechSynthesis.cancel(); };
  }, [supported]);

  const speak = () => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = voices.find((x) => x.voiceURI === voice);
    if (v) u.voice = v;
    u.rate = rate;
    u.pitch = pitch;
    u.onend = u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    speechSynthesis.speak(u);
  };

  if (!supported) return <ErrorText>Your browser doesn&apos;t support speech synthesis.</ErrorText>;

  return (
    <>
      <textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} style={{ fontFamily: "inherit", fontSize: 15 }} />
      <Row>
        <Field label="Voice">
          <select value={voice} onChange={(e) => setVoice(e.target.value)}>
            <option value="">Default</option>
            {voices.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>)}
          </select>
        </Field>
        <Field label={`Speed: ${rate}×`}><input type="range" min={0.5} max={2} step={0.1} value={rate} onChange={(e) => setRate(+e.target.value)} /></Field>
        <Field label={`Pitch: ${pitch}`}><input type="range" min={0} max={2} step={0.1} value={pitch} onChange={(e) => setPitch(+e.target.value)} /></Field>
      </Row>
      <div className="btn-group">
        <button className="btn" onClick={speak} disabled={!text.trim()}>▶ Speak</button>
        <button className="btn btn-ghost" onClick={() => speechSynthesis.pause()} disabled={!speaking}>Pause</button>
        <button className="btn btn-ghost" onClick={() => speechSynthesis.resume()} disabled={!speaking}>Resume</button>
        <button className="btn btn-ghost" onClick={() => { speechSynthesis.cancel(); setSpeaking(false); }} disabled={!speaking}>Stop</button>
      </div>
    </>
  );
}
