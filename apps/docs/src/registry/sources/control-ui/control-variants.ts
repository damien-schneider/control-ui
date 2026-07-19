import { cva } from "class-variance-authority";

// data-active = Button's own hook (ui/button.tsx); pressed Toggle sets it — checked look for every surface toggle/button, not a per-consumer override.
// Same primary tint+ring language as Checkbox/SelectItem's data-[checked], so "selected" reads consistently library-wide.
// Skin wanting a bespoke checked look overrides [data-active] itself (e.g. liquid-metal/skin.css) — this is only the fallback.
export const controlSurfaceClasses =
  "bg-card/72 text-foreground shadow-sm ring-1 ring-inset ring-border hover:bg-foreground/5 data-[popup-open]:bg-foreground/7 data-[popup-open]:hover:bg-foreground/7 data-[active=true]:bg-primary/8 data-[active=true]:text-primary-text data-[active=true]:ring-primary/60 data-[active=true]:hover:bg-primary/10";

// Shared control size scale (xs/sm/md/lg) for Button/Select trigger/DropdownMenu trigger/Input: height from --control-h-*, padding from --padding-x, text from type scale — controls line up and reflow together on token change. Skins own look; this owns dimensional rhythm.
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
