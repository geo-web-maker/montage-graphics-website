import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFile(path.join(root, p), "utf8");

test("API client forwards bearer auth and exposes adminRequest", async () => {
  const api = await read("src/api/client.js");
  assert.match(api, /Authorization.*Bearer/);
  assert.match(api, /adminRequest/);
});

test("Archive Room exposes the required modules", async () => {
  const nav = await read("src/admin/AdminLayout.jsx");
  const dashboard = await read("src/admin/Dashboard.jsx");
  for (const name of ["skills", "receipts", "agreements", "mail", "media", "settings"]) {
    assert.match(nav, new RegExp(`id: "${name}"`));
    assert.match(dashboard, new RegExp(`"${name}"`));
  }
});

test("mailbox controls include message detail, attachments and drafts", async () => {
  const workspace = await read("src/admin/ModuleWorkspace.jsx");
  assert.match(workspace, /admin\/mailbox\/messages/);
  assert.match(workspace, /attachment/);
  assert.match(workspace, /admin\/mailbox\/drafts/);
  assert.match(workspace, /admin\/mailbox\/send/);
});

test("admin login is gated by Turnstile and sends the token", async () => {
  const login = await read("src/admin/Login.jsx");
  const api = await read("src/api/client.js");
  assert.match(login, /<Turnstile/);
  assert.match(api, /turnstile_token/);
});
