import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { siteConfig } from "./src/site.config";

const isProd = process.env.NODE_ENV === "production";

// The admin panel talks to Convex over HTTPS and a WebSocket (live updates).
function convexOrigins() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return "";
  try {
    const { protocol, host } = new URL(url);
    return ` ${protocol}//${host} ${protocol === "https:" ? "wss" : "ws"}://${host}`;
  } catch {
    return "";
  }
}

// Production pages need inline scripts for React hydration; dev also needs eval.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  `connect-src 'self'${convexOrigins()}`,
  "frame-src https://www.google.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

export default function config(phase: string): NextConfig {
  // Refuse to build a production site that still shows sample business details.
  // Preview deploys can opt out with ALLOW_SAMPLE_CONTENT=1. (`next typegen`
  // loads this config in the same phase, hence the argv check.)
  const isBuild = phase === PHASE_PRODUCTION_BUILD && process.argv.includes("build");
  if (isBuild && !process.env.NEXT_PUBLIC_CONVEX_URL) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_URL is not set. On Vercel, use the build command \"npx convex deploy --cmd 'npm run build'\" with CONVEX_DEPLOY_KEY set (see docs/CRM-SETUP.md).",
    );
  }
  if (isBuild && !siteConfig.contentReviewed && process.env.ALLOW_SAMPLE_CONTENT !== "1") {
    throw new Error(
      "site.config.ts still has sample content (contentReviewed: false). Fill in the client's real details and set contentReviewed to true, or set ALLOW_SAMPLE_CONTENT=1 for a preview build.",
    );
  }

  return {
    poweredByHeader: false,
    // Pin the project root so a stray lockfile in a parent folder isn't picked up.
    turbopack: { root: process.cwd() },
    trailingSlash: false,
    async headers() {
      return [
        {
          source: "/:path*",
          headers: [
            { key: "Content-Security-Policy", value: csp },
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
            { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
            ...(isProd ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }] : []),
          ],
        },
      ];
    },
  };
}
