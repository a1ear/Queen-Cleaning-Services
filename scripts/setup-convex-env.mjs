#!/usr/bin/env node
// Sets the environment variables the Convex backend needs:
//   JWT_PRIVATE_KEY, JWKS   signing keys for admin login sessions
//   SITE_URL                where the website runs
//   ADMIN_EMAIL             the only email allowed to sign in to /admin
//   INQUIRY_SUBMIT_SECRET   shared with the website's server so only it can save inquiries
//
// Development (uses the deployment in .env.local, also writes the secret there):
//   node scripts/setup-convex-env.mjs --admin-email you@example.com --site-url http://localhost:3000
// Production (writes the secret to .env.vercel.local for you to paste into Vercel):
//   node scripts/setup-convex-env.mjs --prod --admin-email owner@business.com --site-url https://your-domain
//
// Re-running replaces the keys, which signs the admin out. It never prints the private key.

import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const { exportJWK, exportPKCS8, generateKeyPair } = await import("jose");

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const prod = args.includes("--prod");
const adminEmail = opt("admin-email")?.trim().toLowerCase();
const siteUrl = opt("site-url")?.replace(/\/$/, "");
if (!adminEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail) || !siteUrl) {
  console.error("Usage: node scripts/setup-convex-env.mjs [--prod] --admin-email you@example.com --site-url https://...");
  process.exit(1);
}

const convexCli = path.join(path.dirname(require.resolve("convex/package.json")), "bin", "main.js");
function setEnv(name, value) {
  // `--` stops the CLI reading a value that starts with "-" as a flag.
  execFileSync(process.execPath, [convexCli, "env", "set", ...(prod ? ["--prod"] : []), name, "--", value], {
    stdio: ["ignore", "ignore", "inherit"],
  });
  console.log(`  set ${name}`);
}

const keys = await generateKeyPair("RS256", { extractable: true });
const privateKey = (await exportPKCS8(keys.privateKey)).trimEnd().replace(/\n/g, " ");
const jwks = JSON.stringify({ keys: [{ use: "sig", ...(await exportJWK(keys.publicKey)) }] });
const submitSecret = randomBytes(24).toString("base64url");

console.log(`Setting Convex ${prod ? "PRODUCTION" : "development"} environment variables:`);
setEnv("JWT_PRIVATE_KEY", privateKey);
setEnv("JWKS", jwks);
setEnv("SITE_URL", siteUrl);
setEnv("ADMIN_EMAIL", adminEmail);
setEnv("INQUIRY_SUBMIT_SECRET", submitSecret);

if (prod) {
  // Written to a git-ignored file rather than printed, so it never lands in
  // terminal logs or screen shares.
  const file = ".env.vercel.local";
  writeFileSync(file, `# Paste into Vercel → Settings → Environment Variables (Production only), then delete this file.\nINQUIRY_SUBMIT_SECRET=${submitSecret}\n`);
  console.log(`\nWrote INQUIRY_SUBMIT_SECRET to ${file} (git-ignored).`);
  console.log("Copy it into Vercel → Settings → Environment Variables (Production), then delete that file.");
} else {
  const file = ".env.local";
  let text = existsSync(file) ? readFileSync(file, "utf8") : "";
  text = text.replace(/^INQUIRY_SUBMIT_SECRET=.*\n?/m, "");
  if (text && !text.endsWith("\n")) text += "\n";
  writeFileSync(file, `${text}INQUIRY_SUBMIT_SECRET=${submitSecret}\n`);
  console.log(`  wrote INQUIRY_SUBMIT_SECRET to ${file}`);
}
console.log(`\nDone. Next: open ${siteUrl}/admin/login, choose "First-time setup", and create the password for ${adminEmail}.`);
