// defineSkinTokens derives a small starter ramp from a skin-owned seed. Every remaining contract token
// must still be supplied explicitly in both modes; there is no baseline/default skin map to inherit from.

import { THEME_CONTRACT_NAMES } from "./theme-contract";

export type SkinDensity = "compact" | "regular" | "roomy";

export type SkinSeed = {
  /** Base brand hue in degrees (0-360) — drives primary, surfaces, and foregrounds. */
  hue: number;
  /** Brand saturation (0-100). Default 60. */
  saturation?: number;
  /** The one radius knob (px) applied to --radius. Default 10. */
  radius?: number;
  /** Control height + padding ramp. Default "regular". */
  density?: SkinDensity;
};

export type SkinTokenOverrides = Record<string, string>;

export type DefineSkinInput = {
  seed: SkinSeed;
  /** Explicit light values. Together with the seed ramp, these must complete the contract. */
  light: SkinTokenOverrides;
  /** Explicit dark values. Together with the seed ramp, these must complete the contract. */
  dark: SkinTokenOverrides;
};

export type SkinTokens = {
  light: Record<string, string>;
  dark: Record<string, string>;
};

const DENSITY: Record<SkinDensity, { controlH: number; padX: number; padY: number }> = {
  compact: { controlH: 32, padX: 12, padY: 8 },
  regular: { controlH: 36, padX: 14, padY: 10 },
  roomy: { controlH: 42, padX: 18, padY: 12 },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function tokenMap(value: unknown, mode: "light" | "dark", label: string): Record<string, string> {
  if (!isRecord(value)) {
    throw new Error(`${label} must provide an explicit ${mode} token map.`);
  }

  const tokens: Record<string, string> = {};
  const invalid: string[] = [];
  for (const [name, tokenValue] of Object.entries(value)) {
    if (typeof tokenValue === "string" && tokenValue.trim().length > 0) tokens[name] = tokenValue;
    else invalid.push(`${name} (${mode})`);
  }
  invalid.sort();
  if (invalid.length > 0) {
    throw new Error(`${label} has empty or non-string token values: ${invalid.join(", ")}.`);
  }

  return tokens;
}

export function assertCompleteSkinTokens(value: unknown, label = "skin tokens"): asserts value is SkinTokens {
  if (!isRecord(value)) {
    throw new Error(`${label} must be an object with explicit light and dark token maps.`);
  }

  const light = tokenMap(value.light, "light", label);
  const dark = tokenMap(value.dark, "dark", label);
  const unknown = (["light", "dark"] as const).flatMap((mode) =>
    Object.keys(mode === "light" ? light : dark).flatMap((name) => (THEME_CONTRACT_NAMES.has(name) ? [] : [`${name} (${mode})`])),
  );
  if (unknown.length > 0) {
    throw new Error(`${label} declares tokens outside the theme contract: ${unknown.sort().join(", ")}.`);
  }

  const missing = (["light", "dark"] as const).flatMap((mode) => {
    const tokens = mode === "light" ? light : dark;
    return [...THEME_CONTRACT_NAMES].flatMap((name) => (name in tokens ? [] : [`${name} (${mode})`]));
  });
  if (missing.length > 0) {
    throw new Error(`${label} must explicitly define every theme contract token in both modes. Missing: ${missing.join(", ")}.`);
  }
}

// authored in HSL lightness steps (easy to reason about), emits oklch to match token format (Tailwind/shadcn v4); inline sRGB→OKLab keeps module pure, no client-only import
function oklchFromHsl(h: number, s: number, l: number): string {
  const hh = ((h % 360) + 360) % 360;
  const ss = s / 100;
  const ll = l / 100;
  const cc = (1 - Math.abs(2 * ll - 1)) * ss;
  const x = cc * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = ll - cc / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hh < 60) [r, g, b] = [cc, x, 0];
  else if (hh < 120) [r, g, b] = [x, cc, 0];
  else if (hh < 180) [r, g, b] = [0, cc, x];
  else if (hh < 240) [r, g, b] = [0, x, cc];
  else if (hh < 300) [r, g, b] = [x, 0, cc];
  else [r, g, b] = [cc, 0, x];
  const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const R = lin(r + m);
  const G = lin(g + m);
  const B = lin(b + m);
  const lp = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const mp = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const sp = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  const L = 0.2104542553 * lp + 0.793617785 * mp - 0.0040720468 * sp;
  const A = 1.9779984951 * lp - 2.428592205 * mp + 0.4505937099 * sp;
  const Bb = 0.0259040371 * lp + 0.7827717662 * mp - 0.808675766 * sp;
  const C = Math.hypot(A, Bb);
  let H = (Math.atan2(Bb, A) * 180) / Math.PI;
  if (H < 0) H += 360;
  const t = (n: number, d: number) => n.toFixed(d).replace(/\.?0+$/, "");
  return C < 1e-4 ? `oklch(${t(L, 4)} 0 0)` : `oklch(${t(L, 4)} ${t(C, 4)} ${t(H, 3)})`;
}

