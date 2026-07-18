"use client";

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";
import { mergeProps } from "@base-ui/react/merge-props";
import { cloneElement, isValidElement } from "react";
import type { CollapsibleContentProps, CollapsibleProps, CollapsibleTriggerProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

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

export function CollapsibleTrigger({ asChild = false, className, children, ...props }: CollapsibleTriggerProps) {
  return (
    <CollapsiblePrimitive.Trigger
      className={cn(
        "cursor-pointer outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] focus-visible:ring-2 focus-visible:ring-foreground/20",
        "[&>svg]:transition-transform [&>svg]:duration-[var(--duration-base)] [&>svg]:ease-[var(--ease-standard)] [&[data-state=open]>svg]:rotate-90",
        className,
      )}
      {...props}
      render={(renderProps, state) => {
        const stateAttrs = {
          "data-control-ui": "collapsible",
          "data-slot": "trigger",
          "data-state": state.open ? "open" : "closed",
        };
        const skinClasses = skinSlot("collapsible", "trigger", { state: state.open ? "open" : "closed" });

        // asChild: mergeProps chains handlers + concatenates className instead of overwriting consumer's own props.
        if (asChild && isValidElement<{ className?: string }>(children)) {
          const merged = mergeProps(renderProps, children.props);
          return cloneElement(children, {
            ...stateAttrs,
            ...merged,
            className: cn(merged.className, skinClasses),
          });
        }

        return (
          <button type="button" {...stateAttrs} {...renderProps} className={cn(renderProps.className, skinClasses)}>
            {children}
          </button>
        );
      }}
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
