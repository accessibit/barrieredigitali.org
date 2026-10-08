import path from "node:path";

import type { NextConfig } from "next";

/**
 * Content Security Policy. Next.js inlines its hydration scripts and static
 * pages cannot carry a per-request nonce, so scripts allow 'unsafe-inline';
 * everything else is locked to this origin (no third-party scripts, no
 * exfiltration via connect-src, no framing). vercel.live is the Vercel
 * toolbar shown on preview deployments; 'unsafe-eval' is needed only by React
 * in development.
 */
function contentSecurityPolicy() {
  const dev = process.env.NODE_ENV === "development";
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""} https://vercel.live`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://vercel.live https://vercel.com",
    "font-src 'self' https://vercel.live",
    "connect-src 'self' https://vercel.live wss://ws-us3.pusher.com",
    "frame-src https://vercel.live",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
}

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: contentSecurityPolicy() },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  typedRoutes: true,
  poweredByHeader: false,
  serverExternalPackages: ["pg"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.barrieredigitali.org" }],
        destination: "https://barrieredigitali.org/:path*",
        permanent: true,
      },
    ];
  },
  turbopack: {
    root: path.join(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
