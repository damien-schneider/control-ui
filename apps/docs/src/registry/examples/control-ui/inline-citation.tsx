import type { SourceReference } from "@/components/control-ui/inline-citation";
import { InlineCitation } from "@/components/control-ui/inline-citation";

const sources = [
  {
    href: "https://ui.shadcn.com/docs/components/base/popover",
    title: "Popover — shadcn/ui",
    description: "Displays rich content in a portal, triggered by a button.",
    faviconSrc: "https://ui.shadcn.com/favicon.ico",
  },
  {
    href: "https://base-ui.com/react/components/popover",
    title: "Popover — Base UI",
    description: "An accessible popup anchored to a trigger element.",
    faviconSrc: "https://base-ui.com/favicon.ico",
  },
  {
    href: "https://developer.mozilla.org/en-US/docs/Web/API/Popover_API",
    title: "Popover API — MDN",
    quote: "The Popover API provides developers with a standard, consistent, flexible mechanism for displaying popover content.",
  },
] satisfies SourceReference[];

export function InlineCitationExample() {
  return (
    <div className="mx-auto max-w-xl text-sm leading-7 text-foreground">
      A citation with several references stays compact in the answer, then opens a keyboard-accessible source preview
      <InlineCitation sources={sources} />. Each source keeps its own title, excerpt, and outbound link.
    </div>
  );
}
