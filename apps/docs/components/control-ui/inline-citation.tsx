"use client";

import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import type { ComponentProps, CSSProperties, ReactNode, RefObject } from "react";
import { createContext, useContext, useRef, useState } from "react";

import type { SourceReference } from "@/components/control-ui/contracts";
import type { InlineCitationKnobStyle } from "@/components/control-ui/knob-contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { SourceFavicon, sourceHostname } from "@/components/control-ui/source-badge";
import { Button } from "@/components/control-ui/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/control-ui/ui/popover";

type InlineCitationStyleProps<Props, Style> = Omit<Props, "style"> & {
  style?: CSSProperties & Style;
};

type SlideDirection = "left" | "right";

type EnteringSlide = { direction: SlideDirection; previousHeight?: number };

type ExitingSlide = { id: number; direction: SlideDirection; source: SourceReference };

type InlineCitationContextValue = {
  currentIndex: number;
  currentSource?: SourceReference;
  entering: EnteringSlide | null;
  exiting: ExitingSlide | null;
  endExit: (id: number) => void;
  hasNext: boolean;
  hasPrevious: boolean;
  next: () => void;
  previous: () => void;
  sourceRef: RefObject<HTMLElement | null>;
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
} & { style?: CSSProperties & InlineCitationKnobStyle };

// No anchor positioning = no hold animation = nothing ever unmounts clone.
function supportsCrossSlide() {
  return typeof CSS !== "undefined" && CSS.supports("(anchor-name: --aui-slide-panel) and (anchor-scope: --aui-slide-panel)");
}

