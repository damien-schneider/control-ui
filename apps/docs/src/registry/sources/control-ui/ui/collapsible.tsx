"use client";

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";
import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import type { OpenChangeEventDetails, RenderProp } from "@/components/control-ui/control-props";
import type { CollapsibleKnobStyle } from "@/components/control-ui/knob-contracts/collapsible-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type CollapsibleProps = Omit<ComponentProps<"div">, "onChange"> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: OpenChangeEventDetails) => void;
  children?: ReactNode;
} & { style?: CSSProperties & CollapsibleKnobStyle };

export type CollapsibleTriggerProps = Omit<ComponentProps<"button">, "style"> & {
  "data-slot"?: string;
  render?: RenderProp<ComponentProps<"button">, { open: boolean }>;
  nativeButton?: boolean;
  style?: CSSProperties & CollapsibleKnobStyle;
};

export type CollapsibleContentProps = ComponentProps<"div"> & {
  "data-slot"?: string;
  keepMounted?: boolean;
} & { style?: CSSProperties & CollapsibleKnobStyle };

function CollapsibleTriggerElement({
  triggerProps,
  open,
  render,
  className,
  children,
}: {
  triggerProps: ComponentProps<"button"> & { "data-control-ui"?: string; "data-control-family"?: string; "data-slot"?: string };
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
      "data-control-family": triggerProps["data-control-family"] ?? "collapsible",
      "data-slot": triggerProps["data-slot"] ?? "trigger",
      "data-state": open ? "open" : "closed",
      className: cn(triggerProps.className, className),
      children,
    },
  });
}

// emits its own anatomy and state hooks, so consumers never style on Base UI's private attributes
export function Collapsible({ className, ...props }: CollapsibleProps) {
  return (
    <CollapsiblePrimitive.Root
      className={className}
      render={(renderProps, state) => (
        <div
          data-control-ui="collapsible"
          data-control-family="collapsible"
          data-slot="root"
          {...renderProps}
          data-state={state.open ? "open" : "closed"}
          className={renderProps.className}
        />
      )}
      {...props}
    />
  );
}

export function CollapsibleTrigger({ render, className, children, ...props }: CollapsibleTriggerProps) {
  return (
    <CollapsiblePrimitive.Trigger
      data-control-ui="collapsible"
      data-control-family="collapsible"
      data-slot="trigger"
      className="cursor-pointer"
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
      className="h-[var(--collapsible-panel-height)] overflow-hidden data-ending-style:h-0 data-starting-style:h-0"
      {...props}
      render={(renderProps, state) => (
        <div
          data-control-ui="collapsible"
          data-control-family="collapsible"
          data-slot="content"
          {...renderProps}
          data-state={state.open ? "open" : "closed"}
          className={renderProps.className}
        />
      )}
    >
      <div className={className}>{children}</div>
    </CollapsiblePrimitive.Panel>
  );
}
