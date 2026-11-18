import { contrastAgentRules } from "@/app/(features)/theme-accessibility/agent-rules";
import { THEME_CONTRACT } from "@/src/registry/lib/theme-contract";
import { exportedThemeScopeSelector } from "./override-decls";
import { isColorValuedToken } from "./token-metadata";

type ThemeDiscoveryMode = "existing-project" | "new-direction";

type ThemeArtifactBriefInput = {
  origin: string;
  baseSkin?: string;
  context?: string;
  discoveryMode: ThemeDiscoveryMode;
};

export function compactContract() {
  return THEME_CONTRACT.map((token) => {
    const bucket = isColorValuedToken(token.name) ? "light+dark" : "shared";
    return `- ${token.name} [${bucket}] ${token.description}`;
  }).join("\n");
}

export function themeApplyCssRules(baseSkinRef: string) {
  const scope = exportedThemeScopeSelector(baseSkinRef);
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

export function themeArtifactBrief({ origin, baseSkin, context, discoveryMode }: ThemeArtifactBriefInput) {
  const normalizedOrigin = origin.replace(/\/+$/, "");
  const contractUrl = `${normalizedOrigin}/r/theme-contract.json`;
  const accessibilityUrl = `${normalizedOrigin}/theme-accessibility`;
  const baseSkinRule = baseSkin
    ? `Keep baseSkin exactly "${baseSkin}".`
    : 'Set baseSkin to "none" for the library defaults, or to the id of your optional installed preset.';
  const contrastRules = contrastAgentRules(normalizedOrigin)
    .map((rule) => `- ${rule}`)
    .join("\n");
  const appliesInRepo = discoveryMode === "existing-project";

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
    ? `When finished, tell me the artifact path and where each app imports its CSS. To review the result myself, I check the active theme at ${accessibilityUrl}.`
    : `When finished, reply with the file path and the CSS import it needs, then point me at ${accessibilityUrl} to review the active theme.`;

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
