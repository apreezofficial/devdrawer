import type { Metadata } from "next";
import Link from "next/link";
import { ApiPlayground } from "@/components/ApiPlayground";
import { SITE_NAME, SITE_URL } from "@/config";
import { apiDocs } from "@/lib/api-tools";

export const metadata: Metadata = {
  title: "API · free developer tools over HTTP",
  description: "Call devdrawer's developer tools from your own code. Free JSON API for UUIDs, hashes, Base64, regex, timestamps, colors and more.",
  alternates: { canonical: "/api" },
};

const tools = apiDocs();

export default function ApiPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebAPI",
    name: `${SITE_NAME} API`,
    url: `${SITE_URL}/api`,
    documentation: `${SITE_URL}/api`,
    description: "Free JSON API for developer tools.",
  };
  return (
    <div className="api-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="api-hero">
        <span className="api-eyebrow">API · v1</span>
        <h1>Developer tools,<br /><span>one HTTP call away.</span></h1>
        <p>Generate UUIDs, hash text, convert timestamps and test regexes from your own code. Send JSON, get JSON back. Free to use, no key needed.</p>
        <div className="api-hero-cta">
          <a className="api-btn" href="#playground">Try it below</a>
          <Link className="api-btn ghost" href="/#tools">Browse the tools</Link>
        </div>
      </section>

      <section className="api-section">
        <h2>Quick start</h2>
        <div className="api-panel">
          <div className="api-panel-bar"><span>Generate a UUID</span><span className="api-muted">curl</span></div>
          <pre className="api-code">{`curl -X POST ${SITE_URL}/api/v1/uuid \\
  -H "Content-Type: application/json" \\
  -d '{"version": "v7", "count": 2}'`}</pre>
          <pre className="api-code api-code-out">{`{
  "tool": "uuid",
  "result": { "ids": ["019…", "019…"] }
}`}</pre>
        </div>
      </section>

      <section className="api-section" id="playground">
        <h2>Playground</h2>
        <p className="api-lead">Pick an endpoint, edit the request, and send it. The code samples update as you type.</p>
        <ApiPlayground tools={tools} />
      </section>

      <section className="api-section api-grid3">
        <div className="api-card">
          <h3>Plain JSON in, JSON out</h3>
          <p>Every endpoint takes a JSON object and returns <code>{"{ tool, result }"}</code>. Errors come back as <code>{"{ error }"}</code> with a 4xx or 5xx status.</p>
        </div>
        <div className="api-card">
          <h3>CORS enabled</h3>
          <p>Call the API straight from a browser page on any domain. There are no cookies or accounts to deal with.</p>
        </div>
        <div className="api-card">
          <h3>Nothing stored</h3>
          <p>Inputs are used for the one request and never written to disk or logs. Generated secrets are made fresh on every call.</p>
        </div>
      </section>

      <section className="api-section">
        <h2>Privacy & limits</h2>
        <div className="api-panel api-notice">
          <p>
            <strong>The API runs on our server.</strong> Unlike the web tools, which run entirely in your browser, the text you send to an
            API endpoint is processed on devdrawer&apos;s server for that single request. Don&apos;t send passwords, production keys or other secrets you
            wouldn&apos;t send to a third party. Use the web tools for those.
          </p>
          <p>Each IP address gets 60 requests a minute. Inputs are capped at 20,000 characters, and request bodies at 60 KB.</p>
        </div>
      </section>

      <section className="api-section">
        <h2>Endpoints</h2>
        <div className="api-endpoints">
          {tools.map((t) => (
            <Link key={t.slug} href={`/api#playground`} className="api-endpoint-row">
              <span className="api-method">POST</span>
              <code>/api/v1/{t.slug}</code>
              <span>{t.description}</span>
            </Link>
          ))}
        </div>
        <p className="api-muted">
          List everything as JSON at <code>GET /api/v1</code>, or fetch one tool&apos;s docs at <code>GET /api/v1/&lt;tool&gt;</code>.
        </p>
      </section>

      <footer className="api-foot">
        <span>{SITE_NAME} API · v1</span>
        <Link href="/">Back to all tools →</Link>
      </footer>
    </div>
  );
}
