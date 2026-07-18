const FALLBACK_DEV_URL = "http://127.0.0.1:3000";

function urlFromHost(host: string | undefined) {
  if (!host) return undefined;
  return host.startsWith("http://") || host.startsWith("https://") ? host : `https://${host}`;
}

function canonicalSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelProductionUrl = urlFromHost(process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim());
  return new URL(configuredUrl || vercelProductionUrl || FALLBACK_DEV_URL);
}

export const siteConfig = {
  name: "Control UI",
  title: "Control UI — React components for AI interfaces",
  description:
    "Production-ready, shadcn-compatible React components, blocks, and skins for agent interfaces, distributed as editable source.",
  locale: "en_US",
  language: "en",
  url: canonicalSiteUrl(),
  registry: {
    name: "control-ui",
    componentRoot: "@components/control-ui",
  },
} as const;

export function absoluteSiteUrl(pathname: string) {
  return new URL(pathname, siteConfig.url).toString();
}

export function isProductionDeployment() {
  return process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : process.env.NODE_ENV === "production";
}
