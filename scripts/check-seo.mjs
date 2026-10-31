import assert from 'node:assert/strict';
import { tools } from '../src/tools/registry.ts';
import { SITE_URL } from '../src/config.ts';

// Run after starting a production build: npm run check:seo -- http://localhost:3107
const origin = new URL(process.argv[2] || 'http://localhost:3107');
const token = '6oOtFBAfrY_VNePuX9khruR2TSwXjHBwuLeEMPBLvW8';
const pages = ['/', ...tools.filter(t => t.status === 'ready').map(t => `/tools/${t.slug}`)];
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, 'gi'))].map(match =>
  Object.fromEntries([...match[1].matchAll(/([\w:-]+)=(?:"([^"]*)"|'([^']*)')/g)].map(a => [a[1].toLowerCase(), a[2] ?? a[3]])),
);
const fetchPage = async path => {
  const response = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(15_000) });
  assert.equal(response.status, 200, path);
  assert.ok(!/noindex/i.test(response.headers.get('x-robots-tag') || ''), `Header blocks indexing: ${path}`);
  return response.text();
};
const sitemap = await fetchPage('/sitemap.xml');
const listed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace(/\/$/, ''));
assert.deepEqual(listed.sort(), pages.map(path => new URL(path, SITE_URL).href.replace(/\/$/, '')).sort());
assert.equal(new Set(listed).size, pages.length, 'Sitemap contains duplicate URLs');
const robots = await fetchPage('/robots.txt');
assert.ok(robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`));
assert.match(robots, /Allow: \/(?:\r?\n|$)/);
assert.ok(!/^Disallow:\s*\/$/m.test(robots), 'robots.txt blocks the whole site');
const titles = new Set(), descriptions = new Set();
let homepage;
for (const path of pages) {
  const html = await fetchPage(path);
  if (path === '/') homepage = html;
  const meta = tags(html, 'meta');
  const canonical = tags(html, 'link').filter(tag => tag.rel === 'canonical');
  assert.equal(canonical.length, 1, `Expected one canonical: ${path}`);
  assert.equal(canonical[0].href.replace(/\/$/, ''), new URL(path, SITE_URL).href.replace(/\/$/, ''), `Wrong canonical: ${path}`);
  assert.equal(meta.filter(tag => tag.name === 'google-site-verification' && tag.content === token).length, 1, `Missing verification: ${path}`);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1];
  const description = meta.find(tag => tag.name === 'description')?.content;
  assert.ok(title && !titles.has(title), `Missing or duplicate title: ${path}`);
  assert.ok(description && !descriptions.has(description), `Missing or duplicate description: ${path}`);
  titles.add(title); descriptions.add(description);
  assert.ok(!meta.some(tag => /^(robots|googlebot)$/.test(tag.name || '') && /noindex|nofollow/i.test(tag.content)), `Metadata blocks indexing: ${path}`);
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `Expected one H1: ${path}`);
  const data = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].flatMap(m => JSON.parse(m[1]));
  assert.ok(data.some(item => item['@type'] === (path === '/' ? 'WebSite' : 'WebApplication')), `Missing structured data: ${path}`);
}
const linked = new Set(tags(homepage, 'a').map(tag => tag.href));
for (const path of pages.slice(1)) assert.ok(linked.has(path) || linked.has(new URL(path, SITE_URL).href), `Tool has no server-rendered homepage link: ${path}`);
const missing = await fetch(new URL('/tools/not-a-real-tool', origin));
assert.equal(missing.status, 404, 'Unknown tool must return HTTP 404');
console.log(`SEO checks passed for ${pages.length} pages: verification, canonicals, unique metadata, indexing directives, headings, structured data, homepage links, sitemap, robots.txt and 404 handling.`);
