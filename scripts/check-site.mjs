#!/usr/bin/env node
// Pre-deploy smoke test for the static site.
// Runs in CI before every Firebase Hosting deploy; a failure blocks the deploy.
//
//   node scripts/check-site.mjs
//
// Checks are deliberately cheap and dependency-free: they catch the mistakes
// that actually happen on a hand-written static site (a renamed file leaving a
// dead link, a sitemap entry pointing at nothing, a stray localhost URL).

import { readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SITE_ORIGIN = "https://postui.org";

const failures = [];
const checks = [];

function check(name, fn) {
  try {
    fn();
    checks.push(`  ok    ${name}`);
  } catch (err) {
    checks.push(`  FAIL  ${name}`);
    failures.push(`${name}: ${err.message}`);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

// --- firebase.json -----------------------------------------------------------

const config = JSON.parse(readFileSync(join(root, "firebase.json"), "utf8"));
const hosting = Array.isArray(config.hosting) ? config.hosting[0] : config.hosting;
const publicDir = join(root, hosting.public);
const cleanUrls = hosting.cleanUrls === true;

check("firebase.json declares a hosting public directory that exists", () => {
  assert(hosting?.public, "hosting.public is not set");
  assert(existsSync(publicDir) && statSync(publicDir).isDirectory(), `${hosting.public}/ is missing`);
});

// --- required files ----------------------------------------------------------

const required = ["index.html", "manifesto.html", "robots.txt", "sitemap.xml"];
for (const file of required) {
  check(`${file} is present`, () => {
    assert(existsSync(join(publicDir, file)), `${file} not found in ${hosting.public}/`);
  });
}

// --- link resolution ---------------------------------------------------------

// Mirrors Firebase Hosting's cleanUrls behaviour: /manifesto serves manifesto.html,
// and / serves index.html.
function resolvesToFile(urlPath) {
  const clean = urlPath.split(/[?#]/)[0];
  const rel = clean.replace(/^\//, "");
  const candidates = [rel, join(rel, "index.html")];
  if (cleanUrls && rel && !rel.includes(".")) candidates.push(`${rel}.html`);
  if (rel === "") candidates.push("index.html");
  return candidates.some((c) => c && existsSync(join(publicDir, c)));
}

const htmlFiles = required.filter((f) => f.endsWith(".html"));

for (const file of htmlFiles) {
  // A missing file is already reported by the presence check above; skip the
  // content checks rather than crashing so the whole report still prints.
  if (!existsSync(join(publicDir, file))) continue;
  const html = readFileSync(join(publicDir, file), "utf8");

  check(`${file} has a non-empty <title>`, () => {
    const m = html.match(/<title>([^<]*)<\/title>/i);
    assert(m && m[1].trim().length > 0, "no <title> found");
  });

  check(`${file} declares a canonical URL on ${SITE_ORIGIN}`, () => {
    const m = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i);
    assert(m, "no rel=canonical link found");
    const href = m[0].match(/href=["']([^"']+)["']/i);
    assert(href, "canonical link has no href");
    assert(
      href[1].startsWith(SITE_ORIGIN),
      `canonical points at ${href[1]}, expected an ${SITE_ORIGIN} URL`,
    );
  });

  check(`${file} internal links all resolve to a file`, () => {
    const hrefs = [...html.matchAll(/href=["'](\/[^"']*)["']/g)].map((m) => m[1]);
    const dead = [...new Set(hrefs)].filter((h) => !resolvesToFile(h));
    assert(dead.length === 0, `dead internal link(s): ${dead.join(", ")}`);
  });

  check(`${file} contains no localhost or staging URLs`, () => {
    const bad = [...html.matchAll(/https?:\/\/(localhost|127\.0\.0\.1)[^\s"']*/g)].map((m) => m[0]);
    assert(bad.length === 0, `found ${bad.join(", ")}`);
  });
}

// --- sitemap + robots --------------------------------------------------------

check("every sitemap <loc> resolves to a real page", () => {
  assert(existsSync(join(publicDir, "sitemap.xml")), "sitemap.xml is missing");
  const xml = readFileSync(join(publicDir, "sitemap.xml"), "utf8");
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  assert(locs.length > 0, "sitemap.xml lists no URLs");

  const foreign = locs.filter((l) => !l.startsWith(SITE_ORIGIN));
  assert(foreign.length === 0, `sitemap lists non-${SITE_ORIGIN} URLs: ${foreign.join(", ")}`);

  const dead = locs.filter((l) => !resolvesToFile(new URL(l).pathname));
  assert(dead.length === 0, `sitemap points at missing page(s): ${dead.join(", ")}`);
});

check("robots.txt points at the sitemap on the canonical origin", () => {
  assert(existsSync(join(publicDir, "robots.txt")), "robots.txt is missing");
  const txt = readFileSync(join(publicDir, "robots.txt"), "utf8");
  assert(
    txt.includes(`${SITE_ORIGIN}/sitemap.xml`),
    `robots.txt does not reference ${SITE_ORIGIN}/sitemap.xml`,
  );
});

// --- report ------------------------------------------------------------------

console.log(`site checks (${hosting.public}/)\n`);
console.log(checks.join("\n"));

if (failures.length > 0) {
  console.error(`\n${failures.length} check(s) failed:\n`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(`\nAll ${checks.length} checks passed.`);
