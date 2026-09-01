import { THEME_CONTRACT } from "@/src/registry/lib/theme-contract";
import { isColorValuedToken } from "./token-metadata";
import type { ControlUiThemeArtifactV1, TokenValues } from "./types";

const VENDOR = "dev.control-ui";

type DtcgToken = { $value: string; $type?: string; $description?: string; $extensions?: Record<string, unknown> };
type DtcgBucket = Record<string, DtcgToken>;
export type DtcgThemeFile = { $extensions: Record<string, unknown>; shared: DtcgBucket; light: DtcgBucket; dark: DtcgBucket };

const DESCRIPTIONS = new Map(THEME_CONTRACT.map((token) => [token.name, token.description]));

/**
 * DTCG carries a type per token, but a Control UI value is a CSS string first: a relative color, a `calc()` chain, a
 * `linear()` easing. Typing is therefore driven by the value, and anything CSS-shaped stays raw so the round-trip is
 * byte-exact — a design tool can read what it understands and hand the rest back unchanged.
 */
function dtcgType(name: string, value: string): string | undefined {
  if (/^(?:var|calc)\(/.test(value)) return undefined;
  if (isColorValuedToken(name)) return "color";
  if (name.startsWith("--font-")) return "fontFamily";
  if (name.startsWith("--duration-")) return "duration";
  if (/^-?\d+(?:\.\d+)?$/.test(value)) return "number";
  if (/^-?\d+(?:\.\d+)?(?:px|rem|em|ch|vh|vw|%)$/.test(value)) return "dimension";
  return undefined;
}

function toDtcgBucket(tokens: TokenValues): DtcgBucket {
  return Object.fromEntries(
    Object.entries(tokens).map(([name, value]) => {
      const $type = dtcgType(name, value);
      const description = DESCRIPTIONS.get(name);
      return [
        name.slice(2),
        {
          $value: value,
          ...($type ? { $type } : { $extensions: { [VENDOR]: { raw: true } } }),
          ...(description ? { $description: description } : {}),
        },
      ];
    }),
  );
}

export function toDtcg(artifact: ControlUiThemeArtifactV1): DtcgThemeFile {
  return {
    $extensions: {
      [VENDOR]: {
        format: artifact.format,
        name: artifact.name,
        baseSkin: artifact.baseSkin,
        reduceMotion: artifact.reduceMotion,
      },
    },
    shared: toDtcgBucket(artifact.tokens.shared),
    light: toDtcgBucket(artifact.tokens.light),
    dark: toDtcgBucket(artifact.tokens.dark),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isDtcg(value: unknown): boolean {
  return isRecord(value) && isRecord(value.$extensions) && isRecord(value.$extensions[VENDOR]);
}

/** A design tool may hand back a token as a typed object rather than the CSS string it was given; both have to land. */
function cssValue(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (!isRecord(value)) return undefined;
  if (typeof value.value === "number" && typeof value.unit === "string") return `${value.value}${value.unit}`;
  if (value.colorSpace !== "srgb" || !Array.isArray(value.components)) return undefined;
  const channels = value.components.slice(0, 3).map((component) => Math.round(Number(component) * 255));
  if (channels.length !== 3 || channels.some((channel) => !Number.isFinite(channel))) return undefined;
  const alpha = typeof value.alpha === "number" && value.alpha < 1 ? ` / ${value.alpha}` : "";
  return `rgb(${channels.join(" ")}${alpha})`;
}

function fromDtcgBucket(value: unknown): TokenValues {
  if (!isRecord(value)) return {};
  const tokens: TokenValues = {};
  for (const [key, token] of Object.entries(value)) {
    const css = isRecord(token) ? cssValue(token.$value) : undefined;
    if (css !== undefined) tokens[`--${key}`] = css;
  }
  return tokens;
}

/** Shapes a DTCG file back into artifact form; `validateThemeArtifact` still decides whether it is a valid theme. */
export function artifactFromDtcg(value: unknown): unknown {
  if (!isRecord(value) || !isRecord(value.$extensions)) return value;
  const identity = value.$extensions[VENDOR];
  return {
    ...(isRecord(identity) ? identity : {}),
    tokens: { shared: fromDtcgBucket(value.shared), light: fromDtcgBucket(value.light), dark: fromDtcgBucket(value.dark) },
  };
}
