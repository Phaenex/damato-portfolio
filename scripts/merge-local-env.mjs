#!/usr/bin/env node
/**
 * Merge Production KV/email keys into .env.local for full local dev.
 * Keeps NEXT_PUBLIC_SITE_URL on localhost. Run after `vercel env pull .env.local`.
 *
 * Usage:
 *   vercel env pull .env.local
 *   vercel env pull .env.production.pulled --environment=production
 *   node scripts/merge-local-env.mjs
 */
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";

function parseEnv(text) {
  const out = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    out[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1);
  }
  return out;
}

const localPath = ".env.local";
const prodPath = ".env.production.pulled";

if (!existsSync(localPath)) {
  console.error("merge-local-env: run `vercel env pull .env.local` first");
  process.exit(1);
}
if (!existsSync(prodPath)) {
  console.error(
    "merge-local-env: run `vercel env pull .env.production.pulled --environment=production` first",
  );
  process.exit(1);
}

const dev = parseEnv(readFileSync(localPath, "utf8"));
const prod = parseEnv(readFileSync(prodPath, "utf8"));

const merged = { ...dev };
for (const key of [
  "KV_REST_API_URL",
  "KV_REST_API_TOKEN",
  "KV_REST_API_READ_ONLY_TOKEN",
  "TRACKERS_ANALYTICS_KEY",
  "RESEND_API_KEY",
  "NOTIFY_EMAIL_TO",
]) {
  if (prod[key]) merged[key] = prod[key];
}
merged.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
merged.NEXT_PUBLIC_SITE_TZ = merged.NEXT_PUBLIC_SITE_TZ || "America/Chicago";

const skip = new Set(["VERCEL", "VERCEL_ENV", "VERCEL_URL", "VERCEL_TARGET_ENV", "NX_DAEMON"]);
const header = `# Local dev — merged from Vercel Development + Production KV/email keys.
# Refresh: vercel env pull .env.local && vercel env pull .env.production.pulled --environment=production && node scripts/merge-local-env.mjs
# Never commit this file.

`;
const body = Object.entries(merged)
  .filter(([k]) => !k.startsWith("VERCEL_") && !k.startsWith("TURBO_") && !skip.has(k))
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([k, v]) => `${k}=${v}`)
  .join("\n");

writeFileSync(localPath, header + body + "\n");
unlinkSync(prodPath);
console.log("merge-local-env: updated .env.local");
