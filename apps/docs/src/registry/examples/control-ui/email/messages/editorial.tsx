import { EditorialEmail } from "@/components/control-ui/email/templates";
import { architectureImage, articleUrl, brand, browserUrl, marketingFooter } from "../content";
import type { EmailExampleProps } from "../options";

export function EditorialEmailExample({ theme, variant }: EmailExampleProps) {
  return (
    <EditorialEmail
      theme={theme}
      variant={variant}
      brand={brand}
      browserUrl={browserUrl}
      footer={marketingFooter}
      title="A different point of view."
      description="Step inside the spaces that shape our work. This month, we’re exploring how a change of scenery can open up a new way of thinking."
      imageUrl={architectureImage}
      imageAlt="Looking up between modern buildings"
      articleUrl={articleUrl}
    />
  );
}
