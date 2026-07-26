"use client";

import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { createContext, useContext, useState } from "react";

import type { SourceReference } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";
import { SourceFavicon, sourceHostname } from "@/components/control-ui/source-badge";
import { Button } from "@/components/control-ui/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/control-ui/ui/popover";

type InlineCitationContextValue = {
  currentIndex: number;
  currentSource?: SourceReference;
  hasNext: boolean;
  hasPrevious: boolean;
  next: () => void;
  previous: () => void;
  sources: readonly SourceReference[];
};

const InlineCitationContext = createContext<InlineCitationContextValue | null>(null);

function useInlineCitation() {
  const context = useContext(InlineCitationContext);
  if (!context) throw new Error("InlineCitation parts must be rendered inside <InlineCitation>.");
  return context;
}

type PopoverRootProps = ComponentProps<typeof Popover>;

export type InlineCitationProps = ComponentProps<"span"> & {
  sources: readonly SourceReference[];
  open?: PopoverRootProps["open"];
  defaultOpen?: PopoverRootProps["defaultOpen"];
  onOpenChange?: PopoverRootProps["onOpenChange"];
};

export function InlineCitation({ sources, open, defaultOpen, onOpenChange, className, children, ...props }: InlineCitationProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const lastIndex = Math.max(0, sources.length - 1);
  const currentIndex = Math.min(selectedIndex, lastIndex);
  const currentSource = sources[currentIndex];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < lastIndex;
  const context = {
    currentIndex,
    currentSource,
    hasNext,
    hasPrevious,
    next: () => setSelectedIndex((index) => Math.min(index + 1, lastIndex)),
    previous: () => setSelectedIndex((index) => Math.max(index - 1, 0)),
    sources,
  } satisfies InlineCitationContextValue;

  return (
    <InlineCitationContext.Provider value={context}>
      <span
        data-control-ui="inline-citation"
        data-slot="root"
        {...props}
        className={cn("not-prose inline-flex align-baseline", skinSlot("inline-citation", "root", {}), className)}
      >
        <Popover open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
          {children ?? (
            <>
              <InlineCitationTrigger />
              <InlineCitationContent />
            </>
          )}
        </Popover>
      </span>
    </InlineCitationContext.Provider>
  );
}

export type InlineCitationTriggerProps = ComponentProps<typeof PopoverTrigger>;

export function InlineCitationTrigger({
  "aria-label": ariaLabel,
  className,
  children,
  disabled,
  render,
  ...props
}: InlineCitationTriggerProps) {
  const { sources } = useInlineCitation();
  const firstSource = sources[0];
  const sourceCount = sources.length;
  const accessibleLabel = sourceCount === 1 ? "View 1 source" : `View ${sourceCount} sources`;

  return (
    <PopoverTrigger
      render={render ?? <button type="button" />}
      aria-label={ariaLabel ?? accessibleLabel}
      {...props}
      disabled={disabled || !firstSource}
      data-control-ui="inline-citation"
      data-slot="trigger"
      className={cn(
        "ml-1 inline-flex h-6 max-w-52 items-center gap-1.5 rounded-full border border-border bg-muted/55 px-1.5 pr-2 align-baseline text-caption font-normal text-muted-foreground outline-none transition-colors duration-[var(--duration-fast)] hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        skinSlot("inline-citation", "trigger", {}),
        className,
      )}
    >
      {children ?? (
        <>
          <InlineCitationFavicons />
          <InlineCitationLabel />
        </>
      )}
    </PopoverTrigger>
  );
}

export type InlineCitationFaviconsProps = ComponentProps<"span"> & {
  limit?: number;
};

export function InlineCitationFavicons({ limit = 3, className, ...props }: InlineCitationFaviconsProps) {
  const { sources } = useInlineCitation();
  return (
    <span
      aria-hidden="true"
      data-control-ui="inline-citation"
      data-slot="favicons"
      {...props}
      className={cn("flex shrink-0 -space-x-1", skinSlot("inline-citation", "favicons", {}), className)}
    >
      {sources.slice(0, limit).map((source) => (
        <SourceFavicon
          key={source.href}
          data-control-ui="inline-citation"
          data-slot="favicon"
          href={source.href}
          faviconSrc={source.faviconSrc}
          className={cn("size-3.5 rounded-full border border-background bg-muted", skinSlot("inline-citation", "favicon", {}))}
        />
      ))}
    </span>
  );
}

export type InlineCitationLabelProps = ComponentProps<"span">;

export function InlineCitationLabel({ className, children, ...props }: InlineCitationLabelProps) {
  const { sources } = useInlineCitation();
  const firstSource = sources[0];
  const additionalSourceCount = Math.max(0, sources.length - 1);
  return (
    <span
      data-control-ui="inline-citation"
      data-slot="label"
      {...props}
      className={cn("min-w-0 truncate", skinSlot("inline-citation", "label", {}), className)}
    >
      {children ??
        (firstSource
          ? `${sourceHostname(firstSource.href)}${additionalSourceCount > 0 ? ` +${additionalSourceCount}` : ""}`
          : "No sources")}
    </span>
  );
}

export type InlineCitationContentProps = ComponentProps<typeof PopoverContent>;

