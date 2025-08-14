import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Option A: allow all uploads from localhost:1337
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      },
    ],

    // Option B (simpler) – allow any image from the hostname “localhost” on any port
    // domains: ["localhost"],
  },
};

export default nextConfig;
