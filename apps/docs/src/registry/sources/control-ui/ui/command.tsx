"use client";

import { Command as CommandPrimitive } from "cmdk";
import type { ComponentProps, CSSProperties } from "react";
import { controlSize } from "@/components/control-ui/control-variants";
import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts/popup-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { popupItemStructureClasses } from "@/components/control-ui/surface-variants";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/control-ui/ui/dialog";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";

export type CommandProps = Omit<ComponentProps<typeof CommandPrimitive>, "style"> & { style?: CSSProperties & PopupKnobStyle };

export function Command({ className, ...props }: CommandProps) {
  return (
    <CommandPrimitive
      data-control-ui="command"
      data-popup-kind="command"
      data-slot="root"
      data-control-family="popup"
      data-popup-part="surface"
      data-popup-static=""
      data-surface="panel"
      className={cn("flex h-full w-full flex-col overflow-hidden", className)}
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
        <Command
          {...commandProps}
          data-control-ui="command"
          data-popup-kind="command"
          data-control-family="popup"
          data-slot="dialog-root"
          className={cn("grid grid-rows-[auto_1fr] in-data-[starting-style]:grid-rows-[auto_0fr]", commandProps?.className)}
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

export type CommandInputProps = Omit<ComponentProps<typeof CommandPrimitive.Input>, "style"> & { style?: CSSProperties & PopupKnobStyle };

export function CommandInput({ className, ...props }: CommandInputProps) {
  return (
    <div
      data-control-ui="command"
      data-popup-kind="command"
      data-slot="input-wrapper"
      data-control-family="popup"
      data-control="true"
      data-size="lg"
      className={cn("flex items-center", controlSize({ size: "lg" }), "px-3")}
    >
      <svg
        data-control-ui="command"
        data-popup-kind="command"
        data-control-family="popup"
        data-slot="input-icon"
        viewBox="0 0 16 16"
        className="size-4 shrink-0"
        aria-hidden="true"
        fill="none"
      >
        <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.3" />
        <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
      <CommandPrimitive.Input
        data-control-ui="command"
        data-popup-kind="command"
        data-control-family="popup"
        data-slot="input"
        className={cn("h-full w-full disabled:cursor-not-allowed", className)}
        {...props}
      />
    </div>
  );
}

export function CommandList({
  className,
  ...props
}: ComponentProps<typeof CommandPrimitive.List> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <ScrollArea maxHeight="min(360px, var(--available-height, 360px))" className="min-h-0 w-full">
      <CommandPrimitive.List
        data-control-ui="command"
        data-control-family="popup"
        data-popup-kind="command"
        data-slot="list"
        className={cn("p-[var(--popover-padding)]", className)}
        {...props}
      />
    </ScrollArea>
  );
}

export type CommandEmptyProps = Omit<ComponentProps<typeof CommandPrimitive.Empty>, "style"> & { style?: CSSProperties & PopupKnobStyle };

export function CommandEmpty({ className, ...props }: CommandEmptyProps) {
  return (
    <CommandPrimitive.Empty
      data-control-ui="command"
      data-control-family="popup"
      data-popup-kind="command"
      data-slot="empty"
      className={cn("py-6", className)}
      {...props}
    />
  );
}

export type CommandGroupProps = Omit<ComponentProps<typeof CommandPrimitive.Group>, "style"> & { style?: CSSProperties & PopupKnobStyle };

export function CommandGroup({ className, ...props }: CommandGroupProps) {
  return (
    <CommandPrimitive.Group
      data-control-ui="command"
      data-control-family="popup"
      data-popup-kind="command"
      data-slot="group"
      className={cn(
        "overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:uppercase",
        className,
      )}
      {...props}
    />
  );
}

export type CommandSeparatorProps = Omit<ComponentProps<typeof CommandPrimitive.Separator>, "style"> & {
  style?: CSSProperties & PopupKnobStyle;
};

export function CommandSeparator({ className, ...props }: CommandSeparatorProps) {
  return (
    <CommandPrimitive.Separator
      data-control-ui="command"
      data-popup-kind="command"
      data-control-family="popup"
      data-popup-part="separator"
      data-slot="separator"
      className={cn("-mx-[var(--popover-padding)] my-1 h-px", className)}
      {...props}
    />
  );
}

export type CommandItemProps = Omit<ComponentProps<typeof CommandPrimitive.Item>, "style"> & { style?: CSSProperties & PopupKnobStyle };

export function CommandItem({ className, disabled, onSelect, ...props }: CommandItemProps) {
  function handleSelect(value: string) {
    if (disabled) return;
    onSelect?.(value);
  }

  return (
    <CommandPrimitive.Item
      data-control-ui="command"
      data-popup-kind="command"
      data-control-family="popup"
      data-popup-part="item"
      data-slot="item"
      className={cn("relative", popupItemStructureClasses, className)}
      {...props}
      data-disabled={disabled ? "true" : undefined}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onSelect={handleSelect}
    />
  );
}

export type CommandShortcutProps = Omit<ComponentProps<"span">, "style"> & { style?: CSSProperties & PopupKnobStyle };

export function CommandShortcut({ className, ...props }: CommandShortcutProps) {
  return (
    <span
      data-control-ui="command"
      data-popup-kind="command"
      data-control-family="popup"
      data-popup-part="shortcut"
      data-slot="shortcut"
      className={cn("ml-auto pl-6", className)}
      {...props}
    />
  );
}
