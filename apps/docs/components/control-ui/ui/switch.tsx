"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import type { ReactNode } from "react";
import type { SwitchProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

// Own anatomy, not a restyled Button (contrast Toggle) — Base UI owns state.
// mastra-playground tactile detail: thumb STRETCHES on press (group-active widens it), checked offset shrinks equally to stay flush right — reads as physical nudge settling on release.
// Motion runs off --duration-*/--ease-*, so motion kill-switch collapses it to 0ms with zero JS.
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
        "group/switch relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full p-0.5 outline-none",
        "transition-colors duration-[var(--duration-base)] ease-[var(--ease-standard)]",
        "bg-foreground/14 hover:bg-foreground/20 active:bg-foreground/25",
        "data-[checked]:bg-primary data-[checked]:hover:bg-primary/90 data-[checked]:active:bg-primary/80",
        "focus-visible:ring-2 focus-visible:ring-foreground/30",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[disabled]:hover:bg-foreground/14 data-[disabled]:data-[checked]:hover:bg-primary",
        skinSlot("switch", "root", { checked: checked ?? false, disabled: disabled ?? false }),
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-control-ui="switch"
        data-slot="thumb"
        className={cn(
          "pointer-events-none relative block size-4 rounded-full bg-background shadow-sm",
          "transition-[translate,width] duration-[var(--duration-base)] ease-[var(--ease-emphasized)]",
          "translate-x-0 data-[checked]:translate-x-4",
          "group-active/switch:w-5 group-active/switch:data-[checked]:translate-x-3",
          "group-data-[disabled]/switch:bg-background/80",
          skinSlot("switch", "thumb", { checked: checked ?? false }),
        )}
      >
        {hasIcon ? <SwitchThumbIcon icon={singleIcon} checkedIcon={onIcon} uncheckedIcon={offIcon} /> : null}
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
}

// Single `icon` flips foreground→primary on check; paired state icons cross-fade opacity. Decorative (aria-hidden) — Switch's role/label carries meaning.
function SwitchThumbIcon({ icon, checkedIcon, uncheckedIcon }: { icon?: ReactNode; checkedIcon?: ReactNode; uncheckedIcon?: ReactNode }) {
  const base = cn(
    "absolute inset-0 flex items-center justify-center",
    "transition-[color,opacity] duration-[var(--duration-base)] ease-[var(--ease-standard)]",
    "[&_svg]:size-2.5 [&_svg]:stroke-[2.5]",
  );

  if (icon !== undefined) {
    return (
      <span
        aria-hidden
        data-control-ui="switch"
        data-slot="thumb-icon"
        className={cn(base, "text-foreground/70 group-data-[checked]/switch:text-primary-text")}
      >
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
          data-slot="thumb-icon"
          data-switch-icon="unchecked"
          className={cn(base, "text-foreground/60 opacity-100 group-data-[checked]/switch:opacity-0")}
        >
          {uncheckedIcon}
        </span>
      ) : null}
      {checkedIcon !== undefined ? (
        <span
          aria-hidden
          data-control-ui="switch"
          data-slot="thumb-icon"
          data-switch-icon="checked"
          className={cn(base, "text-primary-text opacity-0 group-data-[checked]/switch:opacity-100")}
        >
          {checkedIcon}
        </span>
      ) : null}
    </>
  );
}
