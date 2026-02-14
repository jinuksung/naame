/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@namefit/engine"],
  experimental: {
    externalDir: true,
    outputFileTracingIncludes: {
      "/*": ["../../surname_map.jsonl", "../../hanname_master.jsonl"]
    }
  }
};

export default nextConfig;
