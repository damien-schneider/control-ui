import { SummaryEmail } from "@/components/control-ui/email/templates";
import { brand, browserUrl, marketingFooter } from "../content";
import type { EmailExampleProps } from "../options";

export function SummaryEmailExample({ theme, variant }: EmailExampleProps) {
  return (
    <SummaryEmail
      theme={theme}
      variant={variant}
      brand={brand}
      browserUrl={browserUrl}
      footer={marketingFooter}
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
