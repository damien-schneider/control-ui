import type { Metadata } from "next";
import { catalogOverviews } from "@/app/(features)/catalog/overviews";
import { docsPageForPath } from "@/app/(features)/catalog/pages";
import { socialImagePath, socialImageSize } from "@/app/(features)/seo/social-image-config";
import { absoluteSiteUrl, isProductionDeployment, siteConfig } from "@/lib/site-config";

const llmsAlternates = {
  "text/plain": [{ url: "/llms.txt", title: "Control UI LLM documentation index" }],
};

const openGraphImage = {
  url: "/opengraph-image",
  ...socialImageSize,
  alt: "Control UI — React components for AI interfaces",
};

const twitterImage = {
  url: "/twitter-image",
  alt: openGraphImage.alt,
};

const kindTitle = {
  Guide: "guide",
  Skill: "practice",
  Agent: "AI component",
  Block: "UI block",
  Primitive: "React primitive",
  Hook: "React hook",
  Util: "utility",
  Extension: "extension",
  Skin: "skin",
} as const;

const googleVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();
const bingVerification = process.env.BING_SITE_VERIFICATION?.trim();
const indexable = isProductionDeployment();

export const siteMetadata: Metadata = {
  metadataBase: siteConfig.url,
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "technology",
  manifest: "/manifest.webmanifest",
  alternates: { types: llmsAlternates },
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  robots: {
    index: indexable,
    follow: indexable,
    googleBot: {
      index: indexable,
      follow: indexable,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [openGraphImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [twitterImage],
  },
  verification:
    googleVerification || bingVerification
      ? {
          ...(googleVerification ? { google: googleVerification } : {}),
          ...(bingVerification ? { other: { "msvalidate.01": bingVerification } } : {}),
        }
      : undefined,
};

export function docsSeoForPath(pathname: string) {
  const page = docsPageForPath(pathname);
  if (!page) return undefined;

  const isSiteOverview = pathname === "/overview";
  const isCatalogOverview = catalogOverviews.some((overview) => overview.href === pathname);
  let title = `${page.name} — ${kindTitle[page.kind]}`;
  if (isCatalogOverview) title = page.name;
  if (isSiteOverview) title = siteConfig.title;
  const description = isSiteOverview ? siteConfig.description : page.summary;
  const socialTitle = isSiteOverview ? siteConfig.title : `${title} | ${siteConfig.name}`;
  let socialImageLabel: string = kindTitle[page.kind];
  if (isCatalogOverview) socialImageLabel = "Component catalog";
  if (isSiteOverview) socialImageLabel = "Open-source UI registry";

  return {
    page,
    pathname,
    url: absoluteSiteUrl(pathname),
    title,
    description,
    socialTitle,
    socialImage: {
      url: socialImagePath(pathname),
      alt: socialTitle,
      title: isSiteOverview ? "React components for AI interfaces" : page.name,
      label: socialImageLabel,
      status: page.status,
    },
  };
}

export function metadataForDocsPath(pathname: string): Metadata {
  const seo = docsSeoForPath(pathname);
  if (!seo) return {};

  return {
    title: seo.pathname === "/overview" ? { absolute: siteConfig.title } : seo.title,
    description: seo.description,
    alternates: {
      canonical: seo.pathname,
      types: llmsAlternates,
    },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: seo.url,
      siteName: siteConfig.name,
      title: seo.socialTitle,
      description: seo.description,
      images: [{ url: seo.socialImage.url, ...socialImageSize, alt: seo.socialImage.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.socialTitle,
      description: seo.description,
      images: [{ url: seo.socialImage.url, alt: seo.socialImage.alt }],
    },
  };
}

function JsonLd({ value }: { value: object }) {
  // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD comes from typed catalog data and escapes the only HTML-significant character.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(value).replace(/</g, "\\u003c") }} />;
}

export function SiteStructuredData() {
  return (
    <JsonLd
      value={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": `${siteConfig.url.origin}/#organization`,
            name: siteConfig.name,
            url: siteConfig.url.origin,
          },
          {
            "@type": "WebSite",
            "@id": `${siteConfig.url.origin}/#website`,
            url: siteConfig.url.origin,
            name: siteConfig.name,
            alternateName: "Control UI Registry",
            description: siteConfig.description,
            inLanguage: siteConfig.language,
            publisher: { "@id": `${siteConfig.url.origin}/#organization` },
          },
        ],
      }}
    />
  );
}

export function DocsPageStructuredData({ pathname }: { pathname: string }) {
  const seo = docsSeoForPath(pathname);
  if (!seo) return null;

  const breadcrumbId = `${seo.url}#breadcrumb`;
  const graph: object[] = [
    {
      "@type": "WebPage",
      "@id": `${seo.url}#webpage`,
      url: seo.url,
      name: seo.page.name,
      description: seo.description,
      isPartOf: { "@id": `${siteConfig.url.origin}/#website` },
      inLanguage: siteConfig.language,
      ...(pathname === "/overview" ? {} : { breadcrumb: { "@id": breadcrumbId } }),
    },
  ];

  if (pathname !== "/overview") {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Overview",
          item: absoluteSiteUrl("/overview"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: seo.page.name,
          item: seo.url,
        },
      ],
    });
  }

  return <JsonLd value={{ "@context": "https://schema.org", "@graph": graph }} />;
}
