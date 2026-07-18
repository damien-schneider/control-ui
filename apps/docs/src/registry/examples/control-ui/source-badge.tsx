import { SourceBadge } from "@/components/control-ui/source-badge";

export function SourceBadgeExample() {
  return (
    <div className="flex flex-wrap items-center gap-2 p-6">
      <SourceBadge href="https://ui.shadcn.com/docs/components/base/marker" faviconSrc="https://ui.shadcn.com/favicon.ico">
        shadcn/ui
      </SourceBadge>
      <SourceBadge href="https://base-ui.com/react/components/collapsible" faviconSrc="https://base-ui.com/favicon.ico" />
      <SourceBadge href="https://developer.mozilla.org/en-US/docs/Web/Accessibility" faviconSrc="/missing-favicon.ico">
        MDN
      </SourceBadge>
    </div>
  );
}
