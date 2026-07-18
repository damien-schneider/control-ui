"use client";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";
import type { AccordionItemProps, AccordionPanelProps, AccordionProps, AccordionTriggerProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

// 100% Base UI: Panel height animates via Base UI's --accordion-panel-height var (pure CSS, no JS measuring).
// Header h3 stays a structural wrapper (no data-slot), mirroring Collapsible's content wrapper.
export function Accordion({ className, ...props }: AccordionProps) {
  return (
    <AccordionPrimitive.Root
      data-control-ui="accordion"
      data-slot="root"
      className={cn(skinSlot("accordion", "root", {}), className)}
      {...props}
    />
  );
}

export function AccordionItem({ className, ...props }: AccordionItemProps) {
  return (
    <AccordionPrimitive.Item
      data-control-ui="accordion"
      data-slot="item"
      className={cn("border-b border-border last:border-b-0", skinSlot("accordion", "item", {}), className)}
      {...props}
    />
  );
}

export function AccordionTrigger({ className, children, ...props }: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-control-ui="accordion"
        data-slot="trigger"
        className={cn(
          "group flex flex-1 items-center justify-between gap-4 py-3 text-left text-sm font-medium text-foreground outline-none",
          "cursor-pointer select-none transition-colors hover:text-foreground/80 focus-visible:ring-2 focus-visible:ring-foreground/20",
          "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
          skinSlot("accordion", "trigger", {}),
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-[var(--duration-base)] ease-[var(--ease-standard)] group-data-[panel-open]:rotate-180"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionPanel({ className, children, ...props }: AccordionPanelProps) {
  return (
    <AccordionPrimitive.Panel
      data-control-ui="accordion"
      data-slot="panel"
      className={cn(
        "h-[var(--accordion-panel-height)] overflow-hidden text-sm text-muted-foreground",
        "transition-[height] duration-[var(--duration-base)] ease-[var(--ease-emphasized)]",
        "data-[starting-style]:h-0 data-[ending-style]:h-0",
        skinSlot("accordion", "panel", {}),
      )}
      {...props}
    >
      <div className={cn("pb-3", className)}>{children}</div>
    </AccordionPrimitive.Panel>
  );
}
