"use client";

import { Globe } from "lucide-react";
import type { ComponentProps, CSSProperties } from "react";
import type { BadgeKnobStyle } from "@/components/control-ui/knob-contracts/badge-knobs";
import type { SourceBadgeKnobStyle } from "@/components/control-ui/knob-contracts/source-badge-knobs";

import { cn } from "@/components/control-ui/lib/cn";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/control-ui/ui/avatar";
import { Badge } from "@/components/control-ui/ui/badge";

export type SourceBadgeProps = Omit<ComponentProps<"a">, "href" | "style"> & {
  faviconSrc?: string | false;
  href: string;
  style?: CSSProperties & SourceBadgeKnobStyle & BadgeKnobStyle;
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

export type SourceFaviconProps = Omit<ComponentProps<typeof Avatar>, "children" | "style"> & {
  faviconSrc?: string | false;
  href: string;
  imageProps?: Omit<ComponentProps<typeof AvatarImage>, "src">;
  fallbackProps?: ComponentProps<typeof AvatarFallback>;
  style?: CSSProperties & SourceBadgeKnobStyle;
};

export function SourceFavicon({ faviconSrc, href, imageProps, fallbackProps, className, ...props }: SourceFaviconProps) {
  const resolvedFaviconSrc = faviconSrc === false ? undefined : (faviconSrc ?? sourceFaviconHref(href));
  return (
    <Avatar data-control-ui="source-badge" data-source-badge-favicon="" data-slot="root" {...props} className={className}>
      {resolvedFaviconSrc ? <AvatarImage src={resolvedFaviconSrc} alt="" {...imageProps} /> : null}
      <AvatarFallback {...fallbackProps} className={fallbackProps?.className}>
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
          data-source-badge=""
          data-control-ui="source-badge"
          data-slot="root"
          href={href}
          target={target}
          rel={resolvedRel}
          className={cn("h-6 gap-1.5 px-1.5 py-0 pr-2", className)}
          {...props}
        />
      }
    >
      <SourceFavicon href={href} faviconSrc={faviconSrc} className="size-3.5" />
      <span data-control-ui="source-badge" data-slot="label" className="max-w-44 truncate">
        {children ?? hostname}
      </span>
    </Badge>
  );
}
