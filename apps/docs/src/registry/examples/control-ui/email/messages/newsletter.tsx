import { NewsletterEmail } from "@/components/control-ui/email/templates";
import { articleUrl, brand, browserUrl, forestImage, marketingFooter } from "../content";
import type { EmailExampleProps } from "../options";

export function NewsletterEmailExample({ theme, variant }: EmailExampleProps) {
  return (
    <NewsletterEmail
      theme={theme}
      variant={variant}
      brand={brand}
      browserUrl={browserUrl}
      footer={{ ...marketingFooter, placement: "outside" }}
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
}
