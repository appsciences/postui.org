// Tests for the PostUI community artifact (artifact/postui.html).
//
//   node --test
//
// The artifact is one HTML file. Its pure logic lives in a separate
// <script id="postui-core"> block that touches no DOM, so these tests pull that
// block out and run it in a vm sandbox. The rest are static checks on the file
// that enforce the spec's conventions (docs/spec.md, Build brief step 6).

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(root, "artifact/postui.html"), "utf8");

function scriptBlock(id) {
  const m = html.match(new RegExp(`<script id="${id}">([\\s\\S]*?)</script>`));
  assert.ok(m, `missing <script id="${id}">`);
  return m[1];
}

const coreSrc = scriptBlock("postui-core");
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(coreSrc, sandbox);
const core = sandbox.PostUICore;
// Values built inside the vm have their own prototypes; round-trip through JSON
// so deepStrictEqual compares shape rather than realm.
const plain = (v) => JSON.parse(JSON.stringify(v));

// --- core: routing -----------------------------------------------------------

test("core block exposes PostUICore and touches no DOM", () => {
  assert.ok(core, "PostUICore is defined");
  assert.doesNotMatch(coreSrc, /\bdocument\.|\bwindow\.|claude\.use/);
});

test("empty hash routes to the feed", () => {
  assert.deepEqual(plain(core.parseRoute("")), { view: "feed" });
  assert.deepEqual(plain(core.parseRoute("#")), { view: "feed" });
});

test("each top-level view has its own route", () => {
  for (const v of ["feed", "needs", "builds", "pilots", "canon", "profile", "inbox", "moderation"]) {
    assert.deepEqual(plain(core.parseRoute("#" + v)), { view: v });
  }
});

test("#t-<id> routes to a thread", () => {
  assert.deepEqual(plain(core.parseRoute("#t-n12")), { view: "thread", id: "n12" });
});

test("#u-<handle> routes to a member profile", () => {
  assert.deepEqual(plain(core.parseRoute("#u-mara")), { view: "profile", handle: "mara" });
});

test("unknown or key=value hashes route to notfound", () => {
  assert.equal(core.parseRoute("#nope").view, "notfound");
  assert.equal(core.parseRoute("#t-").view, "notfound");
  assert.equal(core.parseRoute("#view=needs").view, "notfound");
});

test("routeFor is the inverse of parseRoute", () => {
  for (const r of [{ view: "feed" }, { view: "builds" }, { view: "thread", id: "b3" }, { view: "profile", handle: "leva" }]) {
    assert.deepEqual(plain(core.parseRoute(core.routeFor(r))), r);
  }
});

// --- core: markdown is parsed to a tree, never to HTML ----------------------

function texts(node, out = []) {
  if (Array.isArray(node)) node.forEach((n) => texts(n, out));
  else if (node && typeof node === "object") {
    if (node.type === "text" || node.type === "code") out.push(node.value);
    if (node.children) texts(node.children, out);
    if (node.items) texts(node.items, out);
  }
  return out;
}

test("markdown returns a node tree, not a string", () => {
  const tree = core.parseMarkdown("Hello **world**");
  assert.ok(Array.isArray(tree));
  assert.equal(tree[0].type, "p");
  assert.equal(tree[0].children[1].type, "strong");
});

test("raw HTML in markdown survives only as literal text", () => {
  const src = '<script>alert(1)</script><img src=x onerror="alert(2)">';
  const tree = core.parseMarkdown(src);
  const types = JSON.stringify(tree).match(/"type":"(\w+)"/g);
  assert.ok(types.every((t) => /"(p|text)"/.test(t)), `unexpected node types ${types}`);
  assert.equal(texts(tree).join(""), src);
});

test("markdown supports headings, lists, quotes, code fences and inline code", () => {
  const tree = core.parseMarkdown("## Rules\n\n- one\n- two\n\n1. first\n\n> quoted\n\n```js\nlet a = 1;\n```\n\nuse `x`");
  assert.deepEqual(plain(tree.map((b) => b.type)), ["h", "ul", "ol", "quote", "codeblock", "p"]);
  assert.equal(tree[0].level, 2);
  assert.equal(tree[1].items.length, 2);
  assert.equal(tree[4].value, "let a = 1;");
  assert.equal(tree[4].lang, "js");
  assert.equal(tree[5].children[1].type, "code");
});

test("links keep only http(s) and in-app thread anchors", () => {
  const tree = core.parseMarkdown("[ok](https://postui.org) [app](#t-b1) [bad](javascript:alert(1)) [data](data:text/html,x)");
  const links = tree[0].children.filter((n) => n.type === "link").map((n) => n.href);
  assert.deepEqual(plain(links), ["https://postui.org", "#t-b1"]);
  assert.match(texts(tree).join(""), /bad/);
});

