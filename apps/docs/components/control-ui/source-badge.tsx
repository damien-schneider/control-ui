"use client";

import { Globe } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/control-ui/ui/avatar";
import { Badge } from "@/components/control-ui/ui/badge";

export type SourceBadgeProps = Omit<ComponentProps<"a">, "href"> & {
  faviconSrc?: string | false;
  href: string;
};

function hostnameFromHref(href: string) {
  try {
    return new URL(href).hostname.replace(/^www\./, "") || href;
  } catch {
    return href;
  }
}

function faviconFromHref(href: string) {
  try {
    const source = new URL(href);
    if (source.protocol !== "https:" && source.protocol !== "http:") return undefined;
    return new URL("/favicon.ico", source.origin).href;
  } catch {
    return undefined;
  }
}

export function SourceBadge({ faviconSrc, href, children, className, rel, target, ...props }: SourceBadgeProps) {
  const hostname = hostnameFromHref(href);
  const resolvedFaviconSrc = faviconSrc === false ? undefined : (faviconSrc ?? faviconFromHref(href));
  const resolvedRel = rel ?? (target === "_blank" ? "noreferrer noopener" : undefined);

  return (
    <Badge
      variant="outline"
      asChild
      className={cn(
        "h-6 gap-1.5 rounded-full bg-background px-1.5 py-0 pr-2 font-normal text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        skinSlot("source-badge", "root", {}),
        className,
      )}
    >
      <a data-control-ui="source-badge" data-slot="root" href={href} target={target} rel={resolvedRel} {...props}>
        <Avatar
          data-control-ui="source-badge"
          data-slot="favicon"
          className={cn("size-3.5 rounded-[3px] bg-muted", skinSlot("source-badge", "favicon", {}))}
        >
          {resolvedFaviconSrc ? <AvatarImage src={resolvedFaviconSrc} alt="" /> : null}
          <AvatarFallback className="rounded-[3px] bg-muted">
            <Globe aria-hidden="true" className="size-2.5" />
          </AvatarFallback>
        </Avatar>
        <span data-control-ui="source-badge" data-slot="label" className={cn("max-w-44 truncate", skinSlot("source-badge", "label", {}))}>
          {children ?? hostname}
        </span>
      </a>
    </Badge>
  );
}
