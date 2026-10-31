"use client";

import { useToolInput } from "@/components/useToolInput";
import { useState } from "react";


function parse(ua: string) {
  const find = (rules: [RegExp, string][]) => {
    for (const [re, name] of rules) {
      const m = re.exec(ua);
      if (m) return m[1] ? `${name} ${m[1].replace(/_/g, ".")}` : name;
    }
    return "Unknown";
  };
  return {
    Browser: find([
      [/Edg\/([\d.]+)/, "Edge"], [/OPR\/([\d.]+)/, "Opera"], [/SamsungBrowser\/([\d.]+)/, "Samsung Internet"],
      [/Firefox\/([\d.]+)/, "Firefox"], [/Chrome\/([\d.]+)/, "Chrome"], [/Version\/([\d.]+).*Safari/, "Safari"],
    ]),
    Engine: find([[/Gecko\/\d+.*Firefox/, "Gecko"], [/AppleWebKit\/[\d.]+.*Chrome/, "Blink"], [/AppleWebKit\/([\d.]+)/, "WebKit"]]),
    OS: find([
      [/Windows NT ([\d.]+)/, "Windows NT"], [/Android ([\d.]+)/, "Android"], [/iPhone OS ([\d_]+)/, "iOS"],
      [/iPad.*OS ([\d_]+)/, "iPadOS"], [/Mac OS X ([\d_.]+)/, "macOS"], [/CrOS/, "ChromeOS"], [/Linux/, "Linux"],
    ]),
    Device: /Mobi|iPhone|Android.*Mobile/.test(ua) ? "Mobile" : /iPad|Tablet|Android/.test(ua) ? "Tablet" : /bot|crawl|spider/i.test(ua) ? "Bot" : "Desktop",
  };
}

export default function UserAgent() {
  const [ua, setUa] = useState(() => navigator.userAgent);
  useToolInput("user-agent", (settings) => {
    if (settings.ua !== undefined) setUa(settings.ua as typeof ua);
  });
  return (
    <>
      <textarea rows={3} value={ua} onChange={(e) => setUa(e.target.value)} />
      <div className="stats">
        {Object.entries(parse(ua)).map(([k, v]) => (
          <div key={k} className="stat"><div className="stat-label">{k}</div><div style={{ fontWeight: 650 }}>{v}</div></div>
        ))}
      </div>
      <button className="btn btn-ghost" style={{ alignSelf: "flex-start" }} onClick={() => setUa(navigator.userAgent)}>Use my browser</button>
    </>
  );
}
