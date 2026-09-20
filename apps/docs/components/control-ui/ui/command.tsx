"use client";

import { Command as CommandPrimitive, useCommandState } from "cmdk";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts/popup-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { popupItemStructureClasses } from "@/components/control-ui/surface-variants";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/control-ui/ui/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/control-ui/ui/empty";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";

export type CommandChrome = "standalone" | "embedded";

export type CommandProps = Omit<ComponentProps<typeof CommandPrimitive>, "style"> & {
  chrome?: CommandChrome;
  style?: CSSProperties & PopupKnobStyle;
};

export function Command({ chrome = "standalone", className, ...props }: CommandProps) {
  return (
    <CommandPrimitive
      data-control-ui="command"
      data-popup-kind="command"
      data-slot="root"
      data-control-family="popup"
      data-popup-part={chrome === "standalone" ? "surface" : undefined}
      data-popup-static=""
      data-chrome={chrome}
      data-surface={chrome === "standalone" ? "panel" : undefined}
      className={cn("flex h-full w-full flex-col", className)}
      {...props}
    />
  );
}

export function CommandDialog({
  title = "Command palette",
  description = "Search for a command to run…",
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
      <DialogContent className={cn("p-0", className)} showCloseButton={false}>
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{description}</DialogDescription>
        <Command
          chrome="embedded"
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
  const hasResults = useCommandState((state) => state.filtered.count > 0);
  return (
    <div
      data-control-ui="command"
      data-popup-kind="command"
      data-slot="input-wrapper"
      data-control-family="popup"
      data-control="true"
      data-size="lg"
      className="flex items-center"
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
        asChild
        data-control-ui="command"
        data-popup-kind="command"
        data-control-family="popup"
        data-slot="input"
        className={cn("h-full w-full disabled:cursor-not-allowed", className)}
        {...props}
      >
        <input role="combobox" aria-expanded={hasResults} />
      </CommandPrimitive.Input>
    </div>
  );
}

function CommandListSurface({ hasResults, ...props }: ComponentProps<"div"> & { hasResults: boolean }) {
  return <div {...props} role={hasResults ? "listbox" : "group"} />;
}

export function CommandList({
  className,
  children,
  ...props
}: ComponentProps<typeof CommandPrimitive.List> & { style?: CSSProperties & PopupKnobStyle }) {
  const hasResults = useCommandState((state) => state.filtered.count > 0);
  return (
    <ScrollArea maxHeight="min(360px, var(--available-height, 360px))" className="min-h-0 w-full">
      <CommandPrimitive.List
        asChild
        data-control-ui="command"
        data-control-family="popup"
        data-popup-kind="command"
        data-slot="list"
        className={cn("p-[var(--popover-padding)]", className)}
        {...props}
      >
        <CommandListSurface hasResults={hasResults}>{children}</CommandListSurface>
      </CommandPrimitive.List>
    </ScrollArea>
  );
}

export type CommandEmptyProps = Omit<ComponentProps<typeof CommandPrimitive.Empty>, "style" | "title"> & {
  style?: CSSProperties & PopupKnobStyle;
  title?: ReactNode;
  description?: ReactNode;
};

export function CommandEmpty({
  className,
  children,
  title = "No results found",
  description = "Try a different search term.",
  ...props
}: CommandEmptyProps) {
  return (
    <CommandPrimitive.Empty
      asChild
      data-control-ui="command"
      data-control-family="popup"
      data-popup-kind="command"
      data-slot="empty"
      className={className}
      {...props}
    >
      <div role="status">
        {children ?? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia>
                <CommandEmptyIcon />
              </EmptyMedia>
              <EmptyTitle>{title}</EmptyTitle>
              {description ? <EmptyDescription>{description}</EmptyDescription> : null}
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </CommandPrimitive.Empty>
  );
}

function CommandEmptyIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.3" />
      <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
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
      className={cn("p-[var(--popover-padding)]", className)}
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
      aria-hidden="true"
      data-control-ui="command"
      data-popup-kind="command"
      data-control-family="popup"
      data-popup-part="separator"
      data-slot="separator"
      className={cn(className)}
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
      className={cn(className)}
      {...props}
    />
  );
}
