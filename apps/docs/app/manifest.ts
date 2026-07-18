import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/overview",
    display: "standalone",
    background_color: "oklch(0.98 0.004 270)",
    theme_color: "oklch(0.16 0.012 270)",
  };
}
