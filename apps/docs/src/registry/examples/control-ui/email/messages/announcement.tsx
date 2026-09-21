import { ProductEmail } from "@/components/control-ui/email/templates";
import { brand, browserUrl, forestImage, marketingFooter } from "../content";
import type { EmailExampleProps } from "../options";

export function AnnouncementEmailExample({ theme, variant }: EmailExampleProps) {
  return (
    <ProductEmail
      theme={theme}
      variant={variant}
      brand={brand}
      browserUrl={browserUrl}
      footer={marketingFooter}
      title="Make room for what’s next."
      description="Meet a calmer way to bring your ideas together. A new canvas for the work you care about, with room to explore."
      imageUrl={forestImage}
      imageAlt="Sunlight finding its way through a green forest"
      highlights={[
        { title: "Infinite canvas", description: "Pan, zoom, and keep every draft in view." },
        { title: "Live cursors", description: "See who is editing what, without a refresh." },
        { title: "Version history", description: "Step back to any point in the last 90 days." },
      ]}
      actionUrl="https://example.com/releases"
    />
  );
}
