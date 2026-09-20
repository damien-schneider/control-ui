import { EditorialEmail } from "@/components/control-ui/email/templates";
import type { EmailTheme } from "@/components/control-ui/email/theme";
import { architectureImage, articleUrl, brand, browserUrl, marketingFooter } from "../content";

export function EditorialEmailExample({ theme }: { theme: EmailTheme }) {
  return (
    <EditorialEmail
      theme={theme}
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
