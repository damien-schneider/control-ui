"use client";

import { Command as CommandPrimitive } from "cmdk";
import type { ComponentProps } from "react";
import { controlSize } from "@/components/control-ui/control-variants";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";
import { floatingListItemClasses } from "@/components/control-ui/surface-variants";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/control-ui/ui/dialog";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";

// Command palette on cmdk; rows share --radius-popup-item/--control-h-xs with menu/select rows.
// CommandDialog composes the Control UI Dialog, inheriting panel/backdrop/portal skin scope for free.
export function Command({ className, ...props }: ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-control-ui="command"
      data-slot="root"
      data-surface="panel"
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-popover)] bg-popover text-popover-foreground",
        skinSlot("command", "root", {}),
        className,
      )}
      {...props}
    />
  );
}

export function CommandDialog({
  title = "Command palette",
  description = "Search for a command to run...",
  children,
  className,
  commandProps,
  ...props
}: ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
  className?: string;
  commandProps?: ComponentProps<typeof Command>;
}) {
  return (
    <Dialog {...props}>
      <DialogContent className={cn("overflow-hidden p-0", className)} showCloseButton={false}>
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{description}</DialogDescription>
        {/* Two-phase reveal: the popup lands as just the input row, then the results row unfolds
            0fr → 1fr after a beat — rides the popup's data-starting-style frame, CSS only. */}
        <Command
          {...commandProps}
          className={cn(
            "grid grid-rows-[auto_1fr] transition-[grid-template-rows] duration-[var(--duration-slow)] ease-[var(--ease-emphasized)] delay-[var(--duration-fast)] in-data-[starting-style]:grid-rows-[auto_0fr]",
            commandProps?.className,
          )}
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

export function CommandInput({ className, ...props }: ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-control-ui="command"
      data-slot="input-wrapper"
      data-size="lg"
      className={cn("flex items-center border-b", controlSize({ size: "lg" }), "px-3", skinSlot("command", "input-wrapper", {}))}
    >
      <svg viewBox="0 0 16 16" className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" fill="none">
        <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.3" />
        <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
      <CommandPrimitive.Input
        data-control-ui="command"
        data-slot="input"
        className={cn(
          "h-full w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          skinSlot("command", "input", {}),
          className,
        )}
        {...props}
      />
    </div>
  );
}

// ScrollArea (overlay scrollbar + edge fade) instead of cmdk's bare overflow div; cmdk still owns the
// listbox (role/aria-activedescendant), scrollIntoView finds ScrollArea's viewport as nearest scrollable ancestor.
export function CommandList({ className, ...props }: ComponentProps<typeof CommandPrimitive.List>) {
  return (
    // min-h-0 lets CommandDialog's collapsing 0fr row actually shrink this grid item (auto minimum otherwise wins).
    <ScrollArea maxHeight="min(360px, var(--available-height, 360px))" className="min-h-0 w-full">
      <CommandPrimitive.List
        data-control-ui="command"
        data-slot="list"
        className={cn("p-[var(--popover-padding)]", skinSlot("command", "list", {}), className)}
        {...props}
      />
    </ScrollArea>
  );
}

export function CommandEmpty({ className, ...props }: ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-control-ui="command"
      data-slot="empty"
      className={cn("py-6 text-center text-body text-muted-foreground", skinSlot("command", "empty", {}), className)}
      {...props}
    />
  );
}

export function CommandGroup({ className, ...props }: ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-control-ui="command"
      data-slot="group"
      className={cn(
        "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-caption [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.08em] [&_[cmdk-group-heading]]:text-muted-foreground",
        skinSlot("command", "group", {}),
        className,
      )}
      {...props}
    />
  );
}

export function CommandSeparator({ className, ...props }: ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-control-ui="command"
      data-slot="separator"
      className={cn("-mx-[var(--popover-padding)] my-1 h-px bg-border", skinSlot("command", "separator", {}), className)}
      {...props}
    />
  );
}

export function CommandItem({ className, disabled, onSelect, ...props }: ComponentProps<typeof CommandPrimitive.Item>) {
  function handleSelect(value: string) {
    if (disabled) return;
    onSelect?.(value);
  }

  return (
    <CommandPrimitive.Item
      data-control-ui="command"
      data-slot="item"
      className={cn(floatingListItemClasses, "relative py-1.5", skinSlot("command", "item", {}), className)}
      {...props}
      data-disabled={disabled ? "true" : undefined}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onSelect={handleSelect}
    />
  );
}

export function CommandShortcut({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-control-ui="command"
      data-slot="shortcut"
      className={cn("ml-auto pl-6 text-label tracking-[0.02em] text-muted-foreground", skinSlot("command", "shortcut", {}), className)}
      {...props}
    />
  );
}
