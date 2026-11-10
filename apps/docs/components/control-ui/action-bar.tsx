"use client";

import { Toolbar as ToolbarPrimitive } from "@base-ui/react/toolbar";
import { CheckIcon, CopyIcon, PencilIcon } from "lucide-react";
import type { ComponentProps, CSSProperties, MouseEvent, ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useCopyToClipboard } from "@/components/control-ui/hooks/use-copy-to-clipboard";
import type { ActionBarKnobStyle } from "@/components/control-ui/knob-contracts/action-bar-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { Button } from "@/components/control-ui/ui/button";
import { LiveStatus } from "@/components/control-ui/ui/live-status";
import { Swap, SwapItem } from "@/components/control-ui/ui/swap";

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
  copyValue,
  editValue,
  onCopy,
  onCopyError,
  onEdit,
  onEditError,
  "aria-label": ariaLabel,
  ...props
}: ActionBarProps) {
  const actionContext = { copyValue, editValue, onCopy, onCopyError, onEdit, onEditError };

  return (
    <ActionBarContext.Provider value={actionContext}>
      <ToolbarPrimitive.Root
        {...props}
        data-control-ui="action-bar"
        data-control-family="action-bar"
        data-slot="root"
        aria-label={ariaLabel ?? label}
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
  children,
  copiedChildren,
  copiedAriaLabel = "Copied to clipboard",
  copyFailedLabel = "Couldn't copy. Select the text and copy it manually.",
  resetDelay = 1200,
  disabled,
  onClick,
  "aria-label": ariaLabel,
  ...props
}: ActionBarCopyProps) {
  const { copyValue: contextCopyValue, onCopy, onCopyError } = useContext(ActionBarContext);
  const copyValue = value ?? contextCopyValue;
  const { status, copyToClipboard } = useCopyToClipboard({
    copiedDuration: resetDelay,
    onCopy,
    onCopyError,
  });
  const [resolveFailed, setResolveFailed] = useState(false);

  useEffect(() => {
    if (!resolveFailed) return;
    const timeout = window.setTimeout(() => setResolveFailed(false), resetDelay);
    return () => window.clearTimeout(timeout);
  }, [resolveFailed, resetDelay]);

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;

    setResolveFailed(false);
    try {
      const nextValue = await resolveCopyValue(copyValue);
      if (!nextValue) return;
      await copyToClipboard(nextValue);
    } catch (error) {
      onCopyError?.(error);
      setResolveFailed(true);
    }
  }

  const copied = status === "copied";
  let copyStatus = "";
  if (copied) copyStatus = copiedAriaLabel;
  else if (status === "failed" || resolveFailed) copyStatus = copyFailedLabel;

  const isIconOnly = children === undefined;
  const swap = (
    <Swap value={copied ? "copied" : "idle"}>
      <SwapItem value="idle">{children ?? <CopyIcon aria-hidden="true" />}</SwapItem>
      <SwapItem value="copied" aria-hidden="true">
        {copiedChildren ?? (isIconOnly ? <CheckIcon aria-hidden="true" /> : "Copied")}
      </SwapItem>
    </Swap>
  );

  return (
    <>
      {isIconOnly ? (
        <ActionBarItem aria-label={ariaLabel ?? "Copy"} icon={swap} disabled={disabled ?? !copyValue} onClick={handleClick} {...props} />
      ) : (
        <ActionBarItem aria-label={ariaLabel} disabled={disabled ?? !copyValue} onClick={handleClick} {...props}>
          {swap}
          {copied ? <span className="sr-only">{children}</span> : null}
        </ActionBarItem>
      )}
      <LiveStatus message={copyStatus} />
    </>
  );
}

export type ActionBarEditProps = ActionBarItemBaseProps & {
  value?: ActionBarCopyValue;
  children?: NonNullable<ReactNode>;
};

export function ActionBarEdit({ value, children, disabled, onClick, "aria-label": ariaLabel, ...props }: ActionBarEditProps) {
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

  const itemDisabled = disabled ?? (editValue === undefined || !onEdit);

  if (children === undefined) {
    return (
      <ActionBarItem
        aria-label={ariaLabel ?? "Edit"}
        icon={<PencilIcon aria-hidden="true" />}
        disabled={itemDisabled}
        onClick={handleClick}
        {...props}
      />
    );
  }

  return (
    <ActionBarItem aria-label={ariaLabel} disabled={itemDisabled} onClick={handleClick} {...props}>
      {children}
    </ActionBarItem>
  );
}
