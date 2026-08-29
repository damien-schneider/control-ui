import { cva } from "class-variance-authority";

export type ControlSize = "xs" | "sm" | "md" | "lg";

export const controlSize = cva("", {
  variants: {
    size: {
      xs: "h-[var(--control-h-xs)] px-[calc(var(--padding-x)*0.6)] text-caption",
      sm: "h-[var(--control-h-sm)] px-[calc(var(--padding-x)*0.75)] text-label",
      md: "h-[var(--control-h-md)] px-[var(--padding-x)] text-body",
      lg: "h-[var(--control-h-lg)] px-[calc(var(--padding-x)*1.25)] text-body",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export const controlVariants = ["solid", "surface", "ghost", "quiet"] as const;

export type ControlVariant = (typeof controlVariants)[number];

export const controlTones = ["neutral", "primary", "danger"] as const;

export type ControlTone = (typeof controlTones)[number];
