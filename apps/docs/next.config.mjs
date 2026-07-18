import path from "node:path";
import { fileURLToPath } from "node:url";
import createMDX from "@next/mdx";

const appRoot = path.dirname(fileURLToPath(import.meta.url));

const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm"],
  },
});

/** @type {import("next").NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  transpilePackages: ["@control-ui/skills"],
  reactCompiler: true,
  cacheComponents: true,
  turbopack: {},
  webpack(config) {
    config.resolve.alias["@"] = appRoot;
    return config;
  },
  async redirects() {
    return [
      {
        source: "/llm.txt",
        destination: "/llms.txt",
        permanent: true,
      },
    ];
  },
  async headers() {
    const noIndex = [{ key: "X-Robots-Tag", value: "noindex, follow" }];
    return [
      { source: "/api/:path*", headers: noIndex },
      { source: "/r/:path*", headers: noIndex },
    ];
  },
};

export default withMDX(nextConfig);
