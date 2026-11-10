"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import type { ComponentProps, CSSProperties } from "react";
import type { ChoiceKnobStyle } from "@/components/control-ui/knob-contracts/choice-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type CheckboxProps = Omit<ComponentProps<typeof CheckboxPrimitive.Root>, "className" | "style" | "children"> & {
  className?: string;
  style?: CSSProperties & ChoiceKnobStyle;
};

// tick and dash swap on Root's data-indeterminate in pure CSS.
export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-control-ui="checkbox"
      data-choice-kind="checkbox"
      data-control-family="choice"
      data-slot="root"
      className={cn("group/checkbox relative inline-flex shrink-0 items-center justify-center", className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-control-ui="checkbox"
        data-control-family="choice"
        data-choice-kind="checkbox"
        data-slot="indicator"
        className="flex items-center justify-center data-[unchecked]:hidden"
      >
        {/* tick (default) and dash (indeterminate) both mount; Root's data-indeterminate toggles which shows */}
        <svg viewBox="0 0 12 12" className="size-full group-data-[indeterminate]/checkbox:hidden" aria-hidden="true" fill="none">
          <path d="M2.5 6.5 5 9l4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg viewBox="0 0 12 12" className="hidden size-full group-data-[indeterminate]/checkbox:block" aria-hidden="true" fill="none">
          <path d="M2.75 6h6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
