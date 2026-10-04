"use client";

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";
import { useRender } from "@base-ui/react/use-render";
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  type ReactNode,
  type RefObject,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { OpenChangeEventDetails, OpenChangeReason } from "@/components/control-ui/control-props";
import type { MorphingPanelKnobStyle } from "@/components/control-ui/knob-contracts/morphing-panel-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { Button, type ButtonProps } from "@/components/control-ui/ui/button";
import type { CollapsibleContentProps, CollapsibleProps, CollapsibleTriggerProps } from "@/components/control-ui/ui/collapsible";

export type MorphingPanelDimensions = { width: string; height: string };
export type MorphingPanelAnchor = "center" | "top-start" | "top-end" | "bottom-start" | "bottom-end";

export type MorphingPanelProps = Omit<CollapsibleProps, "style"> & {
  collapsedSize: MorphingPanelDimensions;
  expandedSize: MorphingPanelDimensions;
  style?: CSSProperties & MorphingPanelKnobStyle;
};

export type MorphingPanelTriggerProps = Omit<CollapsibleTriggerProps, "style"> & {
  style?: CSSProperties & MorphingPanelKnobStyle;
};

export type MorphingPanelContentProps = Omit<CollapsibleContentProps, "style" | "autoFocus"> & {
  /** Move focus into the surface on opening, for example for an inline confirmation. */
  autoFocus?: boolean;
  style?: CSSProperties & MorphingPanelKnobStyle;
};

export type MorphingPanelPositionerProps = ComponentProps<"div"> & { anchor?: MorphingPanelAnchor };
export type MorphingPanelPartProps = ComponentProps<"div"> & { style?: CSSProperties & MorphingPanelKnobStyle };
export type MorphingPanelCloseProps = ButtonProps;

type MorphingPanelStyle = CSSProperties & {
  "--_morphing-panel-collapsed-height": string;
  "--_morphing-panel-collapsed-width": string;
  "--_morphing-panel-expanded-height": string;
  "--_morphing-panel-expanded-width": string;
};

type MorphingPanelContextValue = {
  open: boolean;
  triggerRef: RefObject<HTMLButtonElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  close: (reason: OpenChangeReason, event: Event) => OpenChangeEventDetails;
};

const MorphingPanelContext = createContext<MorphingPanelContextValue | null>(null);

function useMorphingPanel() {
  const context = useContext(MorphingPanelContext);
  if (!context) throw new Error("MorphingPanel parts must be rendered inside <MorphingPanel>.");
  return context;
}

function createCloseDetails(reason: OpenChangeReason, event: Event, trigger: Element | undefined): OpenChangeEventDetails {
  return {
    reason,
    event,
    trigger,
    isCanceled: false,
    isPropagationAllowed: false,
    cancel() {
      this.isCanceled = true;
    },
    allowPropagation() {
      this.isPropagationAllowed = true;
    },
  };
}

/** Give this container a bounded area; the chosen edge stays fixed throughout resizing. */
export function MorphingPanelPositioner({ anchor = "center", className, ...props }: MorphingPanelPositionerProps) {
  return (
    <div
      {...props}
      data-control-ui="morphing-panel"
      data-control-family="morphing-panel"
      data-slot="positioner"
      data-anchor={anchor}
      className={cn("grid min-h-0 min-w-0 grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)]", className)}
    />
  );
}

function MorphingPanelTriggerElement({
  triggerProps,
  open,
  render,
  className,
  children,
}: {
  triggerProps: ComponentProps<"button">;
  open: boolean;
  render: MorphingPanelTriggerProps["render"];
  className?: string;
  children: ReactNode;
}) {
  const { triggerRef } = useMorphingPanel();
  return useRender({
    defaultTagName: "button",
    render,
    ref: triggerRef,
    state: { open },
    props: {
      ...triggerProps,
      "data-control-ui": "morphing-panel",
      "data-control-family": "morphing-panel",
      "data-slot": "trigger",
      "data-state": open ? "open" : "closed",
      className: cn(triggerProps.className, className),
      children,
    },
  });
}