export function InlineCitationContent({ className, children, align = "start", padding = "none", ...props }: InlineCitationContentProps) {
  return (
    <PopoverContent
      align={align}
      padding={padding}
      {...props}
      data-control-ui="inline-citation"
      data-slot="content"
      className={cn("w-[min(24rem,calc(100vw-2rem))] overflow-hidden", skinSlot("inline-citation", "content", {}), className)}
    >
      {children ?? (
        <>
          <InlineCitationNavigation />
          <InlineCitationSource />
        </>
      )}
    </PopoverContent>
  );
}

export type InlineCitationNavigationProps = ComponentProps<"div">;

export function InlineCitationNavigation({ className, children, ...props }: InlineCitationNavigationProps) {
  return (
    <div
      data-control-ui="inline-citation"
      data-slot="navigation"
      {...props}
      className={cn(
        "flex min-h-10 items-center gap-1 border-b border-border bg-muted/45 px-2",
        skinSlot("inline-citation", "navigation", {}),
        className,
      )}
    >
      {children ?? (
        <>
          <InlineCitationPrevious />
          <InlineCitationNext />
          <InlineCitationPosition />
        </>
      )}
    </div>
  );
}

export type InlineCitationPreviousProps = Omit<ComponentProps<typeof Button>, "children"> & {
  children?: ReactNode;
};

export function InlineCitationPrevious({ className, children, disabled, onClick, ...props }: InlineCitationPreviousProps) {
  const { hasPrevious, previous } = useInlineCitation();
  return (
    <Button
      aria-label="Previous source"
      size="xs"
      variant="quiet"
      iconOnly
      {...props}
      disabled={disabled || !hasPrevious}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) previous();
      }}
      data-control-ui="inline-citation"
      data-slot="previous"
      className={cn(skinSlot("inline-citation", "previous", {}), className)}
    >
      {children ?? <ArrowLeft aria-hidden="true" />}
    </Button>
  );
}

export type InlineCitationNextProps = Omit<ComponentProps<typeof Button>, "children"> & {
  children?: ReactNode;
};

export function InlineCitationNext({ className, children, disabled, onClick, ...props }: InlineCitationNextProps) {
  const { hasNext, next } = useInlineCitation();
  return (
    <Button
      aria-label="Next source"
      size="xs"
      variant="quiet"
      iconOnly
      {...props}
      disabled={disabled || !hasNext}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) next();
      }}
      data-control-ui="inline-citation"
      data-slot="next"
      className={cn(skinSlot("inline-citation", "next", {}), className)}
    >
      {children ?? <ArrowRight aria-hidden="true" />}
    </Button>
  );
}

export type InlineCitationPositionProps = ComponentProps<"span">;

export function InlineCitationPosition({ className, children, ...props }: InlineCitationPositionProps) {
  const { currentIndex, sources } = useInlineCitation();
  return (
    <span
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-control-ui="inline-citation"
      data-slot="position"
      {...props}
      className={cn("ml-auto px-1 text-caption tabular-nums text-muted-foreground", skinSlot("inline-citation", "position", {}), className)}
    >
      {children ?? `${sources.length === 0 ? 0 : currentIndex + 1}/${sources.length}`}
    </span>
  );
}

export type InlineCitationSourceProps = ComponentProps<"article"> & {
  source?: SourceReference;
};

export function InlineCitationSource({ source: sourceProp, className, children, ...props }: InlineCitationSourceProps) {
  const { currentSource } = useInlineCitation();
  const source = sourceProp ?? currentSource;
  if (!source) return null;
  const hostname = sourceHostname(source.href);

  return (
    <article
      data-control-ui="inline-citation"
      data-slot="source"
      {...props}
      className={cn("grid gap-3 p-4", skinSlot("inline-citation", "source", {}), className)}
    >
      {children ?? (
        <>
          <div
            data-control-ui="inline-citation"
            data-slot="source-header"
            className={cn("flex items-center gap-2", skinSlot("inline-citation", "source-header", {}))}
          >
            <SourceFavicon
              data-control-ui="inline-citation"
              data-slot="source-favicon"
              href={source.href}
              faviconSrc={source.faviconSrc}
              className={cn("size-5 rounded-full bg-muted", skinSlot("inline-citation", "source-favicon", {}))}
            />
            <span className="min-w-0 truncate text-caption text-muted-foreground">{hostname}</span>
          </div>
          <a
            data-control-ui="inline-citation"
            data-slot="source-title"
            href={source.href}
            target="_blank"
            rel="noreferrer noopener"
            className={cn(
              "group/source-title flex min-w-0 items-start gap-2 text-label font-medium leading-5 text-foreground outline-none hover:underline focus-visible:underline",
              skinSlot("inline-citation", "source-title", {}),
            )}
          >
            <span className="min-w-0 flex-1 wrap-anywhere">{source.title ?? hostname}</span>
            <ExternalLink aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
          </a>
          {source.description ? (
            <p
              data-control-ui="inline-citation"
              data-slot="source-description"
              className={cn(
                "line-clamp-3 text-caption leading-5 text-muted-foreground",
                skinSlot("inline-citation", "source-description", {}),
              )}
            >
              {source.description}
            </p>
          ) : null}
          {source.quote ? (
            <blockquote
              data-control-ui="inline-citation"
              data-slot="source-quote"
              className={cn(
                "rounded-[var(--radius-control)] bg-muted/55 px-3 py-2 text-caption leading-5 text-muted-foreground",
                skinSlot("inline-citation", "source-quote", {}),
              )}
            >
              “{source.quote}”
            </blockquote>
          ) : null}
        </>
      )}
    </article>
  );
}
