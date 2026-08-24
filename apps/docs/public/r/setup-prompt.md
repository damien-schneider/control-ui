You are setting up Control UI in this repository, then designing its skin with me.

Read the project first
- If this directory has no package.json, scaffold a new app instead: `npx shadcn@latest init --template next --defaults --name my-app --no-monorepo --force http://127.0.0.1:3000/r/next-app.json && cd my-app && npm run dev -- --port 3001` — replace my-app with the name I give you, and npx shadcn@latest with the runner for my package manager.
- Otherwise read package.json, the framework and its version, the Tailwind version, the CSS entry, and components.json if one already exists.
- Tell me what you found and what you will install, then continue directly to Install. This is a status update, not an approval checkpoint; pause only if a required choice or destructive conflict blocks safe installation.

Install
- The catalog is http://127.0.0.1:3000/r/agent-index.json and every item carries its own install command. http://127.0.0.1:3000/llms.txt indexes the documentation.
- Install exactly one skin pack. Core owns the mechanics and the skin owns every token value, so with no pack installed there is no fallback to render against.
- Install only the components this application needs. Installed files are source I own, so take them from the registry and never hand-copy them out of the documentation.

Wire it
- Every item appends its own imports to the CSS entry named in components.json. Read that entry afterwards and confirm they landed.
- The registry writes `../components/…`. When the CSS entry does not sit beside components/ — app/globals.css with the components under src/ — correct the prefix to `../src/components/…` or none of it resolves.
- Stamp data-skin on the root element with the installed pack's id. A missing or misspelled id fails silently: the page keeps its tokens while every portalled surface — popover, dialog, menu, tooltip — renders with none.
- Start the dev server and confirm that a control paints and that one portalled surface opens with its tokens. Do not move on until both do.

Discovery
- Do not start discovery until every Install and Wire it step above has completed successfully.
- If this project already had an interface, ask me: "Should Control UI match this application's existing visual language, or should we create a new direction?"
- If I choose the existing visual language, inspect its theme tokens, CSS, typography, spacing, components, and representative screens. Tell me what you found and use it as the visual brief; do not ask me to describe what the code already shows.
- If I choose a new direction, or this project was newly scaffolded, ask me to describe the style I want, including color, typography, density, corners, elevation, and motion.
- Ask one focused question at a time, with at most four questions total.
- Ask me to attach one or more reference images in this coding-agent conversation. If I have none, continue from the description.
- Use reference images for their visual language, not their literal content.
- Do not ask me to choose individual CSS variables. Infer a coherent system from my answers.
- Once the direction is clear, create the theme without asking me to restate the brief.

Implementation
- Read the canonical contract from http://127.0.0.1:3000/r/theme-contract.json. If it is unreachable, use the embedded contract below.
- Write exactly one file named <short-name>.control-ui-theme.json in the current working directory.
- Do not modify application source files.
- Set baseSkin to the id of the skin pack you installed.
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
- Every painted knob with what the browser actually paints behind it: `http://127.0.0.1:3000/r/contrast-anatomy.json`, harvested from rendered components and verified against the browser.
- A probe's `anatomy` is the paint stack under the part, back to front: its ancestors, but also a sibling indicator that slides beneath it. The last node is the part itself.
- A part's contrast is decided by the knob it paints from **and** by every knob in that stack, never by theme tokens alone: re-valuing a surface knob changes the contrast of text you did not touch.
- For each probe: rebuild `anatomy` as nested elements, resolve `knobs.text` on the last one, composite the stack's fills behind it, and clear `rendersText ? 4.5 : 3`:1.
- `state: true` means the paint waits on an interaction, so force `knobs.fill` onto the part instead of expecting it to paint itself.
- A knob you leave alone still paints — it keeps its recipe default and still has to clear the ratio under your surfaces.
- `uncovered` names the knobs no documented route renders. Nothing measured them, so treat them as unverified rather than passing.

Artifact shape

{
  "format": "control-ui-theme/v1",
  "name": "Theme name",
  "baseSkin": "<installed skin id>",
  "reduceMotion": false,
  "tokens": {
    "shared": {},
    "light": {},
    "dark": {}
  }
}

Embedded canonical contract fallback

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

When finished, reply with the file path and tell me to import it at http://127.0.0.1:3000/theme-ai-builder, then review the active theme at http://127.0.0.1:3000/theme-accessibility.
