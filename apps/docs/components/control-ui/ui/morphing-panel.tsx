"use client";

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";
import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import type { MorphingPanelContentProps, MorphingPanelProps, MorphingPanelTriggerProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

export type {
  MorphingPanelContentProps,
  MorphingPanelDimensions,
  MorphingPanelProps,
  MorphingPanelTriggerProps,
} from "@/components/control-ui/contracts";

type MorphingPanelStyle = CSSProperties & {
  "--morphing-panel-collapsed-height": string;
  "--morphing-panel-collapsed-width": string;
  "--morphing-panel-expanded-height": string;
  "--morphing-panel-expanded-width": string;
};

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
  const panelState = open ? "open" : "closed";

  return useRender({
    defaultTagName: "button",
    render,
    state: { open },
    props: {
      ...triggerProps,
      "data-control-ui": "morphing-panel",
      "data-slot": "trigger",
      "data-state": panelState,
      className: cn(triggerProps.className, skinSlot("morphing-panel", "trigger", { state: panelState }), className),
      children,
    },
  });
}

export function MorphingPanel({ collapsedSize, expandedSize, className, style, ...props }: MorphingPanelProps) {
  const dimensions = {
    "--morphing-panel-collapsed-height": collapsedSize.height,
    "--morphing-panel-collapsed-width": collapsedSize.width,
    "--morphing-panel-expanded-height": expandedSize.height,
    "--morphing-panel-expanded-width": expandedSize.width,
    ...style,
  } satisfies MorphingPanelStyle;

  return (
    <CollapsiblePrimitive.Root
      className={className}
      style={dimensions}
      render={(renderProps, state) => {
        const panelState = state.open ? "open" : "closed";
        return (
          <div
            {...renderProps}
            data-control-ui="morphing-panel"
            data-slot="root"
            data-state={panelState}
            data-surface="panel"
            className={cn(
              "relative isolate h-[var(--morphing-panel-collapsed-height)] w-[min(var(--morphing-panel-collapsed-width),100%)] max-w-full overflow-hidden",
              "rounded-(--radius-control) bg-card text-card-foreground shadow-md ring-1 ring-border/80",
              "transition-[width,height,border-radius,box-shadow] duration-[var(--duration-slow)] ease-[var(--ease-emphasized)]",
              "data-[state=open]:h-[var(--morphing-panel-expanded-height)] data-[state=open]:w-[min(var(--morphing-panel-expanded-width),100%)] data-[state=open]:rounded-(--radius-panel) data-[state=open]:shadow-pop",
              skinSlot("morphing-panel", "root", { state: panelState }),
              renderProps.className,
            )}
          />
        );
      }}
      {...props}
    />
  );
}

export function MorphingPanelTrigger({ render, className, children, ...props }: MorphingPanelTriggerProps) {
  return (
    <CollapsiblePrimitive.Trigger
      className={cn(
        "group/morphing-panel-trigger absolute top-0 right-0 z-10 flex size-full cursor-pointer items-center justify-between gap-2 rounded-[inherit] px-4 text-body font-medium outline-none transition-[top,right,width,height,border-radius,padding,color,background-color,box-shadow] duration-[var(--duration-slow)] ease-[var(--ease-emphasized)] hover:bg-foreground/6 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/20 data-[state=open]:top-2 data-[state=open]:right-2 data-[state=open]:size-9 data-[state=open]:justify-center data-[state=open]:rounded-(--radius-control) data-[state=open]:p-0 pointer-coarse:data-[state=open]:size-11 [&>svg]:shrink-0 [&>svg]:transition-transform [&>svg]:duration-[var(--duration-base)] [&>svg]:ease-[var(--ease-emphasized)] [&[data-state=open]>svg]:rotate-45",
      )}
      {...props}
      render={(triggerProps, state) => (
        <MorphingPanelTriggerElement triggerProps={triggerProps} open={state.open} render={render} className={className}>
          {children}
        </MorphingPanelTriggerElement>
      )}
    />
  );
}

export function MorphingPanelContent({ className, ...props }: MorphingPanelContentProps) {
  return (
    <CollapsiblePrimitive.Panel
      className={className}
      render={(renderProps, state) => {
        const panelState = state.open ? "open" : "closed";
        return (
          <div
            {...renderProps}
            data-control-ui="morphing-panel"
            data-slot="content"
            data-state={panelState}
            className={cn(
              "absolute inset-0 overflow-hidden rounded-[inherit] opacity-100 outline-none",
              "transition-[opacity,filter,translate] duration-[var(--duration-base)] ease-[var(--ease-standard)]",
              "data-[starting-style]:-translate-y-1 data-[starting-style]:opacity-0 data-[starting-style]:blur-sm",
              "data-[ending-style]:-translate-y-1 data-[ending-style]:opacity-0 data-[ending-style]:blur-sm",
              skinSlot("morphing-panel", "content", { state: panelState }),
              renderProps.className,
            )}
          />
        );
      }}
      {...props}
    />
  );
}
