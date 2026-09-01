import { contrastAgentRules } from "@/app/(features)/theme-accessibility/agent-rules";
import { THEME_CONTRACT, THEME_CONTRACT_NAMES, type ThemeContractToken } from "@/src/registry/lib/theme-contract";
import { artifactFromDtcg, isDtcg } from "./dtcg";
import { skinScopeSelector } from "./override-decls";
import { isSkinId } from "./presets";
import { isColorValuedToken } from "./token-metadata";
import type { ControlUiThemeArtifactV1, ThemeState, TokenValues } from "./types";

export type ThemeArtifactResult = { ok: true; artifact: ControlUiThemeArtifactV1 } | { ok: false; errors: string[] };

type BuildThemePromptInput = {
  origin: string;
  theme: ThemeState;
};

type ThemeDiscoveryMode = "existing-project" | "new-direction";

type ThemeArtifactBriefInput = {
  origin: string;
  baseSkin?: string;
  context?: string;
  discoveryMode: ThemeDiscoveryMode;
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
    return name === "--corner-radius-fit" ? "opacity" : "border-radius";
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
      // full AI reply is expected to fail before its fenced JSON candidate is tried.
    }
  }
  if (parsed.length === 0) return { ok: false, errors: ["No valid JSON object was found in the response."] };

  const results = parsed.map((value) => validateThemeArtifact(isDtcg(value) ? artifactFromDtcg(value) : value, expectedBaseSkin));
  const valid = results.filter((result): result is Extract<ThemeArtifactResult, { ok: true }> => result.ok);
  if (valid.length > 1) return { ok: false, errors: ["The response contains more than one valid theme artifact."] };
  if (valid.length === 1) return valid[0];
  return results[0] ?? { ok: false, errors: ["The theme artifact is invalid."] };
}

export function compactContract() {
  return THEME_CONTRACT.map((token) => {
    const bucket = isColorValuedToken(token.name) ? "light+dark" : "shared";
    return `- ${token.name} [${bucket}] ${token.description}`;
  }).join("\n");
}

/**
 * The artifact is the source of record; this is the one derived CSS an app imports. The doctor emits byte-identical
 * output from the installed copy, so nobody has to hand-write the doubled-attribute selector the pack's weight needs.
 */
export function themeArtifactCss(artifact: ControlUiThemeArtifactV1): string {
  const scope = skinScopeSelector(artifact.baseSkin);
  const block = (tokens: TokenValues) =>
    Object.entries(tokens)
      .map(([name, value]) => `  ${name}: ${value};`)
      .join("\n");
  const light = { ...artifact.tokens.shared, ...artifact.tokens.light };
  const parts = [`/* ${artifact.name} — generated by control-ui-doctor --emit-css. Import last, after every Control UI import. */`];
  if (Object.keys(light).length > 0) parts.push(`${scope} {\n${block(light)}\n}`);
  if (Object.keys(artifact.tokens.dark).length > 0)
    parts.push(`:where(.dark) ${scope},\n.dark${scope} {\n${block(artifact.tokens.dark)}\n}`);
  return `${parts.join("\n\n")}\n`;
}

export function themeApplyCssRules(baseSkinRef: string) {
  const scope = `[data-skin="${baseSkinRef}"][data-skin]`;
  return [
    `Run \`node <install>/scripts/control-ui-doctor.mjs --emit-css <short-name>.control-ui-theme.json\` to write <short-name>.control-ui-theme.css beside the artifact — that exact suffix is how the update tooling recognises the theme import. Never hand-write the selectors: the emitted \`${scope}\` doubles the attribute to match the pack's own weight, which is what hands the win to source order.`,
    "Import that file on the last line of the entry's import block, after every Control UI import. Being last is what makes it win.",
    'If reduceMotion is true, stamp data-motion="reduced" on the root element beside data-skin; remove the attribute when a later theme turns it back off.',
  ];
}

