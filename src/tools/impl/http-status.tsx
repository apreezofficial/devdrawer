"use client";

import { useSeed } from "@/components/ui";

const CODES: [number, string, string][] = [
  [100, "Continue", "Keep sending the request body."],
  [101, "Switching Protocols", "Server is switching protocols, e.g. to WebSocket."],
  [103, "Early Hints", "Preload resources while the server prepares a response."],
  [200, "OK", "The request succeeded."],
  [201, "Created", "A new resource was created."],
  [202, "Accepted", "Accepted for processing, not finished yet."],
  [204, "No Content", "Success, with no body to return."],
  [206, "Partial Content", "Returning part of the resource (Range requests)."],
  [301, "Moved Permanently", "The resource has a new permanent URL."],
  [302, "Found", "Temporary redirect."],
  [304, "Not Modified", "Use your cached copy."],
  [307, "Temporary Redirect", "Redirect, keeping the same method and body."],
  [308, "Permanent Redirect", "Permanent redirect, keeping the same method and body."],
  [400, "Bad Request", "The request is malformed."],
  [401, "Unauthorized", "Authentication is required or failed."],
  [403, "Forbidden", "Authenticated, but not allowed."],
  [404, "Not Found", "No resource at this URL."],
  [405, "Method Not Allowed", "This HTTP method isn't supported here."],
  [406, "Not Acceptable", "Can't produce a response matching the Accept headers."],
  [408, "Request Timeout", "The client took too long."],
  [409, "Conflict", "Conflicts with the current state, e.g. an edit clash."],
  [410, "Gone", "The resource was deleted permanently."],
  [413, "Content Too Large", "The request body is too big."],
  [415, "Unsupported Media Type", "The Content-Type isn't supported."],
  [418, "I'm a teapot", "An April Fools' joke that stuck."],
  [422, "Unprocessable Content", "Well-formed, but fails validation."],
  [425, "Too Early", "Refusing to process a request that might be replayed."],
  [429, "Too Many Requests", "Rate limited. Slow down."],
  [431, "Request Header Fields Too Large", "Headers are too big."],
  [451, "Unavailable For Legal Reasons", "Blocked for legal reasons."],
  [500, "Internal Server Error", "Something broke on the server."],
  [501, "Not Implemented", "The server doesn't support this feature."],
  [502, "Bad Gateway", "Got an invalid response from an upstream server."],
  [503, "Service Unavailable", "Overloaded or down for maintenance."],
  [504, "Gateway Timeout", "The upstream server didn't respond in time."],
];

const tone = (c: number) => (c < 300 ? "var(--ok)" : c < 400 ? "var(--accent)" : c < 500 ? "orange" : "var(--danger)");

export default function HttpStatus() {
  const [q, setQ] = useSeed("");
  const s = q.trim().toLowerCase();
  const list = CODES.filter(([c, n, d]) => !s || String(c).startsWith(s) || n.toLowerCase().includes(s) || d.toLowerCase().includes(s));
  return (
    <>
      <input type="search" placeholder="Search by code or meaning (404, rate, redirect…)" value={q} onChange={(e) => setQ(e.target.value)} />
      <table>
        <tbody>
          {list.map(([c, n, d]) => (
            <tr key={c}>
              <td style={{ width: 64, fontWeight: 700, color: tone(c), fontFamily: "var(--mono)" }}>{c}</td>
              <td style={{ width: 240, fontWeight: 600 }}>{n}</td>
              <td className="field-hint">{d}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!list.length && <p className="field-hint">No status matches.</p>}
    </>
  );
}
