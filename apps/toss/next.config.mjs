/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: "/toss",
  transpilePackages: ["@namefit/engine"],
  experimental: {
    externalDir: true
  }
};

export default nextConfig;
