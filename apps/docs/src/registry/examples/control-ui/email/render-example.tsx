import { render, toPlainText } from "react-email";
import { EditorialEmail, InvitationEmail, NewsletterEmail, ProductEmail, SummaryEmail } from "@/components/control-ui/email/templates";
import type { EmailTheme } from "@/components/control-ui/email/theme";
import type { EmailLayoutId, EmailPreviewResult } from "./options";

const forestImage = "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?fit=crop&w=1104&h=600&q=85&fm=jpg";
const architectureImage = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?fit=crop&w=700&h=850&q=85&fm=jpg";
const brand = { brand: "FIELDWORK", footer: "Made for the way you work. This is a sample email." };
const articleUrl = "https://example.com/journal";

function exampleTemplate(layout: EmailLayoutId, theme: EmailTheme) {
  switch (layout) {
    case "invitation":
      return (
        <InvitationEmail
          {...brand}
          theme={theme}
          inviter="Alex Morgan"
          workspace="Studio North"
          inviteUrl="https://example.com/invitation"
        />
      );
    case "product":
      return (
        <ProductEmail
          {...brand}
          theme={theme}
          title="Make room for what’s next."
          description="Meet a calmer way to bring your ideas together. A new canvas for the work you care about, with room to explore."
          imageUrl={forestImage}
          imageAlt="Sunlight finding its way through a green forest"
          actionUrl="https://example.com/releases"
        />
      );
    case "editorial":
      return (
        <EditorialEmail
          {...brand}
          theme={theme}
          title="A different point of view."
          description="Step inside the spaces that shape our work. This month, we’re exploring how a change of scenery can open up a new way of thinking."
          imageUrl={architectureImage}
          imageAlt="Looking up between modern buildings"
          articleUrl={articleUrl}
        />
      );
    case "newsletter":
      return (
        <NewsletterEmail
          {...brand}
          theme={theme}
          unsubscribeUrl="https://example.com/unsubscribe"
          articles={[
            {
              title: "Space to think.",
              description: "Finding a little quiet in the middle of a busy week.",
              href: `${articleUrl}/space`,
              imageUrl: forestImage,
              imageAlt: "A quiet forest filled with green leaves",
            },
            {
              title: "Built around people.",
              description: "A closer look at the places where good ideas come together.",
              href: `${articleUrl}/people`,
              imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?fit=crop&w=1104&h=500&q=85&fm=jpg",
              imageAlt: "Glass buildings reaching toward an open sky",
            },
          ]}
        />
      );
    case "summary":
      return (
        <SummaryEmail
          {...brand}
          theme={theme}
          period="YOUR WEEK IN REVIEW"
          dashboardUrl="https://example.com/workspace"
          metrics={[
            { label: "Completed", value: "24" },
            { label: "In progress", value: "8" },
            { label: "Teammates", value: "6" },
          ]}
          details={[
            { label: "Website refresh", value: "Ready for review" },
            { label: "Autumn collection", value: "In progress" },
            { label: "Brand guidelines", value: "Published" },
          ]}
        />
      );
  }
}

export async function renderEmailExample(layout: EmailLayoutId, theme: EmailTheme): Promise<EmailPreviewResult> {
  const html = await render(exampleTemplate(layout, theme));
  return { html, text: toPlainText(html) };
}