export function InlineCitation({ sources, open, defaultOpen, onOpenChange, className, children, ...props }: InlineCitationProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [entering, setEntering] = useState<EnteringSlide | null>(null);
  const [exiting, setExiting] = useState<ExitingSlide | null>(null);
  const sourceRef = useRef<HTMLElement | null>(null);
  const exitCount = useRef(0);
  const clearEntering = useRef(0);
  const lastIndex = Math.max(0, sources.length - 1);
  const currentIndex = Math.min(selectedIndex, lastIndex);
  const currentSource = sources[currentIndex];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < lastIndex;

  // no primitive owns this swap, so lifecycle attributes theme.css keys on are stamped by hand
  // height is measured pre-commit — last frame on which old box still exists
  const move = (step: 1 | -1) => {
    const nextIndex = Math.min(Math.max(currentIndex + step, 0), lastIndex);
    if (nextIndex === currentIndex) return;
    const direction: SlideDirection = step > 0 ? "right" : "left";
    const leaving = sources[currentIndex];

    setSelectedIndex(nextIndex);
    setEntering({ direction, previousHeight: sourceRef.current?.getBoundingClientRect().height });
    if (leaving && supportsCrossSlide()) {
      exitCount.current += 1;
      setExiting({ id: exitCount.current, direction, source: leaving });
    }

    cancelAnimationFrame(clearEntering.current);
    clearEntering.current = requestAnimationFrame(() => {
      clearEntering.current = requestAnimationFrame(() => setEntering(null));
    });
  };

  const handleOpenChange: NonNullable<PopoverRootProps["onOpenChange"]> = (...args) => {
    const [nextOpen] = args;
    // content unmounts on close, so slide caught mid-flight would resume on next open
    if (!nextOpen) {
      setEntering(null);
      setExiting(null);
    }
    onOpenChange?.(...args);
  };

  const context = {
    currentIndex,
    currentSource,
    entering,
    exiting,
    endExit: (id: number) => setExiting((current) => (current?.id === id ? null : current)),
    hasNext,
    hasPrevious,
    next: () => move(1),
    previous: () => move(-1),
    sourceRef,
    sources,
  } satisfies InlineCitationContextValue;

  return (
    <InlineCitationContext.Provider value={context}>
      <span
        data-control-ui="inline-citation"
        data-control-family="inline-citation"
        data-slot="root"
        {...props}
        className={cn("not-prose inline-flex align-baseline", className)}
      >
        <Popover open={open} defaultOpen={defaultOpen} onOpenChange={handleOpenChange}>
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

export type InlineCitationTriggerProps = InlineCitationStyleProps<ComponentProps<typeof PopoverTrigger>, InlineCitationKnobStyle>;

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
      data-control-family="inline-citation"
      data-slot="trigger"
      className={cn("ml-1 inline-flex h-6 max-w-52 items-center gap-1.5 px-1.5 pr-2 align-baseline", className)}
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

export type InlineCitationFaviconsProps = InlineCitationStyleProps<ComponentProps<"span">, InlineCitationKnobStyle> & {
  limit?: number;
};

export function InlineCitationFavicons({ limit = 3, className, ...props }: InlineCitationFaviconsProps) {
  const { sources } = useInlineCitation();
  return (
    <span
      aria-hidden="true"
      data-control-ui="inline-citation"
      data-control-family="inline-citation"
      data-slot="favicons"
      {...props}
      className={cn("flex shrink-0 -space-x-1", className)}
    >
      {sources.slice(0, limit).map((source) => (
        <SourceFavicon
          key={source.href}
          data-control-ui="inline-citation"
          data-control-family="inline-citation"
          data-slot="favicon"
          href={source.href}
          faviconSrc={source.faviconSrc}
          className="size-3.5"
        />
      ))}
    </span>
  );
}

export type InlineCitationLabelProps = ComponentProps<"span"> & { style?: CSSProperties & InlineCitationKnobStyle };

export function InlineCitationLabel({ className, children, ...props }: InlineCitationLabelProps) {
  const { sources } = useInlineCitation();
  const firstSource = sources[0];
  const additionalSourceCount = Math.max(0, sources.length - 1);
  return (
    <span
      data-control-ui="inline-citation"
      data-control-family="inline-citation"
      data-slot="label"
      {...props}
      className={cn("min-w-0 truncate", className)}
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
      data-slide="scope"
      className={cn("w-[min(24rem,calc(100vw-2rem))] overflow-hidden", className)}
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

export type InlineCitationNavigationProps = InlineCitationStyleProps<ComponentProps<"div">, InlineCitationKnobStyle>;

export function InlineCitationNavigation({ className, children, ...props }: InlineCitationNavigationProps) {
  return (
    <div
      data-control-ui="inline-citation"
      data-control-family="inline-citation"
      data-slot="navigation"
      {...props}
      className={cn("flex min-h-10 items-center gap-1 px-2", className)}
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
      className={className}
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
      className={className}
    >
      {children ?? <ArrowRight aria-hidden="true" />}
    </Button>
  );
}

export type InlineCitationPositionProps = InlineCitationStyleProps<ComponentProps<"span">, InlineCitationKnobStyle>;

export function InlineCitationPosition({ className, children, ...props }: InlineCitationPositionProps) {
  const { currentIndex, sources } = useInlineCitation();
  return (
    <span
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-control-ui="inline-citation"
      data-control-family="inline-citation"
      data-slot="position"
      {...props}
      className={cn("ml-auto px-1", className)}
    >
      {children ?? `${sources.length === 0 ? 0 : currentIndex + 1}/${sources.length}`}
    </span>
  );
}

export type InlineCitationSourceProps = Omit<ComponentProps<"article">, "style"> & {
  source?: SourceReference;
  style?: CSSProperties & InlineCitationKnobStyle;
};

type SourcePanelStyle = CSSProperties & {
  "--aui-slide-prev-height"?: string;
};

function InlineCitationSourceDetails({ source }: { source: SourceReference }) {
  const hostname = sourceHostname(source.href);

  return (
    <>
      <div
        data-control-ui="inline-citation"
        data-control-family="inline-citation"
        data-slot="source-header"
        className="flex items-center gap-2"
      >
        <SourceFavicon
          data-control-ui="inline-citation"
          data-control-family="inline-citation"
          data-slot="source-favicon"
          href={source.href}
          faviconSrc={source.faviconSrc}
          className="size-5"
        />
        <span
          data-control-ui="inline-citation"
          data-control-family="inline-citation"
          data-slot="source-hostname"
          className="min-w-0 truncate"
        >
          {hostname}
        </span>
      </div>
      <a
        data-control-ui="inline-citation"
        data-control-family="inline-citation"
        data-slot="source-title"
        href={source.href}
        target="_blank"
        rel="noreferrer noopener"
        className="group/source-title flex min-w-0 items-start gap-2"
      >
        <span className="min-w-0 flex-1 wrap-anywhere">{source.title ?? hostname}</span>
        <ExternalLink
          data-control-ui="inline-citation"
          data-control-family="inline-citation"
          data-slot="source-external-icon"
          aria-hidden="true"
          className="mt-0.5 size-3.5 shrink-0"
        />
      </a>
      {source.description ? (
        <p data-control-ui="inline-citation" data-control-family="inline-citation" data-slot="source-description" className="line-clamp-3">
          {source.description}
        </p>
      ) : null}
      {source.quote ? (
        <blockquote data-control-ui="inline-citation" data-control-family="inline-citation" data-slot="source-quote" className="px-3 py-2">
          “{source.quote}”
        </blockquote>
      ) : null}
    </>
  );
}

export function InlineCitationSource({ source: sourceProp, className, children, style, ref, ...props }: InlineCitationSourceProps) {
  const { currentIndex, currentSource, entering, exiting, endExit, sourceRef } = useInlineCitation();
  const source = sourceProp ?? currentSource;
  // custom children read CURRENT source, so cloning them would send incoming content out instead of outgoing one
  const slides = !sourceProp && !children;
  const panelClassName = cn("grid gap-3 p-4", className);
  const sourceStyle = style;
  const enteringStyle: SourcePanelStyle | undefined =
    slides && entering?.previousHeight ? { "--aui-slide-prev-height": `${entering.previousHeight}px`, ...sourceStyle } : sourceStyle;

  if (!source) return null;

  return (
    <>
      <article
        // remounted per source: starting translate must be element's FIRST value, or transition eases into it instead of jumping there
        key={`source-${currentIndex}`}
        data-control-ui="inline-citation"
        data-control-family="inline-citation"
        data-slot="source"
        data-slide="panel"
        data-activation-direction={slides ? entering?.direction : undefined}
        data-starting-style={slides && entering ? "" : undefined}
        {...props}
        ref={(node) => {
          sourceRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        style={enteringStyle}
        className={panelClassName}
      >
        {children ?? <InlineCitationSourceDetails source={source} />}
      </article>
      {slides && exiting ? (
        <article
          key={`exit-${exiting.id}`}
          aria-hidden="true"
          inert
          data-control-ui="inline-citation"
          data-control-family="inline-citation"
          data-slot="source"
          data-slide="panel"
          data-ending-style=""
          data-activation-direction={exiting.direction}
          onAnimationEnd={() => endExit(exiting.id)}
          style={sourceStyle}
          className={panelClassName}
        >
          <InlineCitationSourceDetails source={exiting.source} />
        </article>
      ) : null}
    </>
  );
}