export function defineSkinTokens(input: DefineSkinInput): SkinTokens {
  const { hue, saturation = 60, radius = 10, density = "regular" } = input.seed;
  const s = saturation;
  const d = DENSITY[density];

  // Generated ramp — one hue fans out into brand + surfaces + foregrounds at fixed lightness steps.
  const light: Record<string, string> = {
    "--font-sans": '"Inter", ui-sans-serif, system-ui, sans-serif',
    "--font-mono": '"JetBrains Mono", ui-monospace, monospace',
    "--primary": oklchFromHsl(hue, s, 46),
    "--primary-foreground": oklchFromHsl(hue, 30, 98),
    "--primary-text": "oklch(from var(--primary) 0.48 c h)",
    "--destructive-text": "oklch(from var(--destructive) 0.48 c h)",
    "--foreground": oklchFromHsl(hue, 20, 12),
    "--secondary-foreground": oklchFromHsl(hue, 20, 20),
    "--accent-foreground": oklchFromHsl(hue, 20, 20),
    "--background": oklchFromHsl(hue, 24, 99),
    "--card": oklchFromHsl(hue, 24, 99),
    "--card-foreground": oklchFromHsl(hue, 20, 12),
    "--popover": oklchFromHsl(hue, 30, 99),
    "--popover-foreground": oklchFromHsl(hue, 20, 12),
    "--canvas": oklchFromHsl(hue, 22, 96),
    "--radius": `${radius}px`,
    "--corner-shape": "round",
    "--padding-x": `${d.padX}px`,
    "--padding-y": `${d.padY}px`,
    "--control-h": `${d.controlH}px`,
    "--shadow-size": "0.3",
    "--shadow-opacity": "1",
    "--shadow-y": "1",
    "--ring-opacity": "1",
    "--popover-opacity": "0.9",
    "--backdrop-blur-popover": "16px",
    "--overlay-opacity": "0.3",
    "--backdrop-blur-overlay": "0px",
    "--duration-base": "150ms",
  };

  const dark: Record<string, string> = {
    "--primary": oklchFromHsl(hue, s, 58),
    "--primary-foreground": oklchFromHsl(hue, 30, 10),
    "--primary-text": "oklch(from var(--primary) 0.78 c h)",
    "--destructive-text": "oklch(from var(--destructive) 0.78 c h)",
    "--foreground": oklchFromHsl(hue, 18, 96),
    "--card-foreground": oklchFromHsl(hue, 18, 96),
    "--popover-foreground": oklchFromHsl(hue, 18, 96),
    "--secondary-foreground": oklchFromHsl(hue, 18, 90),
    "--accent-foreground": oklchFromHsl(hue, 18, 90),
    "--background": oklchFromHsl(hue, 22, 9),
    "--card": oklchFromHsl(hue, 22, 11),
    "--popover": oklchFromHsl(hue, 24, 12),
    "--canvas": oklchFromHsl(hue, 24, 7),
  };

  const tokens = {
    light: { ...light, ...input.light },
    dark: { ...dark, ...input.dark },
  };
  assertCompleteSkinTokens(tokens, "defineSkinTokens() result");
  return tokens;
}