test("safeHref rejects script-capable schemes", () => {
  assert.equal(core.safeHref("https://x.dev/a"), "https://x.dev/a");
  assert.equal(core.safeHref("#t-n1"), "#t-n1");
  assert.equal(core.safeHref(" JavaScript:alert(1)"), null);
  assert.equal(core.safeHref("vbscript:x"), null);
  assert.equal(core.safeHref("//evil.example"), null);
});

// --- core: static scan of Build source ---------------------------------------

const ids = (src) => plain(core.scanSource(src).map((f) => f.id).sort());

test("scan flags network calls", () => {
  assert.deepEqual(ids("fetch('/x')"), ["network"]);
  assert.deepEqual(ids("new WebSocket(u)"), ["network"]);
  assert.deepEqual(ids("navigator.sendBeacon(u)"), ["network"]);
});

test("scan flags eval and Function", () => {
  assert.deepEqual(ids("eval(code)"), ["eval"]);
  assert.deepEqual(ids("new Function('a', b)"), ["eval"]);
});

test("scan flags external scripts, storage, parent messages and obfuscation", () => {
  assert.deepEqual(ids('<script src="https://cdn.example/x.js"></script>'), ["external-script"]);
  assert.deepEqual(ids("document.cookie; localStorage.x"), ["storage"]);
  assert.deepEqual(ids("parent.postMessage(1,'*')"), ["parent-message"]);
  assert.deepEqual(ids("atob('aGVsbG8=')"), ["obfuscation"]);
  assert.deepEqual(ids("'\\x61\\x62\\x63\\x64\\x65\\x66\\x67\\x68'"), ["obfuscation"]);
});

test("scan passes plain code", () => {
  assert.deepEqual(ids("const rows = data.filter(r => r.ok); render(rows);"), []);
});

// --- core: previews, filters, prompts ----------------------------------------

test("previews stay off until spike S4 passes, and never for mcp or files", () => {
  assert.equal(core.PREVIEW_ENABLED, false);
  assert.equal(core.canPreview({ capabilities: [] }), false);
  // Second argument overrides the flag, as it will once S4 is recorded.
  assert.equal(core.canPreview({ capabilities: ["sample"] }, true), true);
  assert.equal(core.canPreview({ capabilities: ["mcp"] }, true), false);
  assert.equal(core.canPreview({ capabilities: ["files"] }, true), false);
});

const T = [
  { id: "n1", space: "needs", kind: "need", title: "Invoice chasing", tags: ["finance"], replies: 0, buildCount: 0, piloting: false, hidden: false, last: 3 },
  { id: "n2", space: "needs", kind: "need", title: "Shift swaps", tags: ["ops"], replies: 4, buildCount: 1, piloting: true, hidden: false, last: 5 },
  { id: "b1", space: "builds", kind: "build", title: "Swap board", tags: ["ops"], replies: 2, buildCount: 1, piloting: false, hidden: false, last: 4 },
  { id: "x1", space: "meta", kind: "discussion", title: "Spam", tags: [], replies: 0, buildCount: 0, piloting: false, hidden: true, last: 9 },
];
const fids = (opts, canSeeHidden = false) => plain(core.filterThreads(T, opts, canSeeHidden).map((t) => t.id));

test("filterThreads sorts by last activity and hides hidden rows from members", () => {
  assert.deepEqual(fids({}), ["n2", "b1", "n1"]);
  assert.deepEqual(fids({}, true), ["x1", "n2", "b1", "n1"]);
});

test("filterThreads applies space, quick filters, tag and text query", () => {
  assert.deepEqual(fids({ space: "needs" }), ["n2", "n1"]);
  assert.deepEqual(fids({ filter: "unanswered" }), ["n1"]);
  assert.deepEqual(fids({ filter: "has-build" }), ["n2", "b1"]);
  assert.deepEqual(fids({ filter: "piloting" }), ["n2"]);
  assert.deepEqual(fids({ tag: "ops" }), ["n2", "b1"]);
  assert.deepEqual(fids({ q: "SWAP" }), ["n2", "b1"]);
});

test("roles gate moderation", () => {
  assert.equal(core.canModerate("member"), false);
  assert.equal(core.canModerate("moderator"), true);
  assert.equal(core.canModerate("host"), true);
  assert.equal(core.canModerate("ai_host"), false);
});

const build = { title: "Swap board", license: "MIT / CC BY 4.0", capabilities: ["sample"] };
const version = { version: 2, spec_md: "# Swap board\nRules here", source_text: "<div>app</div>", data_contract: "shift: id, start, end" };

