import type { Metadata } from "next";
import { guideEntries } from "@/app/(features)/catalog/guides";
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
  alt: "Control UI — React component library for AI interfaces",
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

  const isCatalogOverview = catalogOverviews.some((overview) => overview.href === pathname);
  const title = isCatalogOverview ? page.name : `${page.name} — ${kindTitle[page.kind]}`;
  const socialTitle = `${title} | ${siteConfig.name}`;
  const socialImageLabel: string = isCatalogOverview ? "Component catalog" : kindTitle[page.kind];

  return {
    page,
    pathname,
    url: absoluteSiteUrl(pathname),
    title,
    description: page.summary,
    socialTitle,
    socialImage: {
      url: socialImagePath(pathname),
      alt: socialTitle,
      title: page.name,
      label: socialImageLabel,
      status: page.status,
    },
  };
}

export function metadataForDocsPath(pathname: string): Metadata {
  const seo = docsSeoForPath(pathname);
  if (!seo) return {};

  return {
    title: seo.title,
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
          {
            "@type": "SoftwareApplication",
            "@id": `${siteConfig.url.origin}/#software`,
            name: siteConfig.name,
            url: siteConfig.url.origin,
            description: siteConfig.description,
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web",
            isAccessibleForFree: true,
            license: "https://opensource.org/licenses/MIT",
            publisher: { "@id": `${siteConfig.url.origin}/#organization` },
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
          },
        ],
      }}
    />
  );
}

export function DocsPageStructuredData({ pathname }: { pathname: string }) {
  const seo = docsSeoForPath(pathname);
  if (!seo) return null;

  const guideEntry = seo.page.kind === "Guide" ? guideEntries.find((entry) => entry.id === seo.page.id) : undefined;
  const comparedApplications = guideEntry && "comparedApplications" in guideEntry ? guideEntry.comparedApplications : undefined;
  const guideFaqs = guideEntry && "faqs" in guideEntry ? guideEntry.faqs : undefined;

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
      ...(comparedApplications
        ? {
            about: comparedApplications.map((application) => ({
              "@type": "SoftwareApplication",
              name: application.name,
              url: application.url,
              applicationCategory: "DeveloperApplication",
            })),
          }
        : {}),
      breadcrumb: { "@id": breadcrumbId },
    },
    {
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: siteConfig.name,
          item: absoluteSiteUrl("/"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: seo.page.name,
          item: seo.url,
        },
      ],
    },
  ];

  if (guideFaqs && guideFaqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${seo.url}#faq`,
      mainEntity: guideFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    });
  }

  return <JsonLd value={{ "@context": "https://schema.org", "@graph": graph }} />;
}
