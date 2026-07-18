"use client";

import type { ComponentProps, CSSProperties, ReactElement, ReactNode } from "react";
import { Children, cloneElement, createContext, isValidElement, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";

import type { ThreadRailItemProps, ThreadRailProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";
import { floatingSurfaceClasses } from "@/components/control-ui/surface-variants";

// Fisheye/visibility/slide/enter-exit are declarative CSS (thread-rail.css). React keeps only what
// CSS can't: current turn index (renders hovered text, holds anchor/height on exit) + one measured
// height (no stable CSS interpolates one intrinsic size to another for the morph).

// Layout-effect on the client, plain effect on the server, so measuring never warns during SSR.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type RailContextValue = { current: number; activate: (index: number) => void };
const RailContext = createContext<RailContextValue | null>(null);

function useRail() {
  const context = useContext(RailContext);
  if (!context) throw new Error("ThreadRailItem must be rendered inside <ThreadRail>.");
  return context;
}

type ItemContextValue = { index: number; inView: boolean; activate: (index: number) => void };
const ItemContext = createContext<ItemContextValue | null>(null);

function useItem() {
  const context = useContext(ItemContext);
  if (!context) throw new Error("ThreadRail compound parts must be rendered inside <ThreadRailItem>.");
  return context;
}

export function ThreadRail({ className, children, ...props }: ThreadRailProps) {
  const [hovered, setHovered] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const activeLayerRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState<number>();

  const items = Children.toArray(children).filter((child): child is ReactElement<ThreadRailItemProps & { index?: number }> =>
    isValidElement(child),
  );
  // Lift each item's popover content up so the single travelling card can render the hovered one.
  const contents = items.map((item) => {
    const popover = Children.toArray(item.props.children).find((child) => isValidElement(child) && child.type === ThreadRailPopover);
    return isValidElement<ThreadRailPopoverProps>(popover) ? popover.props.children : null;
  });

  // Explicit border-box height for current turn so `transition: height` morphs; active layer's
  // offsetHeight ignores cross-fade scale, (card offset - client) re-adds borders — skin-agnostic.
  useIsomorphicLayoutEffect(() => {
    const card = cardRef.current;
    const activeLayer = activeLayerRef.current;
    if (!card || !activeLayer) return;
    setCardHeight(activeLayer.offsetHeight + card.offsetHeight - card.clientHeight);
  }, [hovered]);

  // Feeds the non-anchor fallback position; the anchor path (modern browsers) ignores it.
  const railStyle: CSSProperties & Record<"--aui-rail-active-index", number> = { "--aui-rail-active-index": hovered };

  return (
    <RailContext.Provider value={{ current: hovered, activate: setHovered }}>
      <nav
        data-control-ui="thread-rail"
        data-slot="root"
        aria-label="Conversation timeline"
        style={railStyle}
        // w-4 = widest a fisheye tick gets; fixed column width stops the card (left:100%) drifting as ticks resize.
        className={cn("aui-thread-rail flex w-4 flex-col", skinSlot("thread-rail", "root", {}), className)}
        {...props}
      >
        {items.map((item, index) => cloneElement(item, { index }))}

        <div
          ref={cardRef}
          data-control-ui="thread-rail"
          data-slot="popover"
          data-surface="floating"
          style={{ height: cardHeight }}
          className={cn(
            "aui-thread-rail-card pointer-events-none z-20 ml-3 w-72 overflow-hidden text-left",
            floatingSurfaceClasses,
            skinSlot("thread-rail", "popover", {}),
          )}
        >
          {/* Every turn is a stacked layer; CSS cross-fades the current one to front, blurs out on exit. */}
          {items.map((item, index) => (
            <div
              key={item.key ?? index}
              ref={index === hovered ? activeLayerRef : undefined}
              data-active={index === hovered ? "true" : undefined}
              className="aui-thread-rail-card-layer p-3.5"
            >
              {contents[index] ?? null}
            </div>
          ))}
        </div>
      </nav>
    </RailContext.Provider>
  );
}

export function ThreadRailItem({
  from = "user",
  inView = false,
  active = false,
  index = -1,
  className,
  children,
  ...props
}: ThreadRailItemProps & { index?: number }) {
  const rail = useRail();
  const isInView = inView || active;

  return (
    <ItemContext.Provider value={{ index, inView: isInView, activate: rail.activate }}>
      <div
        data-control-ui="thread-rail"
        data-slot="item"
        data-from={from}
        data-in-view={isInView ? "true" : undefined}
        data-active={isInView ? "true" : undefined}
        // Current tick carries card's anchor; driven by state (not :hover) so it survives pointer leaving.
        data-rail-current={index === rail.current ? "true" : undefined}
        // py-1 tiles the rows with no gap, so :hover travels tick-to-tick without ever losing the anchor.
        className={cn("aui-thread-rail-item group relative flex items-center py-1", skinSlot("thread-rail", "item", {}), className)}
        {...props}
      >
        {children}
      </div>
    </ItemContext.Provider>
  );
}

export type ThreadRailLineProps = ComponentProps<"button">;

export function ThreadRailLine({ className, ...props }: ThreadRailLineProps) {
  const { index, inView, activate } = useItem();

  return (
    <button
      data-control-ui="thread-rail"
      data-slot="line"
      type="button"
      aria-current={inView ? "location" : undefined}
      // Publish hovered/focused turn for the shared card; ±4px hit area spans the full 9px row so pointer travel never gaps.
      onMouseEnter={() => activate(index)}
      onFocus={() => activate(index)}
      // Width and tone come entirely from thread-rail.css (the fisheye). Keep only structure here.
      className={cn(
        "aui-thread-rail-tick relative block h-px cursor-pointer rounded-full",
        // taller invisible hit area so a 1px tick is easy to hover and focus.
        "before:absolute before:-inset-y-1 before:inset-x-0 before:content-['']",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        skinSlot("thread-rail", "line", {}),
        className,
      )}
      {...props}
    />
  );
}

export type ThreadRailPopoverProps = ComponentProps<"div"> & { children?: ReactNode };

// A pure marker: ThreadRail lifts its children into the shared travelling card, so it renders nothing itself.
export function ThreadRailPopover(_props: ThreadRailPopoverProps) {
  return null;
}

export type ThreadRailTitleProps = ComponentProps<"div">;

export function ThreadRailTitle({ className, ...props }: ThreadRailTitleProps) {
  return (
    <div
      data-control-ui="thread-rail"
      data-slot="title"
      className={cn("truncate text-body font-medium text-foreground", skinSlot("thread-rail", "title", {}), className)}
      {...props}
    />
  );
}

export type ThreadRailSummaryProps = ComponentProps<"p">;

export function ThreadRailSummary({ className, ...props }: ThreadRailSummaryProps) {
  return <p className={cn("mt-1.5 line-clamp-3 text-label leading-5 text-muted-foreground", className)} {...props} />;
}

export type ThreadRailFooterProps = ComponentProps<"div">;

export function ThreadRailFooter({ className, ...props }: ThreadRailFooterProps) {
  return (
    <div
      data-control-ui="thread-rail"
      data-slot="footer"
      className={cn(
        "mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-2.5",
        skinSlot("thread-rail", "footer", {}),
        className,
      )}
      {...props}
    />
  );
}

export type ThreadRailFileProps = ComponentProps<"span">;

export function ThreadRailFile({ className, ...props }: ThreadRailFileProps) {
  return (
    <span
      data-control-ui="thread-rail"
      data-slot="file"
      className={cn(
        "inline-flex max-w-[180px] items-center gap-1.5 truncate text-label text-muted-foreground",
        skinSlot("thread-rail", "file", {}),
        className,
      )}
      {...props}
    />
  );
}

export type ThreadRailFileIconProps = ComponentProps<"span">;

export function ThreadRailFileIcon({ className, children, ...props }: ThreadRailFileIconProps) {
  return (
    <span
      className={cn("inline-flex size-3.5 shrink-0 items-center justify-center text-label leading-none opacity-70", className)}
      aria-hidden
      {...props}
    >
      {children ?? (
        <svg viewBox="0 0 16 16" fill="none" className="size-3" role="presentation">
          <path
            d="M4 1.5h5L13 5.5V14a.5.5 0 0 1-.5.5h-8A.5.5 0 0 1 4 14V2a.5.5 0 0 1 .5-.5Z"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
          <path d="M9 1.5V5.5h4" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

export type ThreadRailMoreProps = ComponentProps<"span">;

export function ThreadRailMore({ className, ...props }: ThreadRailMoreProps) {
  return <span className={cn("text-label font-medium text-muted-foreground", className)} {...props} />;
}
