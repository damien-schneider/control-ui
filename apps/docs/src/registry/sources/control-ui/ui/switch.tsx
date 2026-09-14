"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import type { CSSProperties, ReactNode } from "react";
import type { SwitchKnobStyle } from "@/components/control-ui/knob-contracts/switch-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { useSwitchDrag } from "./use-switch-drag";

export type SwitchProps = Omit<
  {
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    name?: string;
    value?: string;
    id?: string;
    className?: string;
    icon?: ReactNode;
    checkedIcon?: ReactNode;
    uncheckedIcon?: ReactNode;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
  },
  "style"
> & { style?: CSSProperties & SwitchKnobStyle };

export function Switch({
  className,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  readOnly,
  required,
  name,
  value,
  id,
  icon,
  checkedIcon,
  uncheckedIcon,
  style,
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
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      name={name}
      value={value}
      id={id}
      nativeButton
      render={<button type="button" />}
      className={cn("relative inline-flex shrink-0 cursor-pointer items-center", "data-[disabled]:cursor-not-allowed", className)}
      {...props}
      {...dragProps}
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
  const base = "absolute inset-0 flex items-center justify-center [&_svg]:size-2.5 [&_svg]:stroke-[2.5]";

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
