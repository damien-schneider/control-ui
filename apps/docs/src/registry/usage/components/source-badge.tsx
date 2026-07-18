import { SourceBadge } from "@/components/control-ui/source-badge";

export function Example({ href, title, favicon }: { href: string; title?: string; favicon?: string }) {
  return (
    <SourceBadge href={href} faviconSrc={favicon} target="_blank">
      {title}
    </SourceBadge>
  );
}
