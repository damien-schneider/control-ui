import type { EmailBrand, EmailFooterContent } from "@/components/control-ui/email/email-brand";
import { absoluteSiteUrl } from "@/lib/site-config";

export const brand: EmailBrand = {
  name: "FIELDWORK",
  homeUrl: "https://example.com",
  logoUrl: absoluteSiteUrl("/email/fieldwork.png"),
  logoDarkUrl: absoluteSiteUrl("/email/fieldwork-dark.png"),
  logoWidth: 157,
  logoHeight: 24,
};
export const browserUrl = "https://example.com/emails/weekly-edit";
export const articleUrl = "https://example.com/journal";
export const forestImage = "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?fit=crop&w=1104&h=600&q=85&fm=jpg";
export const architectureImage = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?fit=crop&w=700&h=850&q=85&fm=jpg";

const footerBase = {
  tagline: "Made for the way you work. This is a sample email.",
  socialIconBaseUrl: absoluteSiteUrl("/email/social"),
  socialLinks: [
    { platform: "instagram", href: "https://example.com/instagram" },
    { platform: "linkedin", href: "https://example.com/linkedin" },
    { platform: "youtube", href: "https://example.com/youtube" },
    { platform: "x", href: "https://example.com/x" },
  ],
  helpLinks: [
    { label: "Help center", href: "https://example.com/help" },
    { label: "Privacy", href: "https://example.com/privacy" },
    { label: "Terms", href: "https://example.com/terms" },
  ],
  sender: {
    company: "Fieldwork, Inc.",
    addressLines: ["2261 Market Street, Suite 5150", "San Francisco, CA 94114", "United States"],
  },
  legal: "© 2026 Fieldwork, Inc. All rights reserved.",
} satisfies Partial<EmailFooterContent>;

export const marketingFooter: EmailFooterContent = {
  ...footerBase,
  align: "center",
  reason: "You receive this email because you subscribed to Fieldwork updates.",
  mailing: "marketing",
  unsubscribeUrl: "https://example.com/unsubscribe",
  preferencesUrl: "https://example.com/email-preferences",
};

export const transactionalFooter: EmailFooterContent = {
  ...footerBase,
  reason: "You receive this email because you have a Fieldwork account.",
  mailing: "transactional",
};
