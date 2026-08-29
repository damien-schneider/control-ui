"use client";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";
import type { ComponentProps, CSSProperties } from "react";
import type { AccordionKnobStyle } from "@/components/control-ui/knob-contracts/accordion-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type AccordionValue = (string | number)[];

export type AccordionProps = Omit<ComponentProps<"div">, "defaultValue" | "onChange"> & {
  value?: AccordionValue;
  defaultValue?: AccordionValue;
  onValueChange?: (value: AccordionValue) => void;
  multiple?: boolean;
  disabled?: boolean;
} & { style?: CSSProperties & AccordionKnobStyle };

export type AccordionItemProps = Omit<
  ComponentProps<"div"> & {
    value?: string | number;
    disabled?: boolean;
  },
  "style"
> & { style?: CSSProperties & AccordionKnobStyle };

export type AccordionTriggerProps = Omit<ComponentProps<"button">, "style"> & { style?: CSSProperties & AccordionKnobStyle };

export type AccordionPanelProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & AccordionKnobStyle };

// Panel height animates from Base UI's --accordion-panel-height, with no JS measuring.
export function Accordion({ className, ...props }: AccordionProps) {
  return (
    <AccordionPrimitive.Root
      data-control-ui="accordion"
      data-control-family="accordion"
      data-slot="root"
      className={className}
      {...props}
    />
  );
}

export function AccordionItem({ className, ...props }: AccordionItemProps) {
  return (
    <AccordionPrimitive.Item
      data-control-ui="accordion"
      data-control-family="accordion"
      data-slot="item"
      className={className}
      {...props}
    />
  );
}

export function AccordionTrigger({ className, children, ...props }: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-control-ui="accordion"
        data-control-family="accordion"
        data-slot="trigger"
        className={cn("group flex flex-1 cursor-pointer select-none items-center justify-between", className)}
        {...props}
      >
        {children}
        <ChevronDown aria-hidden="true" data-control-ui="accordion" data-control-family="accordion" data-slot="icon" className="shrink-0" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionPanel({ className, children, ...props }: AccordionPanelProps) {
  return (
    <AccordionPrimitive.Panel data-control-ui="accordion" data-control-family="accordion" data-slot="panel" {...props}>
      <div data-control-ui="accordion" data-control-family="accordion" data-slot="panel-content" className={className}>
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
}
