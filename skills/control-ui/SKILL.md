---
name: control-ui
description: Build, theme, and update UI with the Control UI components installed in this repository. Use when adding or migrating screens, writing or applying a theme, or updating Control UI.
---

# Control UI

Control UI is installed source, not a dependency: the components, their recipe stylesheets, and one skin live in this repository, in the control-ui directory the components.json aliases point at. The catalog with every component and its install command is http://127.0.0.1:3000/r/agent-index.json; http://127.0.0.1:3000/llms.txt indexes the documentation.

## Ground rules

- data-skin with the installed skin's id stays on the root element. It is the scope every token is declared under, not a multi-skin switch: a missing or misspelled id leaves the whole contract undeclared, and every portalled surface — popover, dialog, menu, tooltip — renders with no tokens at all.
- Never edit or reorder the recipe stylesheets the CSS entry imports. Layering and scope decide precedence; look changes go through the theme workflow below.
- skin.config.tsx, styles/skin-theme.css, and styles/skin.css belong to this app. Updates never touch them.
- This SKILL.md is installed registry source like the components: control-ui:update refreshes it, so edits made here do not survive an update — repository-specific rules belong in the repository's own instruction files.
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
- Run `node <install>/scripts/control-ui-doctor.mjs --emit-css <short-name>.control-ui-theme.json` to write <short-name>.control-ui-theme.css beside the artifact — that exact suffix is how the update tooling recognises the theme import. Never hand-write the selectors: the emitted `[data-skin="<baseSkin>"][data-skin]` doubles the attribute to match the pack's own weight, which is what hands the win to source order.
- Import that file on the last line of the entry's import block, after every Control UI import. Being last is what makes it win.
- If reduceMotion is true, stamp data-motion="reduced" on the root element beside data-skin; remove the attribute when a later theme turns it back off.
- Contrast is part of the theme, not a follow-up: normal and small text clears 4.5:1 after alpha compositing in both modes, focus indicators and control boundaries clear 3:1. Review a theme at http://127.0.0.1:3000/theme-accessibility.

What the components actually paint:
- Every painted knob with what the browser actually paints behind it, one file per paint family: `http://127.0.0.1:3000/r/contract/<family>.contrast.json`, harvested from rendered components and verified against the browser. `http://127.0.0.1:3000/r/contract/index.json` names the families and how many probes each has.
- A probe's `anatomy` indexes into the file's `anatomies`: the paint stack under the part, back to front, its ancestors but also a sibling indicator that slides beneath it. The last node is the part itself.
- A part's contrast is decided by the knob it paints from **and** by every knob in that stack, never by theme tokens alone: re-valuing a surface knob changes the contrast of text you did not touch.
- For each probe: rebuild `anatomy` as nested elements, resolve `knobs.text` on the last one, composite the stack's fills behind it, and clear `rendersText ? 4.5 : 3`:1.
- `state: true` means the paint waits on an interaction, so force `knobs.fill` onto the part instead of expecting it to paint itself.
- A knob you leave alone still paints — it keeps its recipe default and still has to clear the ratio under your surfaces.
- The family's `/r/contract/<family>.json` slice lists `uncovered`: the knobs no documented route renders. Nothing measured them, so treat them as unverified rather than passing.

## Token contract

Every themable custom property. [light+dark] is color-valued and declared per mode; [shared] is declared once.

