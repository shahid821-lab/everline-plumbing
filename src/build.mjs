#!/usr/bin/env node
/* =============================================================
   STANDALONE BUILD — zero dependencies. Node 18+.
   Reads /src (.env, content.html, theme.css, base.css, app.js, assets)
   and writes the static site to the repo ROOT, ready for Cloudflare Pages.
     node src/build.mjs
   ============================================================= */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = dirname(fileURLToPath(import.meta.url)); // /src
const ROOT = join(SRC, "..");                        // repo root (Pages output dir)

function parseEnv(text) {
  const out = {};
  for (let line of text.split(/\r?\n/)) {
    line = line.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    out[key] = val;
  }
  return out;
}
function derive(env) {
  const d = { ...env };
  if (env.PHONE) {
    const g = env.PHONE.replace(/[^\d]/g, "");
    d.PHONE_TEL = (g.length === 11 && g[0] === "1") ? "+" + g : (g.length === 10 ? "+1" + g : "+" + g);
  }
  d.YEAR = String(new Date().getFullYear());
  return d;
}
const render = (tpl, d) => tpl.replace(/\{\{\s*([A-Z0-9_]+)\s*\}\}/g, (m, k) => (k in d ? d[k] : ""));
function copyDir(s, dst) {
  if (!existsSync(s)) return;
  mkdirSync(dst, { recursive: true });
  for (const n of readdirSync(s)) {
    const a = join(s, n), b = join(dst, n);
    statSync(a).isDirectory() ? copyDir(a, b) : copyFileSync(a, b);
  }
}
function faviconSvg(d) {
  const a = d.BRAND_PRIMARY || "#0369a1", b = d.BRAND_DARK || "#08324d";
  const letter = (d.FAVICON_LETTER || d.BRAND_NAME || "E").trim()[0].toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#g)"/><text x="32" y="44" font-family="Manrope,Arial,sans-serif" font-size="36" font-weight="800" fill="#fff" text-anchor="middle">${letter}</text></svg>`;
}
function legalShell(title, bodyHtml, d) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} · ${d.BRAND_NAME}</title>
<meta name="robots" content="noindex">
<link rel="stylesheet" href="base.css"><link rel="stylesheet" href="theme.css">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(faviconSvg(d))}">
<style>.legal{max-width:760px;margin:0 auto;padding:clamp(3rem,8vw,6rem) 1.2rem}
.legal h1{font-size:clamp(2rem,4vw,3rem);margin-bottom:1.4rem}
.legal h2{font-size:1.35rem;margin:2.2rem 0 .8rem}
.legal p,.legal li{color:var(--ink-soft);margin-bottom:.9rem;line-height:1.7}
.legal ul{padding-left:1.2rem;list-style:disc}.legal a{color:var(--brand-700);font-weight:600}
.legal .back{display:inline-flex;gap:.4rem;margin-bottom:2rem;font-weight:700;color:var(--brand-700)}</style>
</head><body>
<main class="legal">
<a class="back" href="index.html">&larr; Back to ${d.BRAND_NAME}</a>
${bodyHtml}
<p style="margin-top:2.5rem;font-size:.85rem;color:var(--ink-faint)">Last updated: ${d.YEAR}. Questions? Call
<a href="tel:${d.PHONE_TEL}">${d.PHONE}</a> or email <a href="mailto:${d.EMAIL}">${d.EMAIL}</a>.</p>
</main></body></html>`;
}
const privacyBody = (d) => `<h1>Privacy Policy</h1>
<p>${d.BRAND_NAME} ("we", "us") respects your privacy. This policy explains what we collect when you call or visit ${d.SITE_URL || "our website"}, and how we use it.</p>
<h2>Information we collect</h2>
<p>Because this is a call-first service, we do not operate web forms. When you telephone ${d.PHONE}, standard call information (your phone number, call time, and the details you choose to share with our representatives) may be recorded for quality and compliance.</p>
<h2>How we use information</h2>
<ul><li>To answer your questions and provide ${d.VERTICAL_NOUN || "our services"}.</li>
<li>To meet legal and quality-assurance obligations.</li>
<li>We do not sell your personal information.</li></ul>
<h2>Your choices</h2>
<p>You may request that we delete your information or stop contacting you at any time by calling <a href="tel:${d.PHONE_TEL}">${d.PHONE}</a>.</p>
<h2>Contact</h2>
<p>${d.BRAND_NAME}<br>${d.ADDRESS}<br>${d.PHONE} · ${d.EMAIL}</p>`;
const termsBody = (d) => `<h1>Terms of Service</h1>
<p>By using ${d.SITE_URL || "this website"} and contacting ${d.BRAND_NAME}, you agree to these terms.</p>
<h2>Informational purpose</h2>
<p>All content is provided for general information about ${d.VERTICAL_NOUN || "our services"}. ${d.LEGAL_NOTE || ""}</p>
<h2>No guarantees</h2>
<p>Scope, pricing, and scheduling are confirmed only by speaking with a representative and are subject to change.</p>
<h2>Intellectual property</h2>
<p>All trademarks, logos, and content on this site are the property of ${d.BRAND_NAME} or their respective owners. Photos are illustrative.</p>
<h2>Contact</h2>
<p>${d.BRAND_NAME}<br>${d.ADDRESS}<br><a href="tel:${d.PHONE_TEL}">${d.PHONE}</a> · ${d.EMAIL}</p>`;
const notFoundBody = (d) => `<div style="text-align:center"><h1>404 — Page not found</h1>
<p>The page you're looking for doesn't exist. Let's get you help instead.</p>
<p style="margin-top:2rem"><a class="btn btn-primary" href="index.html">Return home</a>
&nbsp; <a class="btn btn-ghost" href="tel:${d.PHONE_TEL}">Call ${d.PHONE}</a></p></div>`;
const robots = (d) => `User-agent: *\nAllow: /\nDisallow: /privacy.html\nDisallow: /terms.html\n\nSitemap: ${(d.SITE_URL || "").replace(/\/$/, "")}/sitemap.xml\n`;
const sitemap = (d) => {
  const base = (d.SITE_URL || "").replace(/\/$/, "");
  const today = new Date().toISOString().slice(0, 10);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${base}/</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>\n</urlset>\n`;
};

const env = derive(parseEnv(readFileSync(join(SRC, ".env"), "utf8")));
const tpl = readFileSync(join(SRC, "content.html"), "utf8");
writeFileSync(join(ROOT, "index.html"), render(tpl, env));
copyFileSync(join(SRC, "base.css"), join(ROOT, "base.css"));
copyFileSync(join(SRC, "app.js"), join(ROOT, "app.js"));
copyFileSync(join(SRC, "theme.css"), join(ROOT, "theme.css"));
copyDir(join(SRC, "assets"), join(ROOT, "assets"));
writeFileSync(join(ROOT, "privacy.html"), legalShell("Privacy Policy", privacyBody(env), env));
writeFileSync(join(ROOT, "terms.html"), legalShell("Terms of Service", termsBody(env), env));
writeFileSync(join(ROOT, "404.html"), legalShell("Page not found", notFoundBody(env), env));
writeFileSync(join(ROOT, "robots.txt"), robots(env));
writeFileSync(join(ROOT, "sitemap.xml"), sitemap(env));
console.log(`✓ Built ${env.BRAND_NAME} → repo root  (${env.PHONE})`);
