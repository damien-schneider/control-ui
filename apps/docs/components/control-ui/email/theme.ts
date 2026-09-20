import { composite, resolveColor, tokenMaps } from "../scripts/contrast-eval.mjs";
import { emailLengthPixels } from "./length";

const emailColors = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "primary",
  "primary-foreground",
  "primary-text",
  "muted",
  "muted-foreground",
  "border",
] as const;
const headingSizes = ["heading-1", "heading-2", "heading-3", "heading-4"] as const;

type EmailColor = (typeof emailColors)[number];
type EmailHeadingSize = (typeof headingSizes)[number];
type EmailTypeStyle = { fontSize: string; lineHeight: string; fontWeight: string; letterSpacing: string };

export type EmailColorScheme = "light" | "dark";

export type EmailTheme = {
  colorScheme: EmailColorScheme;
  colors: Record<EmailColor, string>;
  fonts: { body: string; display: string; mono: string };
  radii: { control: string; panel: string; scene: string };
  button: { height: string; paddingInline: string; paddingBlock: string; fontSize: string; lineHeight: string };
  text: Record<EmailHeadingSize | "body" | "caption", EmailTypeStyle>;
};

function resolveVariables(value: string, tokens: ReadonlyMap<string, string>, chain: string[] = []): string {
  if (chain.length > 16) throw new Error(`Email theme: token chain exceeds 16 references (${chain.join(" → ")}).`);
  return value.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*((?:[^()]|\([^()]*\))*))?\)/g, (_, name: string, fallback: string | undefined) => {
    if (chain.includes(name)) throw new Error(`Email theme: circular reference to ${name}.`);
    const resolved = tokens.get(name) ?? fallback;
    if (resolved === undefined) throw new Error(`Email theme: missing ${name}.`);
    return resolveVariables(resolved, tokens, [...chain, name]);
  });
}

function tokenValue(name: string, tokens: ReadonlyMap<string, string>, fallback?: string) {
  const value = tokens.get(name) ?? fallback;
  if (value === undefined) throw new Error(`Email theme: missing ${name}. Include core theme.css before the skin theme.`);
  const resolved = resolveVariables(value, tokens, [name]).trim();
  if (!resolved || /var\(|[;{}<>]/.test(resolved)) throw new Error(`Email theme: unsupported ${name}: ${value}.`);
  return resolved;
}

function pixelSize(name: string, tokens: ReadonlyMap<string, string>, rootFontSize: number) {
  return `${emailLengthPixels(name, tokenValue(name, tokens), rootFontSize)}px`;
}

function numericStyle(name: string, tokens: ReadonlyMap<string, string>, fallback: string) {
  const value = tokenValue(name, tokens, fallback);
  if (!/^\d*\.?\d+(px|em)?$/.test(value)) throw new Error(`Email theme: unsupported ${name}: ${value}.`);
  return value;
}

export function createEmailTheme(
  tokens: ReadonlyMap<string, string>,
  { rootFontSize = 16, colorScheme = "light" }: { rootFontSize?: number; colorScheme?: EmailColorScheme } = {},
): EmailTheme {
  if (!Number.isFinite(rootFontSize) || rootFontSize <= 0) throw new Error("Email theme: rootFontSize must be a positive pixel value.");

  function lengthPixels(name: string, allowZero = false) {
    return emailLengthPixels(name, tokenValue(name, tokens), rootFontSize, allowZero);
  }

  const buttonHeight = lengthPixels("--control-h-md");
  const buttonFontSize = lengthPixels("--text-body");
  const reactEmailButtonLineHeight = buttonFontSize * 1.2;
  const buttonPaddingBlock = Math.max(0, (buttonHeight - reactEmailButtonLineHeight) / 2);

  function color(name: EmailColor) {
    const result = resolveColor(`var(--${name})`, tokens);
    if ("unresolved" in result) throw new Error(`Email theme: --${name}: ${result.unresolved}.`);
    return result;
  }

  const background = color("background");
  if (background.alpha !== 1) throw new Error("Email theme: --background must be opaque.");
  const card = composite(color("card"), background);
  const primary = composite(color("primary"), card);
  function opaqueColor(name: EmailColor, surface = card) {
    const result = composite(color(name), surface);
    return `rgb(${Math.round(result.r)}, ${Math.round(result.g)}, ${Math.round(result.b)})`;
  }

  function heading(name: EmailHeadingSize): EmailTypeStyle {
    const spacing = tokenValue(`--text-${name}--letter-spacing`, tokens, "0");
    if (!/^-?\d*\.?\d+(px|em)?$/.test(spacing)) throw new Error(`Email theme: unsupported ${name} letter spacing: ${spacing}.`);
    return {
      fontSize: pixelSize(`--text-${name}`, tokens, rootFontSize),
      lineHeight: numericStyle(`--text-${name}--line-height`, tokens, "1.3"),
      fontWeight: numericStyle(`--text-${name}--font-weight`, tokens, "600"),
      letterSpacing: spacing,
    };
  }

  return {
    colorScheme,
    colors: {
      background: opaqueColor("background", background),
      foreground: opaqueColor("foreground", background),
      card: opaqueColor("card", background),
      "card-foreground": opaqueColor("card-foreground"),
      primary: opaqueColor("primary"),
      "primary-foreground": opaqueColor("primary-foreground", primary),
      "primary-text": opaqueColor("primary-text"),
      muted: opaqueColor("muted"),
      "muted-foreground": opaqueColor("muted-foreground"),
      border: opaqueColor("border"),
    },
    fonts: {
      body: tokenValue("--font-body", tokens),
      display: tokenValue("--font-display", tokens),
      mono: tokenValue("--font-mono", tokens),
    },
    radii: {
      control: `${lengthPixels("--radius-control", true)}px`,
      panel: `${lengthPixels("--radius-panel", true)}px`,
      scene: `${lengthPixels("--radius-scene", true)}px`,
    },
    button: {
      height: `${buttonHeight}px`,
      paddingInline: `${lengthPixels("--padding-x", true)}px`,
      paddingBlock: `${buttonPaddingBlock}px`,
      fontSize: `${buttonFontSize}px`,
      lineHeight: `${reactEmailButtonLineHeight}px`,
    },
    text: {
      body: { fontSize: pixelSize("--text-body-lg", tokens, rootFontSize), lineHeight: "1.6", fontWeight: "400", letterSpacing: "0" },
      caption: { fontSize: pixelSize("--text-body", tokens, rootFontSize), lineHeight: "1.5", fontWeight: "400", letterSpacing: "0" },
      "heading-1": heading("heading-1"),
      "heading-2": heading("heading-2"),
      "heading-3": heading("heading-3"),
      "heading-4": heading("heading-4"),
    },
  };
}

export function emailThemeFromCss(cssSources: string[], mode: EmailColorScheme = "light", rootFontSize = 16): EmailTheme {
  return createEmailTheme(tokenMaps(cssSources)[mode], { rootFontSize, colorScheme: mode });
}