- --background [light+dark] Base surface color (panels, bubbles read it via bg-background).
- --foreground [light+dark] Default text color on --background.
- --card [light+dark] Elevated card surface.
- --card-foreground [light+dark] Text color on --card.
- --popover [light+dark] Floating surface base (popover / menu / select / dialog).
- --popover-foreground [light+dark] Text color on --popover.
- --primary [light+dark] THE brand color; primary action surfaces route through it.
- --primary-foreground [light+dark] Text color on --primary.
- --primary-text [light+dark] Readable brand text color on base and card surfaces.
- --muted [light+dark] Subdued fill for quiet surfaces.
- --muted-foreground [light+dark] Secondary / meta text color.
- --secondary [light+dark] Secondary action fill (assistant bubble in chat skins).
- --secondary-foreground [light+dark] Text color on --secondary.
- --accent [light+dark] Hover / selection highlight fill.
- --accent-foreground [light+dark] Text color on --accent.
- --destructive [light+dark] Destructive action color.
- --destructive-foreground [light+dark] Text color on --destructive.
- --destructive-text [light+dark] Readable destructive text color on base and card surfaces.
- --border [light+dark] Hairline border color (carries --ring-opacity).
- --input [light+dark] Form field border color.
- --ring [light+dark] Focus ring color.
- --focus-ring [light+dark] Color of the keyboard focus indicator; defaults to --ring. Must clear 3:1 against every surface it lands on (WCAG 1.4.11).
- --control-rim [light+dark] Boundary color of a control's own edge; defaults to --border.
- --hover-fill [light+dark] Wash a row or control takes on hover; defaults to a 6% tint of --foreground.
- --active-fill [light+dark] Wash a selected or pressed row keeps; defaults to an 8% tint of --foreground.
- --canvas [light+dark] The page paper the scene/panels float on — a level BELOW --background.
- --ring-opacity [shared] Alpha of the border/ring hairlines; 0 = borderless, defaults to 1.
- --badge-neutral [light+dark] Soft neutral-family badge background; the skin owns the exact hue.
- --badge-neutral-foreground [light+dark] Text color on the neutral-family badge.
- --badge-neutral-border [light+dark] Border of the outline neutral-family badge variant.
- --badge-neutral-hover [light+dark] Hover background of filled neutral-family badge links and buttons.
- --badge-red [light+dark] Soft red-family badge background; the skin owns the exact hue.
- --badge-red-foreground [light+dark] Text color on the red-family badge.
- --badge-red-border [light+dark] Border of the outline red-family badge variant.
- --badge-red-hover [light+dark] Hover background of filled red-family badge links and buttons.
- --badge-orange [light+dark] Soft orange-family badge background; the skin owns the exact hue.
- --badge-orange-foreground [light+dark] Text color on the orange-family badge.
- --badge-orange-border [light+dark] Border of the outline orange-family badge variant.
- --badge-orange-hover [light+dark] Hover background of filled orange-family badge links and buttons.
- --badge-yellow [light+dark] Soft yellow-family badge background; the skin owns the exact hue.
- --badge-yellow-foreground [light+dark] Text color on the yellow-family badge.
- --badge-yellow-border [light+dark] Border of the outline yellow-family badge variant.
- --badge-yellow-hover [light+dark] Hover background of filled yellow-family badge links and buttons.
- --badge-green [light+dark] Soft green-family badge background; the skin owns the exact hue.
- --badge-green-foreground [light+dark] Text color on the green-family badge.
- --badge-green-border [light+dark] Border of the outline green-family badge variant.
- --badge-green-hover [light+dark] Hover background of filled green-family badge links and buttons.
- --badge-blue [light+dark] Soft blue-family badge background; the skin owns the exact hue.
- --badge-blue-foreground [light+dark] Text color on the blue-family badge.
- --badge-blue-border [light+dark] Border of the outline blue-family badge variant.
- --badge-blue-hover [light+dark] Hover background of filled blue-family badge links and buttons.
- --badge-purple [light+dark] Soft purple-family badge background; the skin owns the exact hue.
- --badge-purple-foreground [light+dark] Text color on the purple-family badge.
- --badge-purple-border [light+dark] Border of the outline purple-family badge variant.
- --badge-purple-hover [light+dark] Hover background of filled purple-family badge links and buttons.
- --badge-pink [light+dark] Soft pink-family badge background; the skin owns the exact hue.
- --badge-pink-foreground [light+dark] Text color on the pink-family badge.
- --badge-pink-border [light+dark] Border of the outline pink-family badge variant.
- --badge-pink-hover [light+dark] Hover background of filled pink-family badge links and buttons.
- --font-sans [shared] Typeface for the whole UI.
- --font-mono [shared] Monospace face (code, kbd).
- --font-body [shared] Font ROLE for body/UI text; defaults to --font-sans.
- --font-display [shared] Font ROLE for headings; defaults to --font-sans.
- --text-micro [shared] 10px rung — kbd, badge counters, dense numeric meta.
- --text-caption [shared] 11px rung — overlines, timestamps, group labels.
- --text-label [shared] 12px rung — form labels + small chrome.
- --text-body [shared] 14px rung — DEFAULT body & control text.
- --text-body-lg [shared] 16px rung — emphasized / larger body.
- --text-heading-4 [shared] Smallest heading rung (15px).
- --text-heading-4--line-height [shared] Line-height paired onto text-heading-4.
- --text-heading-4--font-weight [shared] Weight paired onto text-heading-4.
- --text-heading-3 [shared] Heading rung (18px).
- --text-heading-3--line-height [shared] Line-height paired onto text-heading-3.
- --text-heading-3--font-weight [shared] Weight paired onto text-heading-3.
- --text-heading-2 [shared] Heading rung (22px).
- --text-heading-2--line-height [shared] Line-height paired onto text-heading-2.
- --text-heading-2--font-weight [shared] Weight paired onto text-heading-2.
- --text-heading-1 [shared] Largest content heading (30px — in-page / markdown h1).
- --text-heading-1--line-height [shared] Line-height paired onto text-heading-1.
- --text-heading-1--font-weight [shared] Weight paired onto text-heading-1.
- --text-heading-1--letter-spacing [shared] Tracking paired onto text-heading-1.
- --text-display [shared] Display rung above h1 (36px — page titles, heroes).
- --text-display--line-height [shared] Line-height paired onto text-display.
- --text-display--font-weight [shared] Weight paired onto text-display.
- --text-display--letter-spacing [shared] Tracking paired onto text-display.
- --radius [shared] THE single radius knob; the whole scale multiplies from it.
- --radius-control [shared] Shared control corner (button, trigger, field, chip); ×2 from --radius.
- --radius-sm [shared] Scale rung: --radius × 0.6.
- --radius-md [shared] Scale rung: --radius × 0.8.
- --radius-lg [shared] Scale rung: --radius × 1.
- --radius-xl [shared] Scale rung: --radius × 1.4.
- --radius-2xl [shared] Scale rung: --radius × 1.6.
- --radius-field [shared] User bubble / composer shell corner; --radius × 2.2.
- --radius-panel [shared] Code / markdown panel corner; --radius × 2.6.
- --radius-scene [shared] Scene frame / large media corner; --radius × 2.8.
- --corner-shape [shared] Progressive corner reshape (round | squircle | scoop | …); defaults to round.
- --corner-radius-fit [shared] Fallback radius shrink where corner-shape: squircle is unsupported.
- --radius-popup-item [shared] Select/menu row corner; derived from --radius-control.
- --radius-popover [shared] Popup container corner, concentric with the fitted row corner.
- --shadow-color [light+dark] Hue every shadow is tinted with.
- --shadow-highlight [light+dark] Inner top light painted along raised surfaces' top edge (carries its resting alpha).
- --shadow-size [shared] Global geometry multiplier: 1 = default depth, 0 = flat.
- --shadow-opacity [shared] Global alpha multiplier: 1 = default density, 0 = invisible.
- --shadow-y [shared] Vertical bias: 0 = centered, 1 = default bottom cast.
- --shadow-control-multiplier [shared] Elevation tier: controls; defaults to 1.
- --shadow-panel-multiplier [shared] Elevation tier: panels; defaults to 2.
- --shadow-popover-multiplier [shared] Elevation tier: floating popovers; defaults to 4.
- --shadow-modal-multiplier [shared] Elevation tier: dialogs and sheets; defaults to 5.
- --shadow-ambient-multiplier [shared] Elevation tier: ambient scene lift; defaults to 8.
- --ease-standard [shared] Default easing curve for color/text transitions.
- --ease-emphasized [shared] Emphasized curve for entrances and larger moves.
- --duration-fast [shared] Fast tempo (hover, color).
- --duration-base [shared] Base tempo (menus, indicators).
- --duration-slow [shared] Slow tempo (panel/message entrances).
- --popover-opacity [shared] Floating-surface translucency; <1 + blur = frosted glass.
- --backdrop-blur-popover [shared] Backdrop blur behind floating surfaces.
- --overlay-opacity [shared] Modal overlay (dialog backdrop) dim strength.
- --backdrop-blur-overlay [shared] Backdrop blur of the modal overlay.
- --scroll-fade-size [shared] Edge-fade depth of scrollable surfaces; 0 = hard edges.
- --popover-padding [shared] Gap between popup container edge and rows (drives concentric corners).
- --padding-x [shared] Horizontal content density of rounded surfaces (bubble, composer).
- --padding-y [shared] Vertical content density of rounded surfaces.
- --control-h [shared] THE base control height (md); the ramp derives from it.
- --control-h-xs [shared] Derived control height: xs (×0.78, px-snapped).
- --control-h-sm [shared] Derived control height: sm (×0.89, px-snapped).
- --control-h-lg [shared] Derived control height: lg (×1.11, px-snapped).
- --focus-ring-width [shared] Thickness of the keyboard focus indicator; 0 removes it and fails WCAG 2.4.7.
- --focus-ring-style [shared] Line style of the keyboard focus indicator (solid, dotted, dashed); none removes it and fails WCAG 2.4.7.
- --focus-ring-offset [shared] Gap between a control edge and its focus indicator; negative draws the indicator inside.
- --control-rim-width [shared] Thickness of a control's own edge; defaults to 1px, shared across modes.
