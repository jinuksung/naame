/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: "/toss",
  transpilePackages: ["@namefit/engine"],
  experimental: {
    externalDir: true,
    outputFileTracingIncludes: {
      "/*": ["../../surname_map.jsonl"]
    }
  }
};

export default nextConfig;
