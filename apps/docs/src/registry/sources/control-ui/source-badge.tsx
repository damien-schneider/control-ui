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

export function sourceHostname(href: string) {
  try {
    return new URL(href).hostname.replace(/^www\./, "") || href;
  } catch {
    return href;
  }
}

export function sourceFaviconHref(href: string) {
  try {
    const source = new URL(href);
    if (source.protocol !== "https:" && source.protocol !== "http:") return undefined;
    return new URL("/favicon.ico", source.origin).href;
  } catch {
    return undefined;
  }
}

export type SourceFaviconProps = Omit<ComponentProps<typeof Avatar>, "children"> & {
  faviconSrc?: string | false;
  href: string;
  imageProps?: Omit<ComponentProps<typeof AvatarImage>, "src">;
  fallbackProps?: ComponentProps<typeof AvatarFallback>;
};

export function SourceFavicon({ faviconSrc, href, imageProps, fallbackProps, className, ...props }: SourceFaviconProps) {
  const resolvedFaviconSrc = faviconSrc === false ? undefined : (faviconSrc ?? sourceFaviconHref(href));
  return (
    <Avatar {...props} className={className}>
      {resolvedFaviconSrc ? <AvatarImage src={resolvedFaviconSrc} alt="" {...imageProps} /> : null}
      <AvatarFallback {...fallbackProps} className={cn("rounded-[inherit] bg-muted", fallbackProps?.className)}>
        <Globe aria-hidden="true" className="size-2.5" />
      </AvatarFallback>
    </Avatar>
  );
}

export function SourceBadge({ faviconSrc, href, children, className, rel, target, ...props }: SourceBadgeProps) {
  const hostname = sourceHostname(href);
  const resolvedRel = rel ?? (target === "_blank" ? "noreferrer noopener" : undefined);

  return (
    <Badge
      variant="outline"
      render={
        <a
          data-control-ui="source-badge"
          data-slot="root"
          href={href}
          target={target}
          rel={resolvedRel}
          className={cn(
            "h-6 gap-1.5 bg-background px-1.5 py-0 pr-2 font-normal text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            skinSlot("source-badge", "root", {}),
            className,
          )}
          {...props}
        />
      }
    >
      <SourceFavicon
        data-control-ui="source-badge"
        data-slot="favicon"
        href={href}
        faviconSrc={faviconSrc}
        className={cn("size-3.5 rounded-sm bg-muted", skinSlot("source-badge", "favicon", {}))}
      />
      <span data-control-ui="source-badge" data-slot="label" className={cn("max-w-44 truncate", skinSlot("source-badge", "label", {}))}>
        {children ?? hostname}
      </span>
    </Badge>
  );
}
