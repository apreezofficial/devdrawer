"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { ErrorText, Field, Row } from "@/components/ui";

type Mode = "text" | "wifi" | "email";

export default function QrCodeTool() {
  const [mode, setMode] = useState<Mode>("text");
  const [text, setText] = useState("https://github.com/apreezofficial/devdrawer");
  const [ssid, setSsid] = useState("MyWiFi");
  const [pass, setPass] = useState("");
  const [sec, setSec] = useState("WPA");
  const [email, setEmail] = useState("hello@example.com");
  const [fg, setFg] = useState("#171717");
  const [bg, setBg] = useState("#ffffff");
  const [ecl, setEcl] = useState<"L" | "M" | "Q" | "H">("M");
  const [svg, setSvg] = useState("");
  const [png, setPng] = useState("");
  const [error, setError] = useState("");

  const wifiEsc = (s: string) => s.replace(/([\\;,:"])/g, "\\$1");
  const payload =
    mode === "wifi" ? `WIFI:T:${sec};S:${wifiEsc(ssid)};P:${wifiEsc(pass)};;`
    : mode === "email" ? `mailto:${email}`
    : text;

  useEffect(() => {
    if (!payload) { setSvg(""); setPng(""); return; }
    const opts = { errorCorrectionLevel: ecl, margin: 2, color: { dark: fg, light: bg } };
    Promise.all([QRCode.toString(payload, { ...opts, type: "svg" }), QRCode.toDataURL(payload, { ...opts, width: 1024 })])
      .then(([s, p]) => { setSvg(s); setPng(p); setError(""); })
      .catch((e: Error) => setError(e.message));
  }, [payload, fg, bg, ecl]);

  return (
    <>
      <div className="chips">
        {(["text", "wifi", "email"] as Mode[]).map((m) => (
          <button key={m} className={`chip ${mode === m ? "active" : ""}`} onClick={() => setMode(m)}>{m === "text" ? "Text / URL" : m === "wifi" ? "Wi-Fi" : "Email"}</button>
        ))}
      </div>
      {mode === "text" && <Field label="Text or URL"><textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} /></Field>}
      {mode === "wifi" && (
        <Row>
          <Field label="Network name"><input value={ssid} onChange={(e) => setSsid(e.target.value)} /></Field>
          <Field label="Password"><input value={pass} onChange={(e) => setPass(e.target.value)} /></Field>
          <Field label="Security">
            <select value={sec} onChange={(e) => setSec(e.target.value)}><option>WPA</option><option>WEP</option><option value="nopass">None</option></select>
          </Field>
        </Row>
      )}
      {mode === "email" && <Field label="Email"><input value={email} onChange={(e) => setEmail(e.target.value)} /></Field>}
      <Row>
        <Field label="Foreground"><input type="color" value={fg} onChange={(e) => setFg(e.target.value)} style={{ height: 40, padding: 2 }} /></Field>
        <Field label="Background"><input type="color" value={bg} onChange={(e) => setBg(e.target.value)} style={{ height: 40, padding: 2 }} /></Field>
        <Field label="Error correction">
          <select value={ecl} onChange={(e) => setEcl(e.target.value as typeof ecl)}>
            <option value="L">Low (7%)</option><option value="M">Medium (15%)</option><option value="Q">Quartile (25%)</option><option value="H">High (30%)</option>
          </select>
        </Field>
      </Row>
      <ErrorText>{error}</ErrorText>
      {svg && (
        <>
          <div style={{ width: 240, alignSelf: "center", borderRadius: 20, overflow: "hidden", border: "1px solid var(--border)" }} dangerouslySetInnerHTML={{ __html: svg }} />
          <div className="btn-group" style={{ justifyContent: "center" }}>
            <a className="btn" href={png} download="qr-code.png">Download PNG</a>
            <a className="btn btn-ghost" href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`} download="qr-code.svg">Download SVG</a>
          </div>
        </>
      )}
    </>
  );
}
