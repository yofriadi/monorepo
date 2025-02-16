/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@workspace/ui"],
  output: "standalone",
}

export default nextConfig