test("rebuild prompt carries spec, source and declared capabilities", () => {
  const p = core.rebuildPrompt(build, version);
  for (const part of ["Swap board", "Rules here", "<div>app</div>", "shift: id, start, end", "sample"]) {
    assert.ok(p.includes(part), `prompt missing ${part}`);
  }
});

test("export bundle is markdown with spec, source and data contract sections", () => {
  const md = core.exportBundle(build, version);
  assert.match(md, /^# Swap board · v2/m);
  assert.match(md, /^## Spec$/m);
  assert.match(md, /^## Source$/m);
  assert.match(md, /^## Data contract$/m);
  assert.equal(core.bundleFilename(build, version), "swap-board-v2.md");
});

test("relTime formats ages compactly", () => {
  const now = Date.UTC(2026, 9, 6, 12);
  assert.equal(core.relTime(now - 30e3, now), "now");
  assert.equal(core.relTime(now - 5 * 60e3, now), "5m");
  assert.equal(core.relTime(now - 3 * 3600e3, now), "3h");
  assert.equal(core.relTime(now - 2 * 86400e3, now), "2d");
});

// --- static checks on the page -----------------------------------------------

const pageJs = [...html.matchAll(/<script(?: id="[\w-]+")?>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join("\n");

test("page has a title and no document skeleton of its own", () => {
  assert.match(html.slice(0, 8192), /<title>[^<]+<\/title>/);
  assert.doesNotMatch(html, /<!doctype|<html[\s>]|<body[\s>]/i);
});

test("theme matches postui.org: Fira Code, purple accent, dark default plus light mode", () => {
  assert.match(html, /family=Fira\+Code/);
  assert.match(html, /--accent:\s*#8d8ad4/i);
  assert.match(html, /@media \(prefers-color-scheme: light\)\s*\{\s*:root:not\(\[data-theme="dark"\]\)/);
  assert.match(html, /:root\[data-theme="light"\]/);
  assert.match(html, /body\s*\{[^}]*background:\s*var\(--bg\)/);
});

test("member content never reaches the DOM as HTML", () => {
  assert.doesNotMatch(pageJs, /\.innerHTML|\.outerHTML|insertAdjacentHTML|document\.write/);
});

test("page makes no network calls of its own", () => {
  // Call forms only: the Build scanner's rules name these APIs as regex text.
  assert.doesNotMatch(pageJs, /\bfetch\(|new XMLHttpRequest|new WebSocket|new EventSource|\.sendBeacon\(/);
});

test("only CDN-allowlisted external scripts load", () => {
  for (const [, src] of html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)) {
    assert.match(src, /^https:\/\/(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net\/npm\/|unpkg\.com)/);
  }
});

test("page uses only the capabilities the spec allows", () => {
  const used = new Set([...pageJs.matchAll(/claude\.use\("(\w+)"\)/g)].map((m) => m[1]));
  for (const name of used) assert.ok(["mcp", "sample", "downloads"].includes(name), `uses ${name}`);
  assert.ok(used.has("sample") && used.has("downloads") && used.has("mcp"));
});

test("no secrets or backend URLs are embedded", () => {
  assert.doesNotMatch(html, /service_role|eyJ[A-Za-z0-9_-]{20,}|supabase\.co|sk-[A-Za-z0-9]{20,}/);
});

test("all nine views are registered", () => {
  for (const v of ["feed", "thread", "needs", "builds", "pilots", "canon", "profile", "inbox", "moderation"]) {
    assert.match(pageJs, new RegExp(`\\b${v}:\\s*render`), `view ${v}`);
  }
});

test("data layer mirrors the connector's tool names", () => {
  for (const t of ["whoami", "feed", "search", "get_thread", "post_need", "post_build", "post_pilot", "reply", "react", "try_report", "report", "mod_action", "mod_queue"]) {
    assert.match(pageJs, new RegExp(`\\b${t}\\s*[:(]`), `tool ${t}`);
  }
});

test("first-run, loading, empty and error states are designed", () => {
  for (const cls of ["firstrun", "state-loading", "state-empty", "state-error"]) {
    assert.ok(html.includes(cls), `missing ${cls}`);
  }
});

test("version and runtime contract are pinned and match the changelog", () => {
  const v = html.match(/ARTIFACT_VERSION = "([\d.]+)"/);
  assert.ok(v, "ARTIFACT_VERSION constant");
  assert.match(html, /RUNTIME_CONTRACT = "0\.2\.72"/);
  const changelog = readFileSync(join(root, "artifact/CHANGELOG.md"), "utf8");
  assert.ok(changelog.includes(`## ${v[1]}`), "CHANGELOG has an entry for the current version");
});
