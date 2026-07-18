import { readFileSync } from "node:fs";
import path from "node:path";
import { docsPageManifest } from "@/app/(features)/catalog/pages";
import { docsSeoForPath } from "@/app/(features)/seo/seo";
import sitemap from "@/app/sitemap";
import { absoluteSiteUrl, siteConfig } from "@/lib/site-config";

const failures: string[] = [];

function duplicates(values: string[]) {
  const seen = new Set<string>();
  const repeated = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated];
}

// URL strictness only applies when a production URL is configured: local runs use the dev
// fallback, and `build` re-runs `sync` so deployed artifacts always carry the configured URL.
const hasConfiguredProductionUrl = Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim());

if (hasConfiguredProductionUrl) {
  if (siteConfig.url.protocol !== "https:") failures.push(`canonical site URL must use HTTPS: ${siteConfig.url}`);
  if (siteConfig.url.hostname === "localhost" || siteConfig.url.hostname === "127.0.0.1") {
    failures.push(`canonical site URL cannot be local: ${siteConfig.url}`);
  }
}

for (const [label, values] of [
  ["page ids", docsPageManifest.map((page) => String(page.id))],
  ["page paths", docsPageManifest.map((page) => page.href)],
] as const) {
  const repeated = duplicates(values);
  if (repeated.length > 0) failures.push(`duplicate ${label}: ${repeated.join(", ")}`);
}

const seoTitles: string[] = [];
const socialImageUrls: string[] = [];
for (const page of docsPageManifest) {
  const seo = docsSeoForPath(page.href);
  if (!seo) {
    failures.push(`missing SEO descriptor for ${page.href}`);
    continue;
  }
  if (!page.name.trim()) failures.push(`${page.href} has no name`);
  if (!page.summary.trim()) failures.push(`${page.href} has no summary`);
  if (seo.url !== absoluteSiteUrl(page.href)) failures.push(`${page.href} canonical does not match the page manifest`);
  if (seo.socialImage.url !== `/og${page.href}`) failures.push(`${page.href} social image does not match the canonical path`);
  if (page.href !== "/overview" && !seo.socialImage.alt.includes(page.name)) {
    failures.push(`${page.href} social image alt does not name the page`);
  }
  seoTitles.push(seo.title);
  socialImageUrls.push(seo.socialImage.url);
}

const repeatedTitles = duplicates(seoTitles);
if (repeatedTitles.length > 0) failures.push(`duplicate SEO titles: ${repeatedTitles.join(", ")}`);

const repeatedSocialImages = duplicates(socialImageUrls);
if (repeatedSocialImages.length > 0) failures.push(`duplicate social images: ${repeatedSocialImages.join(", ")}`);

const expectedSitemap = docsPageManifest.map((page) => absoluteSiteUrl(page.href)).sort();
const actualSitemap = sitemap()
  .map((entry) => entry.url)
  .sort();
if (JSON.stringify(actualSitemap) !== JSON.stringify(expectedSitemap)) {
  failures.push("sitemap URLs do not match the public docs page manifest");
}

const publicRoot = path.join(process.cwd(), "public");
const llms = readFileSync(path.join(publicRoot, "llms.txt"), "utf8");
const llmsFull = readFileSync(path.join(publicRoot, "llms-full.txt"), "utf8");
const agentIndex = readFileSync(path.join(publicRoot, "r/agent-index.json"), "utf8");

if (hasConfiguredProductionUrl) {
  for (const [label, content] of [
    ["llms.txt", llms],
    ["llms-full.txt", llmsFull],
    ["r/agent-index.json", agentIndex],
  ] as const) {
    if (/https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?/.test(content)) failures.push(`${label} contains a local URL`);
  }
}

if (!llms.startsWith(`# ${siteConfig.name}\n\n> ${siteConfig.description}\n`)) {
  failures.push("llms.txt must start with the public project name and summary");
}
for (const page of docsPageManifest) {
  if (!llms.includes(`](${absoluteSiteUrl(page.href)})`)) failures.push(`llms.txt is missing ${page.href}`);
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`SEO surfaces validated (${docsPageManifest.length} canonical pages).`);
