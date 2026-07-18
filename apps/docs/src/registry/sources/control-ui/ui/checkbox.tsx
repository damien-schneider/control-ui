"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import type { CheckboxProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

// Base UI owns state; tick/dash swap on Root's data-indeterminate via pure CSS, zero JS.
// Inside a Field.Root, data-invalid ring surfaces validation.
export function Checkbox({
  className,
  checked,
  defaultChecked,
  onCheckedChange,
  indeterminate,
  disabled,
  readOnly,
  required,
  name,
  value,
  id,
  ...props
}: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-control-ui="checkbox"
      data-slot="root"
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange}
      indeterminate={indeterminate}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      name={name}
      value={value}
      id={id}
      className={cn(
        "group/checkbox relative inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] outline-none",
        "bg-card/72 shadow-sm ring-1 ring-inset ring-border transition duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:ring-foreground/25",
        "data-[checked]:bg-primary data-[checked]:text-primary-foreground data-[checked]:ring-primary",
        "data-[indeterminate]:bg-primary data-[indeterminate]:text-primary-foreground data-[indeterminate]:ring-primary",
        "focus-visible:ring-2 focus-visible:ring-foreground/20",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        "data-[invalid]:ring-2 data-[invalid]:ring-destructive",
        skinSlot("checkbox", "root", { checked: checked ?? false, disabled: disabled ?? false }),
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-control-ui="checkbox"
        data-slot="indicator"
        className="flex items-center justify-center text-current data-[unchecked]:hidden"
      >
        {/* tick (default) and dash (indeterminate) both mount; the Root's data-indeterminate toggles which shows */}
        <svg viewBox="0 0 12 12" className="size-3 group-data-[indeterminate]/checkbox:hidden" aria-hidden="true" fill="none">
          <path d="M2.5 6.5 5 9l4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg viewBox="0 0 12 12" className="hidden size-3 group-data-[indeterminate]/checkbox:block" aria-hidden="true" fill="none">
          <path d="M2.75 6h6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
