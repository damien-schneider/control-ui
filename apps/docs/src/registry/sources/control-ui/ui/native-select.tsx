import type { NativeSelectProps } from "@/components/control-ui/contracts";
import { controlSize, controlSurfaceClasses } from "@/components/control-ui/control-variants";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

// Refined skin slot, NOT Base UI: real native <select> (platform widget, not floating Base UI Select).
// Shares --radius-control/controlSize w/ Button/Input/Select; appearance-none hides OS arrow, chevron overlay matches Select icon.
// Native options open OS menu — no portal/skin re-assert needed.
export function NativeSelect({ size = "md", className, children, ...props }: NativeSelectProps) {
  return (
    <div className="relative inline-flex w-full items-center">
      <select
        data-control-ui="native-select"
        data-slot="root"
        data-size={size}
        className={cn(
          "w-full min-w-0 cursor-pointer appearance-none rounded-[var(--radius-control)] pr-[calc(var(--padding-x)*1.4)] font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-foreground/20 disabled:cursor-not-allowed disabled:opacity-50 data-[invalid]:ring-2 data-[invalid]:ring-destructive",
          controlSurfaceClasses,
          controlSize({ size }),
          skinSlot("native-select", "root", { size }),
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <span aria-hidden="true" className="pointer-events-none absolute right-[calc(var(--padding-x)*0.6)] text-muted-foreground">
        <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true" fill="none">
          <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}
