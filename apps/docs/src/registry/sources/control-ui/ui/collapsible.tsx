"use client";

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";
import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps, ReactNode } from "react";
import type { CollapsibleContentProps, CollapsibleProps, CollapsibleTriggerProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

function CollapsibleTriggerElement({
  triggerProps,
  open,
  render,
  className,
  children,
}: {
  triggerProps: ComponentProps<"button"> & { "data-control-ui"?: string; "data-slot"?: string };
  open: boolean;
  render: CollapsibleTriggerProps["render"];
  className?: string;
  children: ReactNode;
}) {
  const state = { open };

  return useRender({
    defaultTagName: "button",
    render,
    state,
    props: {
      ...triggerProps,
      "data-control-ui": triggerProps["data-control-ui"] ?? "collapsible",
      "data-slot": triggerProps["data-slot"] ?? "trigger",
      "data-state": open ? "open" : "closed",
      className: cn(triggerProps.className, skinSlot("collapsible", "trigger", { state: open ? "open" : "closed" }), className),
      children,
    },
  });
}

// Emits skin-stable anatomy and state hooks so consumers never style on Base UI's private attributes.
export function Collapsible({ className, ...props }: CollapsibleProps) {
  return (
    <CollapsiblePrimitive.Root
      className={className}
      render={(renderProps, state) => (
        <div
          data-control-ui="collapsible"
          data-slot="root"
          {...renderProps}
          data-state={state.open ? "open" : "closed"}
          className={cn(renderProps.className, skinSlot("collapsible", "root", { state: state.open ? "open" : "closed" }))}
        />
      )}
      {...props}
    />
  );
}

export function CollapsibleTrigger({ render, className, children, ...props }: CollapsibleTriggerProps) {
  return (
    <CollapsiblePrimitive.Trigger
      className={cn(
        "cursor-pointer outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] focus-visible:ring-2 focus-visible:ring-foreground/20",
        "[&>svg]:transition-transform [&>svg]:duration-[var(--duration-base)] [&>svg]:ease-[var(--ease-standard)] [&[data-state=open]>svg]:rotate-90",
      )}
      {...props}
      render={(triggerProps, state) => (
        <CollapsibleTriggerElement triggerProps={triggerProps} open={state.open} render={render} className={className}>
          {children}
        </CollapsibleTriggerElement>
      )}
    />
  );
}

export function CollapsibleContent({ className, children, ...props }: CollapsibleContentProps) {
  return (
    <CollapsiblePrimitive.Panel
      className={cn(
        "h-[var(--collapsible-panel-height)] overflow-hidden transition-[height,opacity] duration-[var(--duration-slow)] ease-[var(--ease-standard)]",
        "data-[starting-style]:h-0 data-[starting-style]:opacity-0 data-[ending-style]:h-0 data-[ending-style]:opacity-0",
      )}
      {...props}
      render={(renderProps, state) => (
        <div
          data-control-ui="collapsible"
          data-slot="content"
          {...renderProps}
          data-state={state.open ? "open" : "closed"}
          className={cn(renderProps.className, skinSlot("collapsible", "content", { state: state.open ? "open" : "closed" }))}
        />
      )}
    >
      <div className={className}>{children}</div>
    </CollapsiblePrimitive.Panel>
  );
}
