"use client";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";
import type { AccordionItemProps, AccordionPanelProps, AccordionProps, AccordionTriggerProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";

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
        className={cn("group flex flex-1 cursor-pointer select-none items-center justify-between gap-4 py-3", className)}
        {...props}
      >
        {children}
        <ChevronDown
          aria-hidden="true"
          data-control-ui="accordion"
          data-control-family="accordion"
          data-slot="icon"
          className="size-4 shrink-0"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionPanel({ className, children, ...props }: AccordionPanelProps) {
  return (
    <AccordionPrimitive.Panel data-control-ui="accordion" data-control-family="accordion" data-slot="panel" {...props}>
      <div className={cn("pb-3", className)}>{children}</div>
    </AccordionPrimitive.Panel>
  );
}
