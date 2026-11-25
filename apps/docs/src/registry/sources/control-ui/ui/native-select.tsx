"use client";

import { Input as InputPrimitive } from "@base-ui/react/input";
import type { ComponentProps, CSSProperties } from "react";
import type { ControlSize } from "@/components/control-ui/control-variants";
import type { FieldKnobStyle } from "@/components/control-ui/knob-contracts/field-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import type { SkinIconProps } from "@/components/control-ui/skin";
import { useSkinIcon } from "@/components/control-ui/skin-provider";

export type NativeSelectProps = Omit<Omit<ComponentProps<"select">, "size">, "style"> & { style?: CSSProperties & FieldKnobStyle } & {
  size?: ControlSize;
};

function NativeSelectChevronIcon(props: SkinIconProps) {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true" {...props}>
      <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// `className` sizes the wrapper so the select and its chevron follow one width; `style` stays on the select, which carries the field knobs.
export function NativeSelect({
  ref,
  id,
  name,
  value,
  defaultValue,
  disabled,
  autoFocus,
  size = "md",
  className,
  children,
  ...props
}: NativeSelectProps) {
  const ChevronDownGlyph = useSkinIcon("chevronDown", NativeSelectChevronIcon);
  return (
    <div
      data-control-ui="native-select"
      data-control-family="field"
      data-field-kind="native-select"
      data-slot="wrapper"
      className={cn("relative inline-flex w-full items-center", className)}
    >
      <InputPrimitive
        ref={ref}
        id={id}
        name={name}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        autoFocus={autoFocus}
        render={
          <select
            {...props}
            data-control-ui="native-select"
            data-field-kind="native-select"
            data-slot="root"
            data-size={size}
            data-control-family="field"
            data-control="true"
            className="w-full min-w-0"
          >
            {children}
          </select>
        }
      />
      <span
        aria-hidden="true"
        data-control-ui="native-select"
        data-control-family="field"
        data-field-kind="native-select"
        data-slot="icon"
        className="pointer-events-none absolute"
      >
        <ChevronDownGlyph aria-hidden="true" />
      </span>
    </div>
  );
}
