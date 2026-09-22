import googleFontCatalogue from "./google-fonts.json";

export type ThemeFontSource = "bundled" | "curated" | "google";

export type ThemeFont = {
  id: string;
  family: string;
  stack: string;
  source: ThemeFontSource;
  weights: readonly number[];
};

type DescribedThemeFont = ThemeFont & { description: string };

type CatalogueEntry = { family: string; category: string; weights: number[] };

const CATALOGUE: Record<string, CatalogueEntry> = googleFontCatalogue;

export function themeFontId(requested: string): string {
  return requested
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function genericStack(category: string): string {
  if (category === "serif") return "ui-serif, Georgia, serif";
  if (category === "monospace") return "ui-monospace, SFMono-Regular, monospace";
  return "ui-sans-serif, system-ui, sans-serif";
}

const BUNDLED_WEIGHTS = [400, 500, 600, 700] as const;
const UNCATALOGUED_WEIGHTS = [400, 700] as const;

// The named face sits inside the var() fallback, not after it: with the next/font variable undefined,
// `var(--font-geist-sans), "Geist"` is invalid at computed-value time and the whole declaration is dropped.
const GEOMETRIC_FONT: DescribedThemeFont = {
  id: "geometric",
  family: "Geist",
  stack: 'var(--font-geist-sans, "Geist"), ui-sans-serif, system-ui, sans-serif',
  source: "bundled",
  weights: BUNDLED_WEIGHTS,
  description: "bundled geometric sans",
};

const NEUTRAL_FONT: DescribedThemeFont = {
  id: "neutral",
  family: "Inter",
  stack: 'var(--font-inter, "Inter"), ui-sans-serif, system-ui, sans-serif',
  source: "bundled",
  weights: BUNDLED_WEIGHTS,
  description: "bundled neutral UI sans",
};

const MONO_FONT: DescribedThemeFont = {
  id: "mono",
  family: "JetBrains Mono",
  stack: 'var(--font-jetbrains-mono, "JetBrains Mono"), ui-monospace, SFMono-Regular, monospace',
  source: "bundled",
  weights: BUNDLED_WEIGHTS,
  description: "bundled code mono",
};

const SYSTEM_FONT: DescribedThemeFont = {
  id: "system",
  family: "System UI",
  stack: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  source: "bundled",
  weights: BUNDLED_WEIGHTS,
  description: "native system stack",
};

export const BUNDLED_FONTS: readonly DescribedThemeFont[] = [GEOMETRIC_FONT, NEUTRAL_FONT, MONO_FONT, SYSTEM_FONT];

function webfont(id: string, fallbackFamily: string, source: ThemeFontSource, description: string): DescribedThemeFont {
  const entry = CATALOGUE[id];
  const family = entry ? entry.family : fallbackFamily;
  return {
    id,
    family,
    stack: `"${family}", ${genericStack(entry ? entry.category : "sans-serif")}`,
    source,
    weights: entry ? entry.weights : UNCATALOGUED_WEIGHTS,
    description,
  };
}

const CURATED_SPECS: readonly (readonly [string, string, string])[] = [
  ["newsreader", "Newsreader", "editorial serif"],
  ["source-serif-4", "Source Serif 4", "reading serif"],
  ["fraunces", "Fraunces", "characterful serif"],
  ["playfair-display", "Playfair Display", "display serif"],
  ["instrument-serif", "Instrument Serif", "headline serif"],
  ["outfit", "Outfit", "geometric sans"],
  ["nunito", "Nunito", "rounded sans"],
  ["inter-tight", "Inter Tight", "corporate sans"],
  ["space-grotesk", "Space Grotesk", "technical grotesque"],
  ["syne", "Syne", "expressive sans"],
  ["bricolage-grotesque", "Bricolage Grotesque", "quirky grotesque"],
  ["archivo-narrow", "Archivo Narrow", "condensed sans"],
  ["bebas-neue", "Bebas Neue", "condensed caps"],
  ["ibm-plex-mono", "IBM Plex Mono", "humanist mono"],
  ["vt323", "VT323", "terminal face"],
  ["press-start-2p", "Press Start 2P", "pixel face"],
];

export const CURATED_FONTS: readonly DescribedThemeFont[] = CURATED_SPECS.map(([id, family, description]) =>
  webfont(id, family, "curated", description),
);

// Null rather than a fallback, because this runs on every streamed chunk too: a half-arrived "Playf" is a
// valid string, and resolving it to a default would paint Inter and then swap once the name completes.
export function findThemeFont(requested: string): ThemeFont | null {
  const id = themeFontId(requested);
  const known = BUNDLED_FONTS.find((font) => font.id === id) ?? CURATED_FONTS.find((font) => font.id === id);
  if (known) return known;
  const entry = CATALOGUE[id];
  return entry ? webfont(id, entry.family, "google", entry.category) : null;
}

const IMPORT_TARGET_WEIGHTS = [400, 500, 600, 700];

function importWeights(available: readonly number[]): number[] {
  if (available.length === 0) return [400];
  const nearest = IMPORT_TARGET_WEIGHTS.map((target) =>
    available.reduce((best, weight) => (Math.abs(weight - target) < Math.abs(best - target) ? weight : best)),
  );
  return [...new Set(nearest)].sort((left, right) => left - right).slice(0, 4);
}

// The URL, not an @import line: the drawer links it at runtime and the exported stylesheet wraps it, and
// a single source keeps those two from drifting.
export function themeFontUrl(font: ThemeFont): string | null {
  if (font.source === "bundled") return null;
  const family = encodeURIComponent(font.family).replace(/%20/g, "+").replace(/'/g, "%27");
  const weights = importWeights(font.weights).join(";");
  return `https://fonts.googleapis.com/css2?family=${family}:wght@${weights}&display=swap`;
}

export function themeFontCatalogueBrief(): string {
  return [...BUNDLED_FONTS, ...CURATED_FONTS].map((font) => `${font.id} — ${font.family} (${font.description})`).join("\n");
}
