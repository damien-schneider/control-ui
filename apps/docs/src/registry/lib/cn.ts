import { type ClassValue, clsx } from "clsx";
import { type Config, extendTailwindMerge, mergeConfigs } from "tailwind-merge";

// tw-merge only knows stock sizes and misreads these as text COLOR group, so size and color in one cn() collide and one is dropped.
const textScale = ["micro", "caption", "label", "body", "body-lg", "heading-1", "heading-2", "heading-3", "heading-4", "display"];

// unregistered, tw-merge reads these as shadow COLOR and lets them ride alongside later box-shadow util, so skin's override loses by CSS order instead of argument order
const shadowScale = ["pop", "soft", "modal"];

export function withControlUiMerge(config: Config<string, string>) {
  return mergeConfigs(config, {
    extend: {
      classGroups: {
        "font-size": [{ text: textScale }],
        shadow: [{ shadow: shadowScale }],
      },
    },
    // stock Tailwind bakes line-height into `text-*`, so twMerge lets font-size clear preceding `leading-*`; this scale is size-only, so that conflict must go
    override: {
      conflictingClassGroups: {
        "font-size": [],
      },
    },
  });
}

const twMerge = extendTailwindMerge(withControlUiMerge);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
