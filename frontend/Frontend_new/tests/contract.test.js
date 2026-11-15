import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFile(path.join(root, p), "utf8");

test("Vite base defaults to / (override with VITE_BASE_PATH)", async () => {
  const vite = await read("vite.config.js");
  assert.match(vite, /base:\s*env\.VITE_BASE_PATH\s*\|\|\s*["']\/["']/);
});

test("API client defaults to /montage and forwards bearer auth", async () => {
  const api = await read("src/api/client.js");
  assert.match(api, /VITE_API_URL\s*\|\|\s*["']\/montage["']/);
  assert.match(api, /Authorization.*Bearer/);
});

test("collection has accessible duplicate handling and the three spec breakpoints", async () => {
  const carousel = await read("src/components/WorkCarousel.jsx");
  const css = await read("src/styles/montage.css");
  assert.match(carousel, /aria-hidden=\{dup \? "true" : undefined\}/);
  assert.match(carousel, /aria-valuenow/);
  assert.match(carousel, /DRAG_PX\s*=\s*5/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /@media \(max-width:\s*640px\)/);
  assert.match(css, /@media \(max-width:\s*1080px\)/);
  assert.match(css, /@media \(min-width:\s*1081px\)/);
  assert.match(css, /scroll-snap-type:x proximity/);
});

test("every animation name used in montage.css has a @keyframes rule", async () => {
  const css = await read("src/styles/montage.css");
  const defined = new Set([...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]));
  const used = new Set();
  for (const m of css.matchAll(/animation(?:-name)?\s*:\s*([^;}]+)/g)) {
    for (const part of m[1].split(",")) {
      const name = part.trim().split(/\s+/).find((tok) => /^[a-zA-Z][\w-]*$/.test(tok) && !/^(infinite|forwards|backwards|both|none|linear|ease|ease-in|ease-out|ease-in-out|steps|normal|reverse|alternate|running|paused|important)$/.test(tok) && !/^\d/.test(tok));
      if (name) used.add(name);
    }
  }
  for (const name of used) assert.ok(defined.has(name), `@keyframes ${name} is missing`);
});

test("every var(--x) used in montage.css is defined", async () => {
  const css = await read("src/styles/montage.css");
  const tokens = await read("src/styles/tokens.css");
  const defined = new Set([...(css + tokens).matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
  const missing = new Set();
  for (const m of css.matchAll(/var\((--[\w-]+)(?:\s*,[^)]*)?\)/g)) {
    // custom properties set inline from JSX (per element) are fine
    if (!defined.has(m[1]) && !/^--(c|d|p|x|e\d|w|dom|at|a|b|k|i|r|scene|block|acc|lw|rh)$/.test(m[1])) missing.add(m[1]);
  }
  assert.deepEqual([...missing], []);
});

test("public stylesheet is scoped so it cannot leak into the admin", async () => {
  const css = await read("src/styles/montage.css");
  const bare = css.split("\n").filter((l) => /^(html|body|h1|h2|section|a|button|img)\s*[{,]/.test(l));
  assert.deepEqual(bare, []);
});

test("studio timeline supports keyboard scrubbing, scene chips and reduced motion", async () => {
  const view = await read("src/components/StudioTimeline.jsx");
  const engine = await read("src/hooks/useEditBay.js");
  assert.match(view, /role="slider"/);
  assert.match(view, /className="chips"/);
  assert.match(engine, /ArrowRight/);
  assert.match(engine, /ArrowLeft/);
  assert.match(engine, /prefers-reduced-motion/);
  assert.match(engine, /cancelAnimationFrame/);
});

test("public reviews are submitted for moderation, not immediately published", async () => {
  const component = await read("src/components/Reviews.jsx");
  const api = await read("src/api/client.js");
  assert.match(component, /submitReview\(\{ \.\.\.form/);
  assert.match(component, /submitted for moderation/i);
  assert.match(api, /\/reviews\/submit/);
});

test("review form is gated by Turnstile and sends the token", async () => {
  const c = await read("src/components/Reviews.jsx");
  assert.match(c, /<Turnstile/);
  assert.match(c, /turnstile_token:\s*token/);
});
