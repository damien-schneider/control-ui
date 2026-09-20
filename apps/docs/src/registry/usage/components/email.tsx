import { render, toPlainText } from "react-email";
import type { EmailBrand, EmailFooterContent } from "@/components/control-ui/email/templates";
import { NewsletterEmail } from "@/components/control-ui/email/templates";
import { emailThemeFromCss } from "@/components/control-ui/email/theme";

const brand: EmailBrand = { name: "Your company", homeUrl: "https://your-company.com" };

function newsletterFooter(unsubscribeUrl: string): EmailFooterContent {
  return {
    tagline: "Product notes from the team.",
    socialLinks: [
      { label: "LinkedIn", href: "https://your-company.com/linkedin", iconUrl: "https://your-company.com/email/linkedin.png" },
      { label: "YouTube", href: "https://your-company.com/youtube", iconUrl: "https://your-company.com/email/youtube.png" },
    ],
    helpLinks: [
      { label: "Help center", href: "https://your-company.com/help" },
      { label: "Privacy", href: "https://your-company.com/privacy" },
    ],
    sender: { company: "Your Company, Inc.", addressLines: ["1 Market Street, Suite 200", "San Francisco, CA 94105", "United States"] },
    reason: "You receive this email because you subscribed to product updates.",
    legal: "© 2026 Your Company, Inc. All rights reserved.",
    mailing: "marketing",
    unsubscribeUrl,
    preferencesUrl: "https://your-company.com/email-preferences",
  };
}

export async function renderNewsletter({
  coreThemeCss,
  skinThemeCss,
  overrideCss,
  browserUrl,
  unsubscribeUrl,
  articles,
}: {
  coreThemeCss: string;
  skinThemeCss: string;
  overrideCss: string;
  browserUrl: string;
  unsubscribeUrl: string;
  articles: Parameters<typeof NewsletterEmail>[0]["articles"];
}) {
  const theme = emailThemeFromCss([coreThemeCss, skinThemeCss, overrideCss], "light");
  const html = await render(
    <NewsletterEmail theme={theme} brand={brand} browserUrl={browserUrl} footer={newsletterFooter(unsubscribeUrl)} articles={articles} />,
  );
  return {
    html,
    text: toPlainText(html),
    headers: { "List-Unsubscribe": `<${unsubscribeUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
  };
}
