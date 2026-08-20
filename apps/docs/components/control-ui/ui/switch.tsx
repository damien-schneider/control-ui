"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import type { ReactNode } from "react";
import type { SwitchProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";

// Own anatomy, not restyled Button way Toggle is.
// thumb stretches on press and its checked offset shrinks by same amount, so it stays flush right while widening.
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
  ...props
}: SwitchProps) {
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
      className={cn(
        "group/switch relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center p-0.5",
        "data-[disabled]:cursor-not-allowed",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-control-ui="switch"
        data-control-family="switch"
        data-slot="thumb"
        className={cn("pointer-events-none relative block size-4", "group-active/switch:w-5")}
      >
        {hasIcon ? <SwitchThumbIcon icon={singleIcon} checkedIcon={onIcon} uncheckedIcon={offIcon} /> : null}
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
}

// decorative — Switch's own role and label carry meaning
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
