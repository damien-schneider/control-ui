"use client";

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";
import { mergeProps } from "@base-ui/react/merge-props";
import type { CSSProperties } from "react";
import { cloneElement, isValidElement } from "react";
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
              "rounded-[calc(var(--morphing-panel-collapsed-height)/2)] bg-card text-card-foreground shadow-md ring-1 ring-border/80",
              "transition-[width,height,border-radius,box-shadow] duration-[var(--duration-slow)] ease-[var(--ease-emphasized)]",
              "data-[state=open]:h-[var(--morphing-panel-expanded-height)] data-[state=open]:w-[min(var(--morphing-panel-expanded-width),100%)] data-[state=open]:rounded-[var(--radius-panel)] data-[state=open]:shadow-pop",
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

export function MorphingPanelTrigger({ asChild = false, className, children, ...props }: MorphingPanelTriggerProps) {
  const triggerClasses =
    "group/morphing-panel-trigger absolute top-2 right-2 z-10 flex h-[calc(100%-1rem)] w-[calc(100%-1rem)] cursor-pointer items-center justify-between gap-2 rounded-[var(--radius-control)] px-2 text-body font-medium outline-none transition-[width,height,padding,color,background-color,box-shadow] duration-[var(--duration-slow)] ease-[var(--ease-emphasized)] hover:bg-foreground/6 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/20 data-[state=open]:size-9 data-[state=open]:justify-center data-[state=open]:p-0 [&>svg]:shrink-0 [&>svg]:transition-transform [&>svg]:duration-[var(--duration-base)] [&>svg]:ease-[var(--ease-emphasized)] [&[data-state=open]>svg]:rotate-45";

  return (
    <CollapsiblePrimitive.Trigger
      {...props}
      render={(renderProps, state) => {
        const panelState = state.open ? "open" : "closed";
        const anatomy = {
          "data-control-ui": "morphing-panel",
          "data-slot": "trigger",
          "data-state": panelState,
        } as const;
        const skinClasses = skinSlot("morphing-panel", "trigger", { state: panelState });

        if (asChild && isValidElement<{ className?: string }>(children)) {
          const merged = mergeProps(renderProps, children.props);
          return cloneElement(children, {
            ...merged,
            ...anatomy,
            className: cn(triggerClasses, skinClasses, merged.className, className),
          });
        }

        return (
          <button type="button" {...renderProps} {...anatomy} className={cn(triggerClasses, skinClasses, renderProps.className, className)}>
            {children}
          </button>
        );
      }}
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
              "absolute inset-0 overflow-hidden opacity-100 outline-none",
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
