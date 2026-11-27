import type { ReactNode } from "react";
import { cn } from "@/components/control-ui/lib/cn";
import { Heading, Text } from "@/components/control-ui/ui/typography";
import { ArrowLink } from "./arrow-link";

export type SectionLink = { href: string; label: string };

export function SectionTitle({ id, lines, mutedLine }: { id: string; lines: readonly string[]; mutedLine?: string }) {
  return (
    <Heading level={2} id={id} size="hero" tone="foreground">
      {lines.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
      {mutedLine ? <span className="block text-muted-foreground">{mutedLine}</span> : null}
    </Heading>
  );
}

export function SectionLead({ children, link, className }: { children: ReactNode; link?: SectionLink; className?: string }) {
  return (
    <div className={cn("grid min-w-0 justify-items-start gap-3.5 @4xl/home:w-90 @4xl/home:shrink-0 @4xl/home:pb-2", className)}>
      <Text as="p" size="body-lg" tone="muted" className="text-pretty">
        {children}
      </Text>
      {link ? <ArrowLink href={link.href}>{link.label}</ArrowLink> : null}
    </div>
  );
}

export function SectionHeader({
  titleId,
  title,
  mutedTitle,
  lead,
  link,
}: {
  titleId: string;
  title: readonly string[];
  mutedTitle?: string;
  lead: ReactNode;
  link?: SectionLink;
}) {
  return (
    <header className="flex min-w-0 flex-col gap-6 @4xl/home:flex-row @4xl/home:items-end @4xl/home:justify-between @4xl/home:gap-12">
      <SectionTitle id={titleId} lines={title} mutedLine={mutedTitle} />
      <SectionLead link={link}>{lead}</SectionLead>
    </header>
  );
}
