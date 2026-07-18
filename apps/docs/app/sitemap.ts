import type { MetadataRoute } from "next";
import { docsPageManifest } from "@/app/(features)/catalog/pages";
import { absoluteSiteUrl } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  return docsPageManifest.map((page) => ({ url: absoluteSiteUrl(page.href) }));
}