function themeDiscoveryBrief(mode: ThemeDiscoveryMode) {
  if (mode === "existing-project") {
    return `- Do not start discovery until every Install and Wire it step above has completed successfully.
- Then ask me this, and wait for my answer:
  "Should Control UI match this app's existing look, or do you want a new direction?
   A — Match: I read your current styles and build a skin that sits beside them.
   B — New: tell me the style you want, and attach reference images if you have any."
- If this project had no interface, skip the question, treat it as B, and ask me for the style and any references.
- On A, read the existing theme tokens, CSS, typography, spacing, components, and representative screens. Tell me what you found and use it as the visual brief; do not ask me to describe what the code already shows.
- On B, work from my description and my reference images, covering color, typography, density, corners, elevation, and motion.
- Stay on the neutral reset pack and let the theme carry the direction. Only when I name a stock pack for its own character do you install it with --overwrite and update data-skin.
- Resemblance is not a reason to switch packs: a pack's knob overrides and adornments outlive any theme written on top of it.`;
  }

  return "- First ask me to describe the visual direction, including color, typography, density, corners, elevation, and motion.";
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

export function themeArtifactBrief({ origin, baseSkin, context, discoveryMode }: ThemeArtifactBriefInput) {
  const normalizedOrigin = origin.replace(/\/+$/, "");
  const contractUrl = `${normalizedOrigin}/r/theme-contract.json`;
  const builderUrl = `${normalizedOrigin}/theme-ai-builder`;
  const accessibilityUrl = `${normalizedOrigin}/theme-accessibility`;
  const baseSkinRule = baseSkin ? `Keep baseSkin exactly "${baseSkin}".` : "Set baseSkin to the id of the skin pack you installed.";
  const contrastRules = contrastAgentRules(normalizedOrigin)
    .map((rule) => `- ${rule}`)
    .join("\n");
  const appliesInRepo = discoveryMode === "existing-project";
  // The setup lane just installed from this registry, so the contract URL is proven reachable and the embed is dead weight; only the copy-paste lane can run without network.
  const contractRule = appliesInRepo
    ? `- Read the canonical contract from ${contractUrl}. The registry that served the install serves this list too.`
    : `- Read the canonical contract from ${contractUrl}. If it is unreachable, use the embedded contract below.`;
  const sourceFilesRule = appliesInRepo
    ? "- Application source stays untouched until the artifact is finished; Apply it below names the only writes beyond the artifact itself."
    : "- Do not modify application source files.";
  const applySection = appliesInRepo
    ? `\nApply it
- The artifact is the source of record; each app consumes it as one derived CSS file.
${themeApplyCssRules(baseSkin ?? "<baseSkin>")
  .map((rule) => `- ${rule}`)
  .join("\n")}
- Every app this run installed into gets the same theme this same way. One app themed while another rests on the raw reset is the bug, not a smaller scope.
- Reload and confirm a changed token paints — a radius, the primary — before you call it applied.\n`
    : "";
  const embeddedContract = appliesInRepo ? "" : `Embedded canonical contract fallback\n\n${compactContract()}\n\n`;
  const closing = appliesInRepo
    ? `When finished, tell me the artifact path and where each app imports its CSS. To review the result myself, I import the artifact at ${builderUrl} and check it at ${accessibilityUrl}.`
    : `When finished, reply with the file path and tell me to import it at ${builderUrl}, then review the active theme at ${accessibilityUrl}.`;

  return `Discovery
${themeDiscoveryBrief(discoveryMode)}
- Ask one focused question at a time, with at most four questions total.
- If I have attached no reference images yet, ask for them in this coding-agent conversation. If I have none, continue from the description.
- Use reference images for their visual language, not their literal content.
- Do not ask me to choose individual CSS variables. Infer a coherent system from my answers.
- Once the direction is clear, create the theme without asking me to restate the brief.
${context ? `\n${context}\n` : ""}
Implementation
${contractRule}
- Write exactly one file named <short-name>.control-ui-theme.json in the current working directory.
${sourceFilesRule}
- ${baseSkinRule}
- Use format "control-ui-theme/v1".
- Choose a concise human name, 60 characters or fewer.
- Put color-valued tokens in both light and dark. Put every other token in shared.
- Prefer oklch() for authored colors and preserve accessible foreground/background contrast.
- Output only variables from the canonical theme contract.
- Omit tokens that should inherit from the base skin.

Accessibility gate
- Treat contrast as a required part of the theme, not a follow-up.
- Calculate resolved foreground/background contrast after alpha compositing in both light and dark. Sample gradients across every stop and interpolation, not one convenient point.
- Keep normal and small text at 4.5:1 or higher for body, muted fills, cards, popovers, popup highlights, semantic text, filled controls, selected tabs, and filled or outline badge states.
- Check focus indicators and control boundaries at 3:1 or higher against adjacent surfaces. A boundary is advisory when it is not required to identify the control.
- If a saturated fill needs light text, darken the fill until the pair clears 4.5:1; do not swap text color by visual guesswork alone.
- Do not claim the theme passes without checking the ratios.

What the components actually paint
${contrastRules}

Artifact shape

{
  "format": "control-ui-theme/v1",
  "name": "Theme name",
  "baseSkin": "${baseSkin ?? "<installed skin id>"}",
  "reduceMotion": false,
  "tokens": {
    "shared": {},
    "light": {},
    "dark": {}
  }
}
${applySection}
${embeddedContract}${closing}
`;
}

export function buildThemePrompt({ origin, theme }: BuildThemePromptInput) {
  const context = `Base theme currently active in the editor\n${currentThemeContext(theme)}`;
  return `You are my Control UI theme builder. Work conversationally, then create one importable theme file.

${themeArtifactBrief({ origin, baseSkin: theme.skin, context, discoveryMode: "new-direction" })}`;
}

export function serializeThemeArtifact(artifact: ControlUiThemeArtifactV1) {
  return `${JSON.stringify(artifact, null, 2)}\n`;
}
