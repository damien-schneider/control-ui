import type { MetadataRoute } from "next";
import { absoluteSiteUrl, isProductionDeployment, siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  const indexable = isProductionDeployment();

  return {
    rules: indexable
      ? {
          userAgent: "*",
          allow: "/",
          disallow: "/api/gaps",
        }
      : {
          userAgent: "*",
          disallow: "/",
        },
    sitemap: absoluteSiteUrl("/sitemap.xml"),
    host: siteConfig.url.origin,
  };
}
