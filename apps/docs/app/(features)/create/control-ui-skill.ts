import { contrastAgentRules } from "@/app/(features)/theme-accessibility/agent-rules";
import { compactContract, themeApplyCssRules } from "@/components/theme-drawer/theme-artifact";

export function buildControlUiSkill({ origin }: { origin: string }) {
  const normalizedOrigin = origin.replace(/\/+$/, "");
  const bullets = (rules: string[]) => rules.map((rule) => `- ${rule}`).join("\n");

  return `---
name: control-ui
description: Build, theme, lint, and update UI with Control UI in this repository, whether installed as source or as the @ctrl-ui/react package. Use when adding or migrating screens, styling a Control UI component, writing or applying a theme, setting up lint rules, or updating Control UI.
---

# Control UI

Control UI reaches a repository one of two ways. Installed source: the components, their recipe stylesheets, and one skin live in the control-ui directory the components.json aliases point at. The package: \`@ctrl-ui/react\` in package.json, imports mirror the registry tree (\`@ctrl-ui/react/ui/button\`), styles come from \`@ctrl-ui/react/styles/index.css\`, and there is no skin, no data-skin, and no update script — \`bun update @ctrl-ui/react\` is the update. Check which one this repository uses before following a rule marked for the other. The catalog with every component is ${normalizedOrigin}/r/agent-index.json; ${normalizedOrigin}/llms.txt indexes the documentation.

## Ground rules for installed source

- data-skin with the installed skin's id stays on the root element. It is the scope every token is declared under, not a multi-skin switch: a missing or misspelled id leaves the whole contract undeclared, and every portalled surface — popover, dialog, menu, tooltip — renders with no tokens at all.
- Never edit or reorder the recipe stylesheets the CSS entry imports. Layering and scope decide precedence; look changes go through the theme workflow below.
- skin.config.tsx, styles/skin-theme.css, and styles/skin.css belong to this app. Updates never touch them.
- This SKILL.md is installed registry source like the components: control-ui:update refreshes it, so edits made here do not survive an update — repository-specific rules belong in the repository's own instruction files.
- npm run control-ui:diff previews an update against the registry; npm run control-ui:update applies it with --overwrite and wants a clean tree, because it rewrites installed source. Its chained scripts/fix-css-imports.mjs pass repairs the CSS entry afterwards — the overwrite re-appends the import block under the canonical prefix — so never run the bare shadcn add in its place.
- Registry installs append CSS imports written as ../components/control-ui/…, which resolves only when the entry sits one directory above the components alias. After any install, resolve each appended line against the entry's own directory and rewrite the prefix where it points at no file; one wrong prefix silently unstyles everything below it.
- Never redeclare Control UI-mapped keys — --color-*, --radius-sm through --radius-2xl, --font-*, --text-* — in an app @theme block: Tailwind merges every @theme in the build and the last declaration wins, silently detaching those utilities from the skin. App :root or .dark blocks declaring skin token names are dead under the skin scope; delete them rather than extend them, and re-point app-specific names at skin tokens instead of keeping a parallel palette.
- npm run control-ui:doctor (scripts/control-ui-doctor.mjs in the installed directory) audits all of this read-only: unresolved CSS imports, the theme import staying last, app @theme blocks redeclaring Control UI keys, dead or hybrid :root palettes, and the data-skin stamp. Run it after any update or migration and resolve its errors before styling on top of them.

## Building screens

- Import components from one place: the installed control-ui directory through this app's alias, or \`@ctrl-ui/react/<path>\` for the package. Never mix both in one repository.
- Props follow one convention: variant, tone, size, iconOnly; composition uses render instead of asChild. Read the exported prop types of the installed component before mapping a call site from another library, and treat a variant with no counterpart as a question, not a guess.
- When adding or migrating control icons, verify their rendered SVG dimensions against the component recipe's size knob; icon libraries can supply oversized defaults, so default sizing belongs in the shared recipe rather than repeated call-site utilities.
- Never add overflow-hidden or overflow: clip to a layout container without a concrete clipping requirement. Rounded surfaces do not need clipping; it cuts off child shadows and focus rings. Folding panels clip only while animating and leave settled content visible.
- A call site migrated from another component keeps its layout classes — width, flex, grid, gap — and sheds its styling ones: the border, radius, background and padding utilities the old component needed now fight the recipe underneath.

## Class names on components

- className on a Control UI component only places it: flex and grid behavior, gap, width and height, margin, position, overflow, z-index. Everything the component paints is the component's: color, background, type, padding, border, radius, shadow, ring, outline, opacity, state variants such as hover:, focus:, data-[…]: and aria-[…]:, arbitrary [&…] selectors, and !important.
- style on a component carries --cui-* knobs and layout only; color, background, font, padding, border, radius, shadow, opacity and filter keys are the component's. Stylesheets never paint a part through a data-slot or data-control selector, and a parent never reaches into parts with classes such as [&_[data-slot=…]]: or *:data-[slot=…]:.
- To change how a component looks, use its props (variant, tone, size, density, padding), set one of its --cui-* knobs through style or in the theme, or compose the part made for it. When none of those exists, the component is missing a prop, variant, or default: say so instead of overriding it at the call site.
- Actions that appear on hover go inside Reveal, with RevealScope on the row or tile that reveals them, never opacity-0 with group-hover:, focus-within: or pointer-coarse: classes. Reveal also shows on keyboard focus, while a menu inside is open, and always on touch screens. RevealScope paints nothing, so make the painted row or card itself the scope, through className or its render element, instead of wrapping it; Reveal itself stays layout-only.
- Plain elements around components stay yours to style. Wrapping a component in a div only to paint it the same way is the same override. Paint that is data, such as a user-picked fill or a color or font specimen, goes on a plain element of your own and the component inherits it.
- Enforce this with the lint rules, wired once in the linter the repository already runs:
  - Biome 2.5 or later: \`"extends": ["@ctrl-ui/react/biome"]\` in biome.json. It runs no-component-style-classes, no-component-style-props, and no-component-part-css, the stylesheet rule, which skips installed source under components/control-ui. Rules added in later versions then arrive with the package update.
  - ESLint (flat config): \`import controlUi from "@ctrl-ui/react/eslint-plugin"\`, register it under plugins as "control-ui", and turn on \`control-ui/no-component-style-classes\` and \`control-ui/no-component-style-props\`. The stylesheet rule is Biome only.
  - oxlint: \`"jsPlugins": ["@ctrl-ui/react/eslint-plugin"]\` in .oxlintrc.json, then the same rule names.
  - Installed source has no package to load rules from: add \`@ctrl-ui/react\` as a devDependency for the rules alone, or port them.
  - Any other linter: port the rule from \`@ctrl-ui/react/lint/class-policy.mjs\`, which holds the patterns and messages. Keep it scoped to JSX elements imported from \`@ctrl-ui/react\` or the control-ui directory, and test the string literals inside className.
- The rule only follows imports from Control UI. When the app imports components through its own package or folder that re-exports or wraps them (\`@acme/ui/components/button\`), declare that path as an import source, or every call site stays invisible:
  - ESLint and oxlint: \`["error", { "importSources": ["@acme/ui/components/"] }]\` on both component rules.
  - Biome: Grit rules take no options, so generate them with the path. Add \`"postinstall": "control-ui-grit --import-source=@acme/ui/components/ --out=.control-ui"\` to the root package.json, list the generated no-component-style-classes.grit, no-component-style-props.grit, and no-component-part-css.grit from \`./.control-ui/\` under plugins instead of the preset, and gitignore \`.control-ui\`. Every install, including a Control UI update, regenerates the rules.
  - Keep the wrappers themselves layout-only: a wrapper that paints the component is the same override.
- When the rule surfaces existing violations, fix them through props and knobs. A large backlog is enabled folder by folder through the linter's overrides, never silenced with suppressions.
- \`no-raw-type-classes\` is the stricter companion for text sizes on every element, components or not. Adopt it folder by folder: it flags all hand-sized text, not only Control UI.

## Text

- React text goes through Text and Heading from ui/typography. size picks the rung by role — micro for kbd and counters, caption for overlines and section or group labels, label for form labels and small chrome, body for running text — tone picks the color role, weight the weight. className on them carries layout only.
- Never pair a text-* rung with a text color utility in className. Merge classes with Control UI's lib/cn: a bare twMerge, such as the shadcn lib/utils cn, reads text-micro as a color and silently drops it next to text-muted-foreground. App-specific rungs extend lib/cn's withControlUiMerge instead of starting a second merger.
- Control text — buttons, fields, tabs, menu items — is sized by the control's size prop or by its --cui-*-font-size knob in the skin, never by a text-* span inside the control. Secondary text inside an item uses the part made for it, such as DropdownMenuShortcut, ItemDescription, or FieldDescription, not a styled span.

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
