"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { useRender } from "@base-ui/react/use-render";
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  useContext,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { RenderProp } from "@/components/control-ui/control-props";
import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts/popup-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { skinScopeAttributes } from "@/components/control-ui/skin";
import { useSkin } from "@/components/control-ui/skin-provider";

export const popoverContentPaddings = ["default", "sm", "none"] as const;

export type PopoverContentPadding = (typeof popoverContentPaddings)[number];

export type PopoverContentProps = Omit<ComponentProps<typeof PopoverPrimitive.Popup>, "style"> & {
  side?: ComponentProps<typeof PopoverPrimitive.Positioner>["side"];
  align?: ComponentProps<typeof PopoverPrimitive.Positioner>["align"];
  sideOffset?: number;
  anchor?: ComponentProps<typeof PopoverPrimitive.Positioner>["anchor"];
  collisionPadding?: ComponentProps<typeof PopoverPrimitive.Positioner>["collisionPadding"];
  padding?: PopoverContentPadding;
  style?: CSSProperties & PopupKnobStyle;
};

type PopoverAnchorContextValue = { anchor: Element | null; setAnchor: (anchor: Element | null) => void };

const PopoverAnchorContext = createContext<PopoverAnchorContextValue | null>(null);

export function Popover(props: ComponentProps<typeof PopoverPrimitive.Root>) {
  const [anchor, setAnchor] = useState<Element | null>(null);
  const anchorContext = useMemo(() => ({ anchor, setAnchor }), [anchor]);
  return (
    <PopoverAnchorContext value={anchorContext}>
      <PopoverPrimitive.Root {...props} />
    </PopoverAnchorContext>
  );
}

export function PopoverTrigger({
  className,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Trigger> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <PopoverPrimitive.Trigger data-control-ui="popover" data-popup-kind="popover" data-slot="trigger" className={className} {...props} />
  );
}

export type PopoverAnchorProps = ComponentProps<"div"> & { render?: RenderProp<ComponentProps<"div">> };

/** The element the popup positions against instead of its trigger. Renders a `div`; pass `render` to anchor an element you already have. */
export function PopoverAnchor({ render, ref, ...props }: PopoverAnchorProps) {
  const context = useContext(PopoverAnchorContext);
  if (!context) throw new Error("PopoverAnchor must be used within Popover.");
  return useRender({
    defaultTagName: "div",
    render,
    ref: [ref ?? null, context.setAnchor],
    props: { ...props, "data-control-ui": "popover", "data-popup-kind": "popover", "data-slot": "anchor" },
  });
}

export function PopoverContent({
  className,
  children,
  side = "bottom",
  align = "center",
  sideOffset = 6,
  anchor,
  collisionPadding,
  padding = "default",
  ...props
}: PopoverContentProps) {
  const skin = useSkin();
  const anchorContext = useContext(PopoverAnchorContext);
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        {...skinScopeAttributes(skin)}
        side={side}
        align={align}
        sideOffset={sideOffset}
        anchor={anchor ?? anchorContext?.anchor}
        collisionPadding={collisionPadding}
        className="z-(--z-popup)"
      >
        <PopoverPrimitive.Popup
          data-control-ui="popover"
          data-popup-kind="popover"
          data-slot="content"
          data-surface="floating"
          data-control-family="popup"
          data-popup-part="surface"
          data-padding={padding}
          className={cn("w-72", className)}
          {...props}
        >
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

export function PopoverViewport({ children, ref, ...props }: ComponentProps<"div"> & { style?: CSSProperties & PopupKnobStyle }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => {
    if (!viewportRef.current) throw new Error("PopoverViewport is not mounted.");
    return viewportRef.current;
  }, []);
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;
    const updateHeight = () => viewport.style.setProperty("--_popover-viewport-height", `${content.offsetHeight}px`);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  return (
    <div data-control-ui="popover" data-control-family="popup" data-popup-kind="popover" data-slot="viewport" {...props} ref={viewportRef}>
      <div data-control-ui="popover" data-control-family="popup" data-popup-kind="popover" data-slot="viewport-content" ref={contentRef}>
        {children}
      </div>
    </div>
  );
}

export function PopoverHeader({ className, ...props }: ComponentProps<"div"> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <div
      data-control-ui="popover"
      data-control-family="popup"
      data-popup-kind="popover"
      data-slot="header"
      className={cn("grid", className)}
      {...props}
    />
  );
}

export function PopoverTitle({
  className,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Title> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <PopoverPrimitive.Title
      data-control-ui="popover"
      data-control-family="popup"
      data-popup-kind="popover"
      data-slot="title"
      className={className}
      {...props}
    />
  );
}

export function PopoverDescription({
  className,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Description> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <PopoverPrimitive.Description
      data-control-ui="popover"
      data-control-family="popup"
      data-popup-kind="popover"
      data-slot="description"
      className={className}
      {...props}
    />
  );
}

export function PopoverClose({
  className,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Close> & { style?: CSSProperties & PopupKnobStyle }) {
  return <PopoverPrimitive.Close data-control-ui="popover" data-popup-kind="popover" data-slot="close" className={className} {...props} />;
}
