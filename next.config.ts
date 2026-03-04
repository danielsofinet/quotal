import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  headers: async () => [
    {
      // Allow Firebase auth popup to work
      source: "/(.*)",
      headers: [
        {
          key: "Cross-Origin-Opener-Policy",
          value: "same-origin-allow-popups",
        },
      ],
    },
  ],
};

export default nextConfig;
