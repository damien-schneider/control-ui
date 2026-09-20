import { SummaryEmail } from "@/components/control-ui/email/templates";
import type { EmailTheme } from "@/components/control-ui/email/theme";
import { brand, browserUrl, marketingFooter } from "../content";

export function SummaryEmailExample({ theme }: { theme: EmailTheme }) {
  return (
    <SummaryEmail
      theme={theme}
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
