/** @type {import('next').NextConfig} */
const configuredDistDir = process.env.NEXT_DIST_DIR?.trim();

const nextConfig = {
  ...(configuredDistDir ? { distDir: configuredDistDir } : {}),
  reactStrictMode: true,
  transpilePackages: ["@namefit/engine"],
  experimental: {
    externalDir: true,
    outputFileTracingIncludes: {
      "/*": [
        "../../surname_map.jsonl",
        "../../hanname_master.jsonl",
        "../../hanja_tags.jsonl"
      ]
    }
  }
};

export default nextConfig;
