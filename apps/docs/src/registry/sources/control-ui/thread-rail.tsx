"use client";

import type { ComponentProps, CSSProperties, KeyboardEvent, ReactElement, ReactNode, RefObject } from "react";
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { ChatRole } from "@/components/control-ui/hooks/use-chat-message";
import type { ThreadRailKnobStyle } from "@/components/control-ui/knob-contracts/thread-rail-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type ThreadRailProps = ComponentProps<"nav"> & { style?: CSSProperties & ThreadRailKnobStyle };

export type ThreadRailItemProps = Omit<ComponentProps<"div">, "style"> & {
  from?: ChatRole;
  inView?: boolean;
  active?: boolean;
  style?: CSSProperties & ThreadRailKnobStyle;
};

// thread-rail.css owns fisheye, visibility, slide, and enter/exit. React keeps only current turn index
// and one measured height, because no stable CSS interpolates one intrinsic size to another.

// plain effect on server so measuring never warns during SSR
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type RailContextValue = {
  current: number;
  count: number;
  activate: (index: number) => void;
  layerId: (index: number, part: "title" | "summary") => string;
  lines: RefObject<Array<HTMLButtonElement | null>>;
};
const RailContext = createContext<RailContextValue | null>(null);

function useRail() {
  const context = useContext(RailContext);
  if (!context) throw new Error("ThreadRailItem must be rendered inside <ThreadRail>.");
  return context;
}

type ItemContextValue = { index: number; inView: boolean; active: boolean };
const ItemContext = createContext<ItemContextValue | null>(null);

function useItem() {
  const context = useContext(ItemContext);
  if (!context) throw new Error("ThreadRail compound parts must be rendered inside <ThreadRailItem>.");
  return context;
}

const LayerContext = createContext<number | null>(null);

export function ThreadRail({ className, children, style, ...props }: ThreadRailProps) {
  const [hovered, setHovered] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const activeLayerRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState<number>();
  const baseId = useId();
  const lines = useRef<Array<HTMLButtonElement | null>>([]);

  const items = Children.toArray(children).filter((child): child is ReactElement<ThreadRailItemProps & { index?: number }> =>
    isValidElement(child),
  );
  const popovers = items.map((item) => {
    const popover = Children.toArray(item.props.children).find((child) => isValidElement(child) && child.type === ThreadRailPopover);
    return isValidElement<ThreadRailPopoverProps>(popover) ? popover.props : undefined;
  });
  const activePopover = popovers[hovered];

  // `transition: height` needs explicit border-box height; offsetHeight ignores cross-fade scale, and offset/client delta re-adds borders whatever skin
  useIsomorphicLayoutEffect(() => {
    const card = cardRef.current;
    const activeLayer = activeLayerRef.current;
    if (!card || !activeLayer) return;
    setCardHeight(activeLayer.offsetHeight + card.offsetHeight - card.clientHeight);
  }, [hovered]);

  // fallback for browsers without anchor positioning; anchor path ignores it
  const railStyle: CSSProperties & Record<"--_thread-rail-active-index", number> = {
    ...style,
    "--_thread-rail-active-index": hovered,
  };

  return (
    <RailContext.Provider
      value={{ current: hovered, count: items.length, activate: setHovered, layerId: (index, part) => `${baseId}-${index}-${part}`, lines }}
    >
      <nav
        data-control-ui="thread-rail"
        data-control-family="thread-rail"
        data-slot="root"
        aria-label="Conversation timeline"
        style={railStyle}
        // widest fisheye tick gets — fixed column stops card drifting as ticks resize
        className={cn("flex flex-col", className)}
        {...props}
      >
        {items.map((item, index) => cloneElement(item, { index }))}

        {/* Visual preview only: each line takes its name and description from its layer by id. */}
        <div
          ref={cardRef}
          aria-hidden="true"
          data-control-ui="thread-rail"
          data-control-family="thread-rail"
          data-slot="popover"
          data-surface="floating"
          style={{ ...activePopover?.style, height: cardHeight }}
          className={cn("pointer-events-none z-20 w-72 overflow-hidden", activePopover?.className)}
        >
          {items.map((item, index) => (
            <LayerContext.Provider key={item.key ?? index} value={index}>
              <div
                data-control-ui="thread-rail"
                data-control-family="thread-rail"
                data-slot="popover-layer"
                ref={index === hovered ? activeLayerRef : undefined}
                data-active={index === hovered ? "true" : undefined}
              >
                {popovers[index]?.children ?? null}
              </div>
            </LayerContext.Provider>
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
    <ItemContext.Provider value={{ index, inView: isInView, active }}>
      <div
        data-control-ui="thread-rail"
        data-control-family="thread-rail"
        data-slot="item"
        data-from={from}
        data-in-view={isInView ? "true" : undefined}
        data-active={isInView ? "true" : undefined}
        // driven by state, not :hover, so card's anchor survives pointer leaving
        data-rail-current={index === rail.current ? "true" : undefined}
        // tiles rows with no gap, so :hover travels tick to tick without ever losing anchor
        className={cn("relative flex items-center", className)}
        {...props}
      >
        {children}
      </div>
    </ItemContext.Provider>
  );
}

export type ThreadRailLineProps = Omit<ComponentProps<"button">, "style"> & {
  style?: CSSProperties & ThreadRailKnobStyle;
};

function rovingTarget(key: string, index: number, count: number): number | undefined {
  const last = count - 1;
  const targets: Record<string, number> = { ArrowDown: Math.min(index + 1, last), ArrowUp: Math.max(index - 1, 0), Home: 0, End: last };
  return targets[key];
}

export function ThreadRailLine({ className, onKeyDown, "aria-label": ariaLabel, ...props }: ThreadRailLineProps) {
  const { index, active } = useItem();
  const rail = useRail();

  return (
    <button
      ref={(node) => {
        rail.lines.current[index] = node;
      }}
      data-control-ui="thread-rail"
      data-control-family="thread-rail"
      data-slot="line"
      type="button"
      tabIndex={index === rail.current ? 0 : -1}
      aria-current={active ? "location" : undefined}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel === undefined ? rail.layerId(index, "title") : undefined}
      aria-describedby={rail.layerId(index, "summary")}
      onMouseEnter={() => rail.activate(index)}
      onFocus={() => rail.activate(index)}
      onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(event);
        const target = event.defaultPrevented ? undefined : rovingTarget(event.key, index, rail.count);
        if (target === undefined) return;
        event.preventDefault();
        rail.lines.current[target]?.focus();
      }}
      className={cn("relative block cursor-pointer", className)}
      {...props}
    />
  );
}

