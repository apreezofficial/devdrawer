"use client";

import { ErrorText, Output, useSeed } from "@/components/ui";
import { b64ToUtf8 } from "./base64";

const SAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsbERldk5lZWR5IiwiaWF0IjoxNzMwMDAwMDAwLCJleHAiOjE5MDAwMDAwMDB9.c2lnbmF0dXJl";

function decodePart(part: string) {
  const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(b64ToUtf8(b64 + "=".repeat((4 - (b64.length % 4)) % 4)));
}

export default function JwtTool() {
  const [token, setToken] = useSeed(SAMPLE);
  let header = "", payload = "", error = "", claims: Record<string, unknown> = {};
  try {
    const [h, p] = token.trim().split(".");
    if (!p) throw new Error("A JWT has three parts separated by dots.");
    header = JSON.stringify(decodePart(h), null, 2);
    claims = decodePart(p);
    payload = JSON.stringify(claims, null, 2);
  } catch (e) {
    error = token.trim() ? `Can't decode: ${(e as Error).message}` : "";
  }

  const fmtTime = (k: string) => {
    const v = claims[k];
    return typeof v === "number" ? new Date(v * 1000).toLocaleString() : null;
  };
  const exp = typeof claims.exp === "number" ? claims.exp * 1000 : null;

  return (
    <>
      <textarea rows={4} value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste a JWT…" />
      <ErrorText>{error}</ErrorText>
      {!error && payload && (
        <>
          {exp && (
            <p style={{ margin: 0 }} className={exp < Date.now() ? "error" : "ok"}>
              {exp < Date.now() ? "Expired" : "Valid until"} {fmtTime("exp")}
              {fmtTime("iat") && <span className="field-hint"> · issued {fmtTime("iat")}</span>}
            </p>
          )}
          <div className="row">
            <Output label="Header" value={header} rows={6} />
            <Output label="Payload" value={payload} rows={6} />
          </div>
          <p className="field-hint">Decoding only. The signature is not verified. Never paste production secrets into any website, even this one (though it runs offline).</p>
        </>
      )}
    </>
  );
}
