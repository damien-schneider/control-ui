import type { MetadataRoute } from "next";
import { absoluteSiteUrl, isProductionDeployment, siteConfig } from "@/lib/site-config";

// Wildcard already allows these; listing them keeps AI indexing intentional against future blanket disallows.
const aiCrawlerUserAgents = ["GPTBot", "ChatGPT-User", "ClaudeBot", "PerplexityBot", "Google-Extended", "Applebot-Extended"] as const;

export default function robots(): MetadataRoute.Robots {
  const indexable = isProductionDeployment();

  return {
    rules: [
      {
        userAgent: "*",
        ...(indexable ? { allow: "/", disallow: "/api/gaps" } : { disallow: "/" }),
      },
      ...(indexable
        ? [
            {
              userAgent: [...aiCrawlerUserAgents],
              allow: "/",
              disallow: "/api/gaps",
            },
          ]
        : []),
    ],
    sitemap: absoluteSiteUrl("/sitemap.xml"),
    host: siteConfig.url.origin,
  };
}
