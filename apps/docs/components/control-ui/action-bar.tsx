"use client";

import { Toolbar as ToolbarPrimitive } from "@base-ui/react/toolbar";
import type { ComponentProps, CSSProperties, MouseEvent, ReactNode } from "react";
import { createContext, useContext } from "react";
import { useCopyToClipboard } from "@/components/control-ui/hooks/use-copy-to-clipboard";
import type { ActionBarKnobStyle } from "@/components/control-ui/knob-contracts/action-bar-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { Button } from "@/components/control-ui/ui/button";
import { LiveStatus } from "@/components/control-ui/ui/live-status";

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
      <ToolbarPrimitive.Root
        {...props}
        data-control-ui="action-bar"
        data-control-family="action-bar"
        data-slot="root"
        aria-label={label}
        className={cn("flex items-center", align === "end" ? "justify-end" : "justify-start", className)}
      >
        {children}
      </ToolbarPrimitive.Root>
    </ActionBarContext.Provider>
  );
}

type ActionBarItemBaseProps = Omit<ComponentProps<typeof Button>, "iconOnly" | "children"> & {
  icon?: ReactNode;
};

export type ActionBarItemProps = ActionBarItemBaseProps &
  ({ children: NonNullable<ReactNode> } | { children?: null; "aria-label": string });

export function ActionBarItem({ icon, children, active, disabled, ...props }: ActionBarItemProps) {
  return (
    <ToolbarPrimitive.Button
      disabled={disabled}
      focusableWhenDisabled={false}
      render={
        <Button size="xs" active={active} aria-pressed={active} iconOnly={children == null} {...props}>
          {icon}
          {children}
        </Button>
      }
    />
  );
}

export type ActionBarCopyProps = ActionBarItemBaseProps & {
  value?: ActionBarCopyValue;
  children?: NonNullable<ReactNode>;
  copiedChildren?: ReactNode;
  copiedAriaLabel?: string;
  copyFailedLabel?: string;
  resetDelay?: number;
};

export function ActionBarCopy({
  value,
  children = "Copy",
  copiedChildren = "Copied",
  copiedAriaLabel = "Copied to clipboard",
  copyFailedLabel = "Couldn't copy. Select the text and copy it manually.",
  resetDelay = 1200,
  disabled,
  onClick,
  ...props
}: ActionBarCopyProps) {
  const { copyValue: contextCopyValue, onCopy, onCopyError } = useContext(ActionBarContext);
  const copyValue = value ?? contextCopyValue;
  const { status, copyToClipboard } = useCopyToClipboard({
    copiedDuration: resetDelay,
    onCopy,
    onCopyError,
  });

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;

    try {
      const nextValue = await resolveCopyValue(copyValue);
      if (!nextValue) return;
      await copyToClipboard(nextValue);
    } catch (error) {
      onCopyError?.(error);
    }
  }

  let copyStatus = "";
  if (status === "copied") copyStatus = copiedAriaLabel;
  else if (status === "failed") copyStatus = copyFailedLabel;

  return (
    <>
      <ActionBarItem disabled={disabled ?? !copyValue} onClick={handleClick} {...props}>
        {status === "copied" ? (
          <>
            <span aria-hidden="true" className="contents">
              {copiedChildren}
            </span>
            <span className="sr-only">{children}</span>
          </>
        ) : (
          children
        )}
      </ActionBarItem>
      <LiveStatus message={copyStatus} />
    </>
  );
}

export type ActionBarEditProps = ActionBarItemBaseProps & {
  value?: ActionBarCopyValue;
  children?: NonNullable<ReactNode>;
};

export function ActionBarEdit({ value, children = "Edit", disabled, onClick, ...props }: ActionBarEditProps) {
  const { copyValue, editValue: contextEditValue, onEdit, onEditError } = useContext(ActionBarContext);
  const editValue = value ?? contextEditValue ?? copyValue;

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented || !onEdit) return;

    try {
      const nextValue = await resolveCopyValue(editValue);
      if (nextValue === undefined) return;
      onEdit(nextValue);
    } catch (error) {
      onEditError?.(error);
    }
  }

  return (
    <ActionBarItem disabled={disabled ?? (editValue === undefined || !onEdit)} onClick={handleClick} {...props}>
      {children}
    </ActionBarItem>
  );
}