export type ThreadRailPopoverProps = Omit<ComponentProps<"div">, "style"> & {
  children?: ReactNode;
  style?: CSSProperties & ThreadRailKnobStyle;
};

export function ThreadRailPopover(_props: ThreadRailPopoverProps) {
  return null;
}

function useLayerId(part: "title" | "summary") {
  const rail = useRail();
  const layer = useContext(LayerContext);
  return layer === null ? undefined : rail.layerId(layer, part);
}

export type ThreadRailTitleProps = Omit<ComponentProps<"div">, "style"> & {
  style?: CSSProperties & ThreadRailKnobStyle;
};

export function ThreadRailTitle({ className, ...props }: ThreadRailTitleProps) {
  const id = useLayerId("title");
  return (
    <div
      id={id}
      data-control-ui="thread-rail"
      data-control-family="thread-rail"
      data-slot="title"
      className={cn("line-clamp-2 text-pretty", className)}
      {...props}
    />
  );
}
export type ThreadRailSummaryProps = Omit<ComponentProps<"p">, "style"> & {
  style?: CSSProperties & ThreadRailKnobStyle;
};

export function ThreadRailSummary({ className, ...props }: ThreadRailSummaryProps) {
  const id = useLayerId("summary");
  return (
    <p
      id={id}
      data-control-ui="thread-rail"
      data-control-family="thread-rail"
      data-slot="summary"
      className={cn("line-clamp-3 text-pretty", className)}
      {...props}
    />
  );
}

export type ThreadRailFooterProps = Omit<ComponentProps<"div">, "style"> & {
  style?: CSSProperties & ThreadRailKnobStyle;
};

export function ThreadRailFooter({ className, ...props }: ThreadRailFooterProps) {
  return (
    <div
      data-control-ui="thread-rail"
      data-control-family="thread-rail"
      data-slot="footer"
      className={cn("flex flex-wrap items-center", className)}
      {...props}
    />
  );
}

export type ThreadRailFileProps = Omit<ComponentProps<"span">, "style"> & {
  style?: CSSProperties & ThreadRailKnobStyle;
};

export function ThreadRailFile({ className, ...props }: ThreadRailFileProps) {
  return (
    <span
      data-control-ui="thread-rail"
      data-control-family="thread-rail"
      data-slot="file"
      className={cn("inline-flex max-w-[180px] items-center truncate", className)}
      {...props}
    />
  );
}

export type ThreadRailFileIconProps = Omit<ComponentProps<"span">, "style"> & {
  style?: CSSProperties & ThreadRailKnobStyle;
};

export function ThreadRailFileIcon({ className, children, ...props }: ThreadRailFileIconProps) {
  return (
    <span
      data-control-ui="thread-rail"
      data-control-family="thread-rail"
      data-slot="file-icon"
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
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
export type ThreadRailMoreProps = Omit<ComponentProps<"span">, "style"> & {
  style?: CSSProperties & ThreadRailKnobStyle;
};

export function ThreadRailMore({ className, ...props }: ThreadRailMoreProps) {
  return <span data-control-ui="thread-rail" data-control-family="thread-rail" data-slot="more" className={className} {...props} />;
}
