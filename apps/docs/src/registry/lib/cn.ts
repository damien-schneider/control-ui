import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// type scale = custom `text-*` utils (text-label, text-body, …, see theme.css); tw-merge only knows stock
// sizes, misreads ours as color group — size+color in same cn() then collide in one group, one silently
// dropped (code-diff grid lost text-label, fell to inherited 16px); registering as font-size keeps them independent
const textScale = [
  "micro",
  "caption",
  "label",
  "body",
  "body-lg",
  "heading-1",
  "heading-2",
  "heading-3",
  "heading-4",
  // legacy aliases kept until their call sites migrate to the canonical rungs above
  "meta",
  "title-sm",
  "title-md",
  "title-lg",
  "display",
];

// elevation tiers = custom `shadow-*` utils (shadow-pop/soft/modal, see theme.css); unregistered, tw-merge reads
// them as shadow COLOR and lets them ride alongside a later box-shadow util — a skin's `shadow-(--x)`/`shadow-none`
// then loses to the recipe's `shadow-pop` by CSS order, not argument order (content-surface kept its popover lift)
const shadowScale = ["pop", "soft", "modal"];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: textScale }],
      shadow: [{ shadow: shadowScale }],
    },
  },
  // stock Tailwind couples line-height into `text-*` size, so twMerge lets font-size clear a preceding `leading-*`
  // our scale is size-only and default sizes are never used here, so drop that conflict — explicit `leading-*` stands regardless of order
  // w/o this, `leading-5 … text-label` silently drops the leading (code grid fell to 18px row height)
  override: {
    conflictingClassGroups: {
      "font-size": [],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
