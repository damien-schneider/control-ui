import { cva } from "class-variance-authority";

// library-wide fallback for checked look; skin wanting its own overrides [data-active] in skin.css.
export const controlSurfaceClasses =
  "bg-card/72 text-foreground shadow-sm ring-1 ring-inset ring-border hover:bg-foreground/5 data-[popup-open]:bg-foreground/7 data-[popup-open]:hover:bg-foreground/7 data-[active=true]:bg-primary/8 data-[active=true]:text-primary-text data-[active=true]:ring-primary/60 data-[active=true]:hover:bg-primary/10";

// Owns dimensional rhythm only, never look: every control reflows together when tokens change.
export const controlSize = cva("", {
  variants: {
    size: {
      xs: "h-[var(--control-h-xs)] gap-1 px-[calc(var(--padding-x)*0.6)] text-caption",
      sm: "h-[var(--control-h-sm)] gap-1.5 px-[calc(var(--padding-x)*0.75)] text-label",
      md: "h-[var(--control-h-md)] gap-1.5 px-[var(--padding-x)] text-body",
      lg: "h-[var(--control-h-lg)] gap-2 px-[calc(var(--padding-x)*1.25)] text-body",
    },
  },
  defaultVariants: {
    size: "md",
  },
});
