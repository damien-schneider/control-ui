import { ProductEmail } from "@/components/control-ui/email/templates";
import type { EmailTheme } from "@/components/control-ui/email/theme";
import { brand, browserUrl, forestImage, marketingFooter } from "../content";

export function AnnouncementEmailExample({ theme }: { theme: EmailTheme }) {
  return (
    <ProductEmail
      theme={theme}
      brand={brand}
      browserUrl={browserUrl}
      footer={marketingFooter}
      title="Make room for what’s next."
      description="Meet a calmer way to bring your ideas together. A new canvas for the work you care about, with room to explore."
      imageUrl={forestImage}
      imageAlt="Sunlight finding its way through a green forest"
      actionUrl="https://example.com/releases"
    />
  );
}
