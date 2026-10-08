import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  typedRoutes: true,
  poweredByHeader: false,
  serverExternalPackages: ["pg"],
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
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
