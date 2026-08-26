import { contrastAgentRules } from "@/app/(features)/theme-accessibility/agent-rules";
import { compactContract, themeApplyCssRules } from "@/components/theme-drawer/theme-artifact";

export function buildControlUiSkill({ origin }: { origin: string }) {
  const normalizedOrigin = origin.replace(/\/+$/, "");
  const bullets = (rules: string[]) => rules.map((rule) => `- ${rule}`).join("\n");

  return `---
name: control-ui
description: Build, theme, and update UI with the Control UI components installed in this repository. Use when adding or migrating screens, writing or applying a theme, or updating Control UI.
---

# Control UI

Control UI is installed source, not a dependency: the components, their recipe stylesheets, and one skin live in this repository, in the control-ui directory the components.json aliases point at. The catalog with every component and its install command is ${normalizedOrigin}/r/agent-index.json; ${normalizedOrigin}/llms.txt indexes the documentation.

## Ground rules

- data-skin with the installed skin's id stays on the root element. It is the scope every token is declared under, not a multi-skin switch: a missing or misspelled id leaves the whole contract undeclared, and every portalled surface — popover, dialog, menu, tooltip — renders with no tokens at all.
- Never edit or reorder the recipe stylesheets the CSS entry imports. Layering and scope decide precedence; look changes go through the theme workflow below.
- skin.config.tsx, styles/skin-theme.css, and styles/skin.css belong to this app. Updates never touch them.
- npm run control-ui:diff previews an update against the registry; npm run control-ui:update applies it with --overwrite and wants a clean tree, because it rewrites installed source. Its chained scripts/fix-css-imports.mjs pass repairs the CSS entry afterwards — the overwrite re-appends the import block under the canonical prefix — so never run the bare shadcn add in its place.
- Registry installs append CSS imports written as ../components/control-ui/…, which resolves only when the entry sits one directory above the components alias. After any install, resolve each appended line against the entry's own directory and rewrite the prefix where it points at no file; one wrong prefix silently unstyles everything below it.
- Never redeclare Control UI-mapped keys — --color-*, --radius-sm through --radius-2xl, --font-*, --text-* — in an app @theme block: Tailwind merges every @theme in the build and the last declaration wins, silently detaching those utilities from the skin. App :root or .dark blocks declaring skin token names are dead under the skin scope; delete them rather than extend them, and re-point app-specific names at skin tokens instead of keeping a parallel palette.
- npm run control-ui:doctor (scripts/control-ui-doctor.mjs in the installed directory) audits all of this read-only: unresolved CSS imports, the theme import staying last, app @theme blocks redeclaring Control UI keys, dead or hybrid :root palettes, and the data-skin stamp. Run it after any update or migration and resolve its errors before styling on top of them.

## Building screens

- Import components from the installed control-ui directory through this app's alias, never from a package.
- Props follow one convention: variant, tone, size, iconOnly; composition uses render instead of asChild. Read the exported prop types of the installed component before mapping a call site from another library, and treat a variant with no counterpart as a question, not a guess.
- A call site migrated from another component keeps its layout classes — width, flex, grid, gap — and sheds its styling ones: the border, radius, background and padding utilities the old component needed now fight the recipe underneath.

## Theming

- The contract tokens below re-theme every screen that reads their names, so a token change is an app-wide decision, never a local styling fix.
- One theme artifact is the source of record: <short-name>.control-ui-theme.json, format control-ui-theme/v1, with tokens split into shared, light, and dark. Color-valued tokens go in light and dark; every other token in shared. A token left out inherits the base skin.
- Each app consumes the artifact as one derived CSS file:
${bullets(themeApplyCssRules("<baseSkin>"))}
- Contrast is part of the theme, not a follow-up: normal and small text clears 4.5:1 after alpha compositing in both modes, focus indicators and control boundaries clear 3:1. Review a theme at ${normalizedOrigin}/theme-accessibility.

What the components actually paint:
${bullets(contrastAgentRules(normalizedOrigin))}

## Token contract

Every themable custom property. [light+dark] is color-valued and declared per mode; [shared] is declared once.

${compactContract()}
`;
}
