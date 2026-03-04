import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Cross-Origin-Opener-Policy",
          value: "same-origin-allow-popups",
        },
      ],
    },
  ],
  rewrites: async () => [
    {
      // Proxy Firebase auth handler through our domain to avoid COOP issues
      source: "/__/auth/:path*",
      destination: "https://quotal-cb6f0.firebaseapp.com/__/auth/:path*",
    },
  ],
};

export default nextConfig;
