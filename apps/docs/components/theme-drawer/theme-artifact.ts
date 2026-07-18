import { THEME_CONTRACT, THEME_CONTRACT_NAMES, type ThemeContractToken } from "@/src/registry/lib/theme-contract";
import { isSkinId } from "./presets";
import { isColorValuedToken } from "./token-metadata";
import type { ControlUiThemeArtifactV1, ThemeState, TokenValues } from "./types";

export type ThemePromptMode = "chat" | "coding-agent";

export type ThemeArtifactResult = { ok: true; artifact: ControlUiThemeArtifactV1 } | { ok: false; errors: string[] };

type BuildThemePromptInput = {
  mode: ThemePromptMode;
  description: string;
  referenceNames: string[];
  origin: string;
  theme: ThemeState;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function balancedCssValue(value: string) {
  const withoutStrings = value.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, "");
  if (/["']/.test(withoutStrings)) return false;
  let depth = 0;
  for (const character of withoutStrings) {
    if (character === "(") depth += 1;
    else if (character === ")") depth -= 1;
    if (depth < 0) return false;
  }
  return depth === 0;
}

function typographyCssProperty(name: string) {
  if (name.startsWith("--font-")) return "font-family";
  if (name.endsWith("--font-weight")) return "font-weight";
  if (name.endsWith("--line-height")) return "line-height";
  if (name.endsWith("--letter-spacing")) return "letter-spacing";
  return "font-size";
}

function cssPropertyForToken(token: ThemeContractToken): string | null {
  const name = token.name;
  if (isColorValuedToken(name)) return "color";
  if (token.group === "typography") return typographyCssProperty(name);
  if (token.group === "motion") return name.startsWith("--ease-") ? "transition-timing-function" : "transition-duration";
  if (token.group === "radius") {
    if (name.startsWith("--corner-shape")) return null;
    return name === "--corner-radius-fit" || name === "--nest-corner-ratio" ? "opacity" : "border-radius";
  }
  if (token.group === "layout") return "padding";
  if (token.group === "surface") return name.includes("opacity") ? "opacity" : "padding";
  return "opacity";
}

function browserAcceptsTokenValue(token: ThemeContractToken, value: string) {
  if (typeof CSS === "undefined" || typeof CSS.supports !== "function") return true;
  const property = cssPropertyForToken(token);
  if (!property) return true;
  return CSS.supports(property, value);
}

function validateTokenValue(token: ThemeContractToken, value: string) {
  if (!value.trim()) return "must not be empty";
  if (value.length > 256) return "is too long";
  if (/[;{}\n\r]/.test(value)) return "contains declaration-breaking characters";
  if (/\/\*|\*\/|@import|url\s*\(|expression\s*\(|javascript:|data:/i.test(value)) return "contains unsafe CSS syntax";
  if (!balancedCssValue(value)) return "has unbalanced CSS syntax";
  if (token.name.startsWith("--corner-shape") && !["round", "squircle", "scoop"].includes(value.trim())) {
    return "must be round, squircle, or scoop";
  }
  if (!browserAcceptsTokenValue(token, value)) return "is not a valid CSS value for this token";
  return null;
}

function validateTokenEntry(name: string, raw: unknown, bucket: "shared" | "light" | "dark", errors: string[]) {
  if (!THEME_CONTRACT_NAMES.has(name)) {
    errors.push(`tokens.${bucket}.${name} is not part of the theme contract.`);
    return null;
  }
  const expectsColorBucket = isColorValuedToken(name);
  if (bucket === "shared" && expectsColorBucket) {
    errors.push(`tokens.shared.${name} belongs in light and dark.`);
    return null;
  }
  if (bucket !== "shared" && !expectsColorBucket) {
    errors.push(`tokens.${bucket}.${name} belongs in shared.`);
    return null;
  }
  if (typeof raw !== "string") {
    errors.push(`tokens.${bucket}.${name} must be a string.`);
    return null;
  }
  const token = THEME_CONTRACT.find((entry) => entry.name === name);
  if (!token) return null;
  const valueError = validateTokenValue(token, raw);
  if (valueError) {
    errors.push(`tokens.${bucket}.${name} ${valueError}.`);
    return null;
  }
  return raw.trim();
}

function validateTokenMap(value: unknown, bucket: "shared" | "light" | "dark", errors: string[]): TokenValues {
  if (!isRecord(value)) {
    errors.push(`tokens.${bucket} must be an object.`);
    return {};
  }

  const tokens: TokenValues = {};
  for (const [name, raw] of Object.entries(value)) {
    const tokenValue = validateTokenEntry(name, raw, bucket, errors);
    if (tokenValue !== null) tokens[name] = tokenValue;
  }
  return tokens;
}

function validateArtifactIdentity(value: Record<string, unknown>, expectedBaseSkin: string | undefined, errors: string[]) {
  if (value.format !== "control-ui-theme/v1") errors.push('format must be "control-ui-theme/v1".');
  const name = typeof value.name === "string" ? value.name.trim() : "";
  if (!name) errors.push("name is required.");
  else if (name.length > 60) errors.push("name must be 60 characters or fewer.");
  if (!isSkinId(value.baseSkin)) errors.push("baseSkin must be a built-in Control UI skin.");
  else if (expectedBaseSkin && value.baseSkin !== expectedBaseSkin) {
    errors.push(`baseSkin is ${value.baseSkin}; select that skin before previewing this theme.`);
  }
  if (typeof value.reduceMotion !== "boolean") errors.push("reduceMotion must be a boolean.");
  return name;
}

export function validateThemeArtifact(value: unknown, expectedBaseSkin?: string): ThemeArtifactResult {
  if (!isRecord(value)) return { ok: false, errors: ["Theme output must be a JSON object."] };

  const errors: string[] = [];
  const name = validateArtifactIdentity(value, expectedBaseSkin, errors);
  if (!isRecord(value.tokens)) errors.push("tokens must contain shared, light, and dark objects.");

  const shared = validateTokenMap(isRecord(value.tokens) ? value.tokens.shared : undefined, "shared", errors);
  const light = validateTokenMap(isRecord(value.tokens) ? value.tokens.light : undefined, "light", errors);
  const dark = validateTokenMap(isRecord(value.tokens) ? value.tokens.dark : undefined, "dark", errors);
  if (Object.keys(shared).length + Object.keys(light).length + Object.keys(dark).length === 0) {
    errors.push("At least one valid token override is required.");
  }

  if (errors.length > 0 || !isSkinId(value.baseSkin) || typeof value.reduceMotion !== "boolean") return { ok: false, errors };

  return {
    ok: true,
    artifact: {
      format: "control-ui-theme/v1",
      name,
      baseSkin: value.baseSkin,
      reduceMotion: value.reduceMotion,
      tokens: { shared, light, dark },
    },
  };
}

function jsonCandidates(input: string) {
  const candidates = [input.trim()];
  for (const match of input.matchAll(/```(?:json|control-ui-theme)?\s*([\s\S]*?)```/gi)) {
    if (match[1]?.trim()) candidates.push(match[1].trim());
  }
  return [...new Set(candidates)];
}

export function parseThemeArtifact(input: string, expectedBaseSkin?: string): ThemeArtifactResult {
  if (!input.trim()) return { ok: false, errors: ["Paste a theme response or import a theme file first."] };

  const parsed: unknown[] = [];
  for (const candidate of jsonCandidates(input)) {
    try {
      const value: unknown = JSON.parse(candidate);
      parsed.push(value);
    } catch {
      // A full AI reply is expected to fail before its fenced JSON candidate is tried.
    }
  }
  if (parsed.length === 0) return { ok: false, errors: ["No valid JSON object was found in the response."] };

  const results = parsed.map((value) => validateThemeArtifact(value, expectedBaseSkin));
  const valid = results.filter((result): result is Extract<ThemeArtifactResult, { ok: true }> => result.ok);
  if (valid.length > 1) return { ok: false, errors: ["The response contains more than one valid theme artifact."] };
  if (valid.length === 1) return valid[0];
  return results[0] ?? { ok: false, errors: ["The theme artifact is invalid."] };
}

function compactContract() {
  return THEME_CONTRACT.map((token) => {
    const bucket = isColorValuedToken(token.name) ? "light+dark" : "shared";
    return `- ${token.name} [${bucket}] ${token.description}`;
  }).join("\n");
}

function currentThemeContext(theme: ThemeState) {
  return JSON.stringify(
    {
      baseSkin: theme.skin,
      reduceMotion: theme.reduceMotion,
      tokens: { shared: theme.overrides, light: theme.light, dark: theme.dark },
    },
    null,
    2,
  );
}

export function buildThemePrompt({ mode, description, referenceNames, origin, theme }: BuildThemePromptInput) {
  const contractUrl = `${origin.replace(/\/+$/, "")}/r/theme-contract.json`;
  const references =
    referenceNames.length > 0
      ? referenceNames.map((name, index) => `${index + 1}. ${name}`).join("\n")
      : "No image references. Work from the written brief only.";
  const delivery =
    mode === "coding-agent"
      ? `Read ${contractUrl} if it is reachable, then write one file named <short-name>.control-ui-theme.json in the current working directory. Do not modify application source files. Reply with the file path.`
      : "Return exactly one fenced JSON block and no commentary so it can be pasted into the Theme AI builder.";

  return `Create a Control UI token theme from this brief:\n\n${description.trim()}\n\nReference images\n${references}\n\nThe reference files are attached separately in the same order. Use their visual language, not their literal content.\n\nBase theme currently active in the editor\n\n${currentThemeContext(theme)}\n\nCanonical contract endpoint\n${contractUrl}\n\nOutput rules\n- Keep baseSkin exactly "${theme.skin}".\n- Use format "control-ui-theme/v1".\n- Choose a concise human name, 60 characters or fewer.\n- Put color-valued tokens in both light and dark. Put every other token in shared.\n- Prefer oklch() for authored colors. Preserve accessible foreground/background contrast.\n- Output only theme-contract variables. Never output CSS selectors, skin.css, TypeScript, URLs, imports, comments, or executable code.\n- Omit tokens that should inherit from the base skin.\n- ${delivery}\n\nArtifact shape\n\n{\n  "format": "control-ui-theme/v1",\n  "name": "Theme name",\n  "baseSkin": "${theme.skin}",\n  "reduceMotion": false,\n  "tokens": {\n    "shared": {},\n    "light": {},\n    "dark": {}\n  }\n}\n\nCanonical contract\n${compactContract()}\n`;
}

export function serializeThemeArtifact(artifact: ControlUiThemeArtifactV1) {
  return `${JSON.stringify(artifact, null, 2)}\n`;
}
