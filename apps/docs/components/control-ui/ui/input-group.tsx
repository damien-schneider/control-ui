"use client";

import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps } from "react";

import type { InputGroupAddonProps, InputGroupProps } from "@/components/control-ui/contracts";
import { controlSize } from "@/components/control-ui/control-variants";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

// Refined skin slot: InputGroup = addon+field as one control, shares --radius-control/controlSize w/ Input/Button/Select.
// Focus ring lifts on focus-within so group reads as single field.

export function InputGroup({ size = "md", className, render, children, ...props }: InputGroupProps) {
  const classes = cn(
    "flex min-w-0 w-full items-center overflow-hidden rounded-[var(--radius-control)] border bg-card/72 text-foreground shadow-sm outline-none transition focus-within:ring-2 focus-within:ring-foreground/20 aria-invalid:ring-2 aria-invalid:ring-destructive data-[invalid]:ring-2 data-[invalid]:ring-destructive",
    controlSize({ size }),
    skinSlot("input-group", "root", { size }),
    className,
  );

  return useRender({
    defaultTagName: "div",
    render,
    props: {
      ...props,
      "data-control-ui": "input-group",
      "data-slot": "root",
      "data-size": size,
      className: classes,
      children,
    },
  });
}

export function InputGroupAddon({ className, ...props }: InputGroupAddonProps) {
  return (
    <span
      data-control-ui="input-group"
      data-slot="addon"
      className={cn("inline-flex shrink-0 items-center text-muted-foreground", skinSlot("input-group", "addon", {}), className)}
      {...props}
    />
  );
}

export function InputGroupInput({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      data-control-ui="input-group"
      data-slot="input"
      className={cn(
        "h-full min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        skinSlot("input-group", "input", {}),
        className,
      )}
      {...props}
    />
  );
}
