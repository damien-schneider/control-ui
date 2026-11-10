"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import type { SwitchKnobStyle } from "@/components/control-ui/knob-contracts/switch-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { useSwitchDrag } from "./use-switch-drag";

export type SwitchProps = Omit<
  ComponentProps<typeof SwitchPrimitive.Root>,
  "className" | "style" | "children" | "render" | "nativeButton"
> & {
  className?: string;
  icon?: ReactNode;
  checkedIcon?: ReactNode;
  uncheckedIcon?: ReactNode;
  style?: CSSProperties & SwitchKnobStyle;
};

function chainHandlers<E extends { defaultPrevented: boolean }>(
  ours: ((event: E) => void) | undefined,
  theirs: ((event: E) => void) | undefined,
) {
  if (!theirs) return ours;
  return (event: E) => {
    ours?.(event);
    if (!event.defaultPrevented) theirs(event);
  };
}

export function Switch({
  className,
  icon,
  checkedIcon,
  uncheckedIcon,
  style,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onLostPointerCapture,
  onClick,
  onKeyDown,
  ...props
}: SwitchProps) {
  const { thumbRef, dragProps, dragProgress } = useSwitchDrag();
  const dragStyle = { "--_switch-drag-progress": dragProgress ?? 0 };
  const hasStateIcons = checkedIcon !== undefined || uncheckedIcon !== undefined;
  const hasIcon = icon !== undefined || hasStateIcons;
  const singleIcon = hasStateIcons ? undefined : icon;
  const onIcon = checkedIcon ?? icon;
  const offIcon = uncheckedIcon ?? icon;
  return (
    <SwitchPrimitive.Root
      data-control-ui="switch"
      data-control-family="switch"
      data-slot="root"
      data-dragging={dragProgress !== null ? "" : undefined}
      data-drag-checked={dragProgress === null ? undefined : dragProgress >= 0.5}
      style={{ ...style, ...dragStyle }}
      nativeButton
      render={<button type="button" />}
      className={cn("relative inline-flex shrink-0 items-center", className)}
      {...props}
      onPointerDown={chainHandlers(dragProps.onPointerDown, onPointerDown)}
      onPointerMove={chainHandlers(dragProps.onPointerMove, onPointerMove)}
      onPointerUp={chainHandlers(dragProps.onPointerUp, onPointerUp)}
      onPointerCancel={chainHandlers(dragProps.onPointerCancel, onPointerCancel)}
      onLostPointerCapture={chainHandlers(dragProps.onLostPointerCapture, onLostPointerCapture)}
      onClick={chainHandlers(dragProps.onClick, onClick)}
      onKeyDown={chainHandlers(dragProps.onKeyDown, onKeyDown)}
    >
      <SwitchPrimitive.Thumb
        ref={thumbRef}
        data-control-ui="switch"
        data-control-family="switch"
        data-slot="thumb"
        className="pointer-events-none relative block"
      >
        {hasIcon ? <SwitchThumbIcon icon={singleIcon} checkedIcon={onIcon} uncheckedIcon={offIcon} /> : null}
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
}

function SwitchThumbIcon({ icon, checkedIcon, uncheckedIcon }: { icon?: ReactNode; checkedIcon?: ReactNode; uncheckedIcon?: ReactNode }) {
  const base = "absolute inset-0 flex items-center justify-center";

  if (icon !== undefined) {
    return (
      <span aria-hidden data-control-ui="switch" data-control-family="switch" data-slot="thumb-icon" className={base}>
        {icon}
      </span>
    );
  }

  return (
    <>
      {uncheckedIcon !== undefined ? (
        <span
          aria-hidden
          data-control-ui="switch"
          data-control-family="switch"
          data-slot="thumb-icon"
          data-switch-icon="unchecked"
          className={base}
        >
          {uncheckedIcon}
        </span>
      ) : null}
      {checkedIcon !== undefined ? (
        <span
          aria-hidden
          data-control-ui="switch"
          data-control-family="switch"
          data-slot="thumb-icon"
          data-switch-icon="checked"
          className={base}
        >
          {checkedIcon}
        </span>
      ) : null}
    </>
  );
}
