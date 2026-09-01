import type { ComponentProps, CSSProperties } from "react";
import type { ControlSize } from "@/components/control-ui/control-variants";
import type { FieldKnobStyle } from "@/components/control-ui/knob-contracts/field-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type NativeSelectProps = Omit<Omit<ComponentProps<"select">, "size">, "style"> & { style?: CSSProperties & FieldKnobStyle } & {
  size?: ControlSize;
};

// real native <select>, not floating Base UI Select — its options open OS menu, so nothing portals and no scope is re-asserted.
export function NativeSelect({ size = "md", className, children, ...props }: NativeSelectProps) {
  return (
    <div className="relative inline-flex w-full items-center">
      <select
        data-control-ui="native-select"
        data-field-kind="native-select"
        data-slot="root"
        data-size={size}
        data-control-family="field"
        data-control="true"
        className={cn("w-full min-w-0 cursor-pointer", className)}
        {...props}
      >
        {children}
      </select>
      <span
        aria-hidden="true"
        data-control-ui="native-select"
        data-control-family="field"
        data-field-kind="native-select"
        data-slot="icon"
        className="pointer-events-none absolute right-[calc(var(--padding-x)*0.6)]"
      >
        <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true" fill="none">
          <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}
