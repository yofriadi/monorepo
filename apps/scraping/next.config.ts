import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@workspace/ui"],
  output: "standalone",
  images: {
    domains: ['img.chrono24.com'],
  },
}

export default nextConfig
