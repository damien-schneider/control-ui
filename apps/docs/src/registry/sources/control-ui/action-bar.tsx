"use client";

import type { ComponentProps, CSSProperties, MouseEvent, ReactNode } from "react";
import { createContext, useContext } from "react";
import { useCopyToClipboard } from "@/components/control-ui/hooks/use-copy-to-clipboard";
import type { ActionBarKnobStyle } from "@/components/control-ui/knob-contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { Button } from "@/components/control-ui/ui/button";

export type ActionBarCopyValue = string | (() => string | Promise<string>);

export type ActionBarContextValue = {
  copyValue?: ActionBarCopyValue;
  editValue?: ActionBarCopyValue;
  onCopy?: (value: string) => void;
  onCopyError?: (error: unknown) => void;
  onEdit?: (value: string) => void;
  onEditError?: (error: unknown) => void;
};

export type ActionBarProps = Omit<ComponentProps<"div">, "style"> & {
  label?: string;
  align?: "start" | "end";
  context?: ActionBarContextValue;
  copyValue?: ActionBarCopyValue;
  editValue?: ActionBarCopyValue;
  onCopy?: (value: string) => void;
  onCopyError?: (error: unknown) => void;
  onEdit?: (value: string) => void;
  onEditError?: (error: unknown) => void;
  style?: CSSProperties & ActionBarKnobStyle;
};

const ActionBarContext = createContext<ActionBarContextValue>({});

async function resolveCopyValue(value?: ActionBarCopyValue) {
  return typeof value === "function" ? await value() : value;
}

export function ActionBar({
  label = "Message actions",
  align = "start",
  className,
  children,
  context,
  copyValue,
  editValue,
  onCopy,
  onCopyError,
  onEdit,
  onEditError,
  ...props
}: ActionBarProps) {
  const actionContext = {
    ...context,
    copyValue: copyValue ?? context?.copyValue,
    editValue: editValue ?? context?.editValue,
    onCopy: onCopy ?? context?.onCopy,
    onCopyError: onCopyError ?? context?.onCopyError,
    onEdit: onEdit ?? context?.onEdit,
    onEditError: onEditError ?? context?.onEditError,
  };

  return (
    <ActionBarContext.Provider value={actionContext}>
      <div
        data-control-ui="action-bar"
        data-control-family="action-bar"
        data-slot="root"
        role="toolbar"
        aria-label={label}
        className={cn("mt-1 flex min-h-8 items-center gap-1", align === "end" ? "justify-end" : "justify-start", className)}
        {...props}
      >
        {children}
      </div>
    </ActionBarContext.Provider>
  );
}

export type ActionBarItemProps = ComponentProps<typeof Button> & {
  icon?: ReactNode;
};

export function ActionBarItem({ icon, children, className, ...props }: ActionBarItemProps) {
  return (
    <Button size="xs" className={className} {...props}>
      {icon}
      {children}
    </Button>
  );
}

export type ActionBarCopyProps = Omit<ActionBarItemProps, "children"> & {
  value?: ActionBarCopyValue;
  children?: ReactNode;
  copiedChildren?: ReactNode;
  resetDelay?: number;
};

export function ActionBarCopy({
  value,
  children = "Copy",
  copiedChildren = "Copied",
  resetDelay = 1200,
  disabled,
  onClick,
  ...props
}: ActionBarCopyProps) {
  const { copyValue: contextCopyValue, onCopy, onCopyError } = useContext(ActionBarContext);
  const copyValue = value ?? contextCopyValue;
  const { isCopied, copyToClipboard } = useCopyToClipboard({
    copiedDuration: resetDelay,
    onCopy,
    onCopyError,
  });

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;

    const nextValue = await resolveCopyValue(copyValue);
    if (!nextValue) return;

    await copyToClipboard(nextValue);
  }

  return (
    <ActionBarItem aria-live="polite" disabled={disabled ?? !copyValue} onClick={handleClick} {...props}>
      {isCopied ? copiedChildren : children}
    </ActionBarItem>
  );
}

export type ActionBarEditProps = Omit<ActionBarItemProps, "children"> & {
  value?: ActionBarCopyValue;
  children?: ReactNode;
};

export function ActionBarEdit({ value, children = "Edit", disabled, onClick, ...props }: ActionBarEditProps) {
  const { copyValue, editValue: contextEditValue, onEdit, onEditError } = useContext(ActionBarContext);
  const editValue = value ?? contextEditValue ?? copyValue;

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented || !onEdit) return;

    try {
      const nextValue = await resolveCopyValue(editValue);
      if (!nextValue) return;
      onEdit(nextValue);
    } catch (error) {
      onEditError?.(error);
    }
  }

  return (
    <ActionBarItem disabled={disabled ?? (!editValue || !onEdit)} onClick={handleClick} {...props}>
      {children}
    </ActionBarItem>
  );
}
