import { ChevronsDownIcon } from "lucide-react";
import { Instrument_Serif } from "next/font/google";
import type { ControlUiSkin } from "@/components/control-ui/skin";

const displayFont = Instrument_Serif({ subsets: ["latin"], weight: "400", display: "swap", preload: false });

const displayFamily = displayFont.style.fontFamily.split(",")[0].trim().replaceAll("'", '"');

export const acmeThemeCss = `[data-skin="acme"] {
  --primary: oklch(0.57 0.2 38);
  --primary-foreground: oklch(0.99 0 0);
  --scale-neutral-seed: oklch(0.5 0.012 60);
  --radius: 4px;
  --font-display: ${displayFamily}, serif;
}`;

export const acmeConfigSource = `export const skin: ControlUiSkin = {
  id: "acme",
  icons: { chevronDown: AcmeChevron },
  scrollAreaScrollbarVisibility: "always",
  scrollAreaScrollbarButtons: true,
  buttonGroupJoin: "overlap",
};`;

export const acmeSkinCss = `[data-skin="acme"] :where(
  [data-control-family="button"][data-control="true"]
) {
  --cui-button-radius: 999px;
}
[data-skin="acme"] :where(
  [data-control-family="scroll-area"][data-slot="root"]
) {
  --cui-scroll-area-scrollbar-size: 14px;
}`;

const AcmeChevron = ChevronsDownIcon;

export const acmeSkin: ControlUiSkin = {
  id: "acme",
  icons: { chevronDown: AcmeChevron },
  scrollAreaScrollbarVisibility: "always",
  scrollAreaScrollbarButtons: true,
  buttonGroupJoin: "overlap",
};

export const acmeStyleSheet = `${acmeThemeCss}\n${acmeSkinCss}`;

export type AcmeFileName = "skin-theme.css" | "skin.config.tsx" | "skin.css";

export type AcmeFile = {
  name: AcmeFileName;
  role: string;
  language: "css" | "tsx";
  source: string;
};

export const acmeFiles: readonly AcmeFile[] = [
  { name: "skin-theme.css", role: "tokens", language: "css", source: acmeThemeCss },
  { name: "skin.config.tsx", role: "behavior", language: "tsx", source: acmeConfigSource },
  { name: "skin.css", role: "component knobs", language: "css", source: acmeSkinCss },
];

export const acmeLineCount = acmeFiles.reduce((count, file) => count + file.source.split("\n").length, 0);

export const pinnedKnob = "--cui-button-radius";

export type PinId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type Pin = {
  id: PinId;
  file: AcmeFileName;
  match: string;
  part: string;
};

export const pins: readonly Pin[] = [
  { id: 1, file: "skin-theme.css", match: "--primary", part: "primary ramp" },
  { id: 2, file: "skin-theme.css", match: "--scale-neutral-seed", part: "neutral ramp" },
  { id: 3, file: "skin-theme.css", match: "--radius", part: "card corners" },
  { id: 4, file: "skin-theme.css", match: "--font-display", part: "heading typeface" },
  { id: 5, file: "skin.config.tsx", match: "icons", part: "select chevron" },
  { id: 6, file: "skin.config.tsx", match: "scrollAreaScrollbarButtons", part: "scrollbar buttons" },
  { id: 7, file: "skin.config.tsx", match: "buttonGroupJoin", part: "joined button group" },
  { id: 8, file: "skin.css", match: pinnedKnob, part: "pill buttons" },
];

export function pinForLine(file: AcmeFileName, line: string): Pin | undefined {
  const text = line.trimStart();
  return pins.find((pin) => pin.file === file && text.startsWith(`${pin.match}:`));
}

function declarationValue(source: string, property: string): string {
  const line = source.split("\n").find((candidate) => candidate.trimStart().startsWith(`${property}:`));
  return line
    ? line
        .slice(line.indexOf(":") + 1)
        .replace(";", "")
        .trim()
    : "currentColor";
}

export const acmeAccent = declarationValue(acmeThemeCss, "--primary");
