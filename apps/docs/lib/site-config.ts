const PRODUCTION_SITE_URL = "https://control-ui.dev";

function urlFromHost(host: string | undefined) {
  if (!host) return undefined;
  return host.startsWith("http://") || host.startsWith("https://") ? host : `https://${host}`;
}

function canonicalSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelProductionUrl = urlFromHost(process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim());
  return new URL(configuredUrl || vercelProductionUrl || PRODUCTION_SITE_URL);
}

const name = "Control UI";
const tagline = "shadcn-compatible React components & skins";

export const siteConfig = {
  name,
  tagline,
  title: `${name} — ${tagline}`,
  description:
    "100+ open-source React components for Tailwind and shadcn/ui: pickers, trees, editors, app blocks, and AI chat, with swappable skins. Source you own.",
  locale: "en_US",
  language: "en",
  url: canonicalSiteUrl(),
  registry: {
    name: "control-ui",
    componentRoot: "@components/control-ui",
    githubRepo: "damien-schneider/control-ui",
  },
  author: { name: "Damien Schneider", href: "https://x.com/damien_schneid" },
  npmPackage: "@ctrl-ui/react",
} as const;

export function absoluteSiteUrl(pathname: string) {
  return new URL(pathname, siteConfig.url).toString();
}

export function isProductionDeployment() {
  return process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : process.env.NODE_ENV === "production";
}
