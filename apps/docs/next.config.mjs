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
  experimental: {
    lightningCssFeatures: { exclude: ["dir-selector"] },
  },
  turbopack: {},
  outputFileTracingIncludes: {
    "/**/*": ["./src/registry/**/*", "./components/**/*", "./registry/**/*", "./content/**/*"],
  },
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
    const agentDiscovery = [
      {
        key: "Link",
        value: [
          '</.well-known/api-catalog>; rel="api-catalog"',
          '</openapi.json>; rel="service-desc"; type="application/json"',
          '</llms.txt>; rel="describedby"; type="text/plain"',
          '</agent-surface>; rel="service-doc"; type="text/html"',
        ].join(", "),
      },
    ];
    return [
      { source: "/api/:path*", headers: noIndex },
      { source: "/r/:path*", headers: noIndex },
      { source: "/:path((?!api/|r/).*)", headers: agentDiscovery },
    ];
  },
};

export default withMDX(nextConfig);