export function MorphingPanel({
  collapsedSize,
  expandedSize,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onKeyDown,
  className,
  style,
  ...props
}: MorphingPanelProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(open);

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (wasOpen.current && !open && content?.contains(content.ownerDocument.activeElement)) {
      triggerRef.current?.focus({ preventScroll: true });
    }
    wasOpen.current = open;
  }, [open]);

  function changeOpen(nextOpen: boolean, details: OpenChangeEventDetails) {
    onOpenChange?.(nextOpen, details);
    if (!details.isCanceled && openProp === undefined) setUncontrolledOpen(nextOpen);
  }

  function close(reason: OpenChangeReason, event: Event) {
    const details = createCloseDetails(reason, event, triggerRef.current ?? undefined);
    if (open) changeOpen(false, details);
    return details;
  }

  const dimensions = {
    "--_morphing-panel-collapsed-height": collapsedSize.height,
    "--_morphing-panel-collapsed-width": collapsedSize.width,
    "--_morphing-panel-expanded-height": expandedSize.height,
    "--_morphing-panel-expanded-width": expandedSize.width,
    ...style,
  } satisfies MorphingPanelStyle;

  return (
    <MorphingPanelContext.Provider value={{ open, triggerRef, contentRef, close }}>
      <CollapsiblePrimitive.Root
        {...props}
        open={open}
        onOpenChange={changeOpen}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || event.key !== "Escape" || !open) return;
          const details = close("escape-key", event.nativeEvent);
          if (!details.isCanceled) event.preventDefault();
          if (!details.isPropagationAllowed) event.stopPropagation();
        }}
        className={className}
        style={dimensions}
        render={(renderProps, state) => (
          <div
            {...renderProps}
            data-control-ui="morphing-panel"
            data-control-family="morphing-panel"
            data-slot="root"
            data-state={state.open ? "open" : "closed"}
            data-surface="panel"
            className={cn("relative isolate min-h-0 min-w-0 max-h-full max-w-full overflow-hidden", renderProps.className)}
          />
        )}
      />
    </MorphingPanelContext.Provider>
  );
}

export function MorphingPanelTrigger({ render, className, children, ...props }: MorphingPanelTriggerProps) {
  return (
    <CollapsiblePrimitive.Trigger
      className="group/morphing-panel-trigger absolute top-0 end-0 z-10 flex cursor-pointer items-center justify-between data-[state=open]:top-2 data-[state=open]:end-2 data-[state=open]:justify-center [&>svg]:shrink-0"
      {...props}
      render={(triggerProps, state) => (
        <MorphingPanelTriggerElement triggerProps={triggerProps} open={state.open} render={render} className={className}>
          {children}
        </MorphingPanelTriggerElement>
      )}
    />
  );
}

function MorphingPanelContentElement({
  renderProps,
  open,
  autoFocus,
}: {
  renderProps: ComponentProps<"div">;
  open: boolean;
  autoFocus: boolean;
}) {
  const { contentRef } = useMorphingPanel();
  useEffect(() => {
    if (open && autoFocus) contentRef.current?.focus({ preventScroll: true });
  }, [open, autoFocus, contentRef]);
  return useRender({
    defaultTagName: "div",
    ref: contentRef,
    props: {
      ...renderProps,
      tabIndex: renderProps.tabIndex ?? -1,
      inert: !open || renderProps.inert,
      "data-control-ui": "morphing-panel",
      "data-control-family": "morphing-panel",
      "data-slot": "content",
      "data-state": open ? "open" : "closed",
      className: cn("absolute inset-0 flex min-h-0 min-w-0 flex-col overflow-y-auto overscroll-contain", renderProps.className),
    },
  });
}

export function MorphingPanelContent({ autoFocus = false, ...props }: MorphingPanelContentProps) {
  return (
    <CollapsiblePrimitive.Panel
      {...props}
      render={(renderProps, state) => <MorphingPanelContentElement renderProps={renderProps} open={state.open} autoFocus={autoFocus} />}
    />
  );
}

export function MorphingPanelClose({ onClick, ...props }: MorphingPanelCloseProps) {
  const { close } = useMorphingPanel();
  return (
    <Button
      {...props}
      data-morphing-panel-close=""
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) close("close-press", event.nativeEvent);
      }}
    />
  );
}

export function MorphingPanelHeader({ className, ...props }: MorphingPanelPartProps) {
  return (
    <div
      {...props}
      data-control-ui="morphing-panel"
      data-control-family="morphing-panel"
      data-slot="header"
      className={cn("flex shrink-0 items-center", className)}
    />
  );
}

export function MorphingPanelBody({ className, ...props }: MorphingPanelPartProps) {
  return (
    <div
      {...props}
      data-control-ui="morphing-panel"
      data-control-family="morphing-panel"
      data-slot="body"
      className={cn("min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain", className)}
    />
  );
}

export function MorphingPanelFooter({ className, ...props }: MorphingPanelPartProps) {
  return (
    <div
      {...props}
      data-control-ui="morphing-panel"
      data-control-family="morphing-panel"
      data-slot="footer"
      className={cn("flex shrink-0 flex-wrap items-center justify-end gap-2", className)}
    />
  );
}
