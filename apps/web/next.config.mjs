/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@namefit/engine"],
  experimental: {
    externalDir: true
  }
};

export default nextConfig;
