import { BADGE_COLORS } from "../sources/control-ui/ui/badge";

// Names only — values live in each pack's theme.css. name absent here is not in the contract: packs must not declare it in theme.css, and skin.css must never redeclare one that is here.
export type ThemeContractGroup = "color" | "typography" | "radius" | "shadow" | "motion" | "surface" | "layout";

/** core = re-valued first; advanced = fine-tuning knobs; derived = core ships default, so coverage test does not require it. */
export type ThemeContractTier = "core" | "advanced" | "derived";

export type ThemeContractToken = {
  /** Custom-property name as declared in theme.css, e.g. "--primary". */
  name: string;
  group: ThemeContractGroup;
  tier: ThemeContractTier;
  /** One-liner for docs token-reference page. */
  description: string;
};

function token(name: string, group: ThemeContractGroup, tier: ThemeContractTier, description: string): ThemeContractToken {
  return { name, group, tier, description };
}

const badgeColorTokens: ThemeContractToken[] = BADGE_COLORS.flatMap((color) => [
  token(`--badge-${color}`, "color", "derived", `Soft ${color}-family badge background; the skin owns the exact hue.`),
  token(`--badge-${color}-foreground`, "color", "derived", `Text color on the ${color}-family badge.`),
  token(`--badge-${color}-border`, "color", "derived", `Border of the outline ${color}-family badge variant.`),
  token(`--badge-${color}-hover`, "color", "derived", `Hover background of filled ${color}-family badge links and buttons.`),
]);

export const THEME_CONTRACT: readonly ThemeContractToken[] = [
  token("--background", "color", "core", "Base surface color (panels, bubbles read it via bg-background)."),
  token("--foreground", "color", "core", "Default text color on --background."),
  token("--card", "color", "core", "Elevated card surface."),
  token("--card-foreground", "color", "core", "Text color on --card."),
  token("--popover", "color", "core", "Floating surface base (popover / menu / select / dialog)."),
  token("--popover-foreground", "color", "core", "Text color on --popover."),
  token("--primary", "color", "core", "THE brand color; primary action surfaces route through it."),
  token("--primary-foreground", "color", "core", "Text color on --primary."),
  token("--primary-text", "color", "derived", "Readable brand text color on base and card surfaces."),
  token("--muted", "color", "core", "Subdued fill for quiet surfaces."),
  token("--muted-foreground", "color", "core", "Secondary / meta text color."),
  token("--secondary", "color", "core", "Secondary action fill (assistant bubble in chat skins)."),
  token("--secondary-foreground", "color", "core", "Text color on --secondary."),
  token("--accent", "color", "core", "Hover / selection highlight fill."),
  token("--accent-foreground", "color", "core", "Text color on --accent."),
  token("--destructive", "color", "core", "Destructive action color."),
  token("--destructive-foreground", "color", "core", "Text color on --destructive."),
  token("--destructive-text", "color", "derived", "Readable destructive text color on base and card surfaces."),
  token("--border", "color", "core", "Hairline border color (carries --ring-opacity)."),
  token("--input", "color", "core", "Form field border color."),
  token("--ring", "color", "core", "Focus ring color."),
  token(
    "--focus-ring",
    "color",
    "derived",
    "Color of the keyboard focus indicator; defaults to --ring. Must clear 3:1 against every surface it lands on (WCAG 1.4.11).",
  ),
  token("--control-rim", "color", "derived", "Boundary color of a control's own edge; defaults to --border."),
  token("--hover-fill", "color", "derived", "Wash a row or control takes on hover; defaults to a 6% tint of --foreground."),
  token("--active-fill", "color", "derived", "Wash a selected or pressed row keeps; defaults to an 8% tint of --foreground."),
  token("--canvas", "color", "core", "The page paper the scene/panels float on — a level BELOW --background."),
  // color knobs
  token("--ring-opacity", "color", "derived", "Alpha of the border/ring hairlines; 0 = borderless, defaults to 1."),
  ...badgeColorTokens,

  token("--font-sans", "typography", "core", "Typeface for the whole UI."),
  token("--font-mono", "typography", "core", "Monospace face (code, kbd)."),
  token("--font-body", "typography", "derived", "Font ROLE for body/UI text; defaults to --font-sans."),
  token("--font-display", "typography", "derived", "Font ROLE for headings; defaults to --font-sans."),
  token("--text-micro", "typography", "derived", "10px rung — kbd, badge counters, dense numeric meta."),
  token("--text-caption", "typography", "derived", "11px rung — overlines, timestamps, group labels."),
  token("--text-label", "typography", "advanced", "12px rung — form labels + small chrome."),
  token("--text-body", "typography", "derived", "14px rung — DEFAULT body & control text."),
  token("--text-body-lg", "typography", "derived", "16px rung — emphasized / larger body."),
  token("--text-heading-4", "typography", "derived", "Smallest heading rung (15px)."),
  token("--text-heading-4--line-height", "typography", "derived", "Line-height paired onto text-heading-4."),
  token("--text-heading-4--font-weight", "typography", "derived", "Weight paired onto text-heading-4."),
  token("--text-heading-3", "typography", "derived", "Heading rung (18px)."),
  token("--text-heading-3--line-height", "typography", "derived", "Line-height paired onto text-heading-3."),
  token("--text-heading-3--font-weight", "typography", "derived", "Weight paired onto text-heading-3."),
  token("--text-heading-2", "typography", "derived", "Heading rung (22px)."),
  token("--text-heading-2--line-height", "typography", "derived", "Line-height paired onto text-heading-2."),
  token("--text-heading-2--font-weight", "typography", "derived", "Weight paired onto text-heading-2."),
  token("--text-heading-1", "typography", "derived", "Largest content heading (30px — in-page / markdown h1)."),
  token("--text-heading-1--line-height", "typography", "derived", "Line-height paired onto text-heading-1."),
  token("--text-heading-1--font-weight", "typography", "derived", "Weight paired onto text-heading-1."),
  token("--text-heading-1--letter-spacing", "typography", "derived", "Tracking paired onto text-heading-1."),
  token("--text-display", "typography", "derived", "Display rung above h1 (36px — page titles, heroes)."),
  token("--text-display--line-height", "typography", "derived", "Line-height paired onto text-display."),
  token("--text-display--font-weight", "typography", "derived", "Weight paired onto text-display."),
  token("--text-display--letter-spacing", "typography", "derived", "Tracking paired onto text-display."),

  token("--radius", "radius", "core", "THE single radius knob; the whole scale multiplies from it."),
  token("--radius-control", "radius", "advanced", "Shared control corner (button, trigger, field, chip); ×2 from --radius."),
  token("--radius-sm", "radius", "derived", "Scale rung: --radius × 0.6."),
  token("--radius-md", "radius", "derived", "Scale rung: --radius × 0.8."),
  token("--radius-lg", "radius", "derived", "Scale rung: --radius × 1."),
  token("--radius-xl", "radius", "derived", "Scale rung: --radius × 1.4."),
  token("--radius-2xl", "radius", "derived", "Scale rung: --radius × 1.6."),
  token("--radius-field", "radius", "advanced", "User bubble / composer shell corner; --radius × 2.2."),
  token("--radius-panel", "radius", "advanced", "Code / markdown panel corner; --radius × 2.6."),
  token("--radius-scene", "radius", "advanced", "Scene frame / large media corner; --radius × 2.8."),
  token("--corner-shape", "radius", "derived", "Progressive corner reshape (round | squircle | scoop | …); defaults to round."),
  token("--corner-radius-fit", "radius", "derived", "Fallback radius shrink where corner-shape: squircle is unsupported."),
  token("--radius-popup-item", "radius", "advanced", "Select/menu row corner; derived from --radius-control."),
  token("--radius-popover", "radius", "derived", "Popup container corner, concentric with the fitted row corner."),

  token("--shadow-color", "shadow", "advanced", "Hue every shadow is tinted with."),
  token("--shadow-highlight", "shadow", "derived", "Inner top light painted along raised surfaces' top edge (carries its resting alpha)."),
  token("--shadow-size", "shadow", "advanced", "Global geometry multiplier: 1 = default depth, 0 = flat."),
  token("--shadow-opacity", "shadow", "advanced", "Global alpha multiplier: 1 = default density, 0 = invisible."),
  token("--shadow-y", "shadow", "derived", "Vertical bias: 0 = centered, 1 = default bottom cast."),
  token("--shadow-control-multiplier", "shadow", "derived", "Elevation tier: controls; defaults to 1."),
  token("--shadow-panel-multiplier", "shadow", "derived", "Elevation tier: panels; defaults to 2."),
  token("--shadow-popover-multiplier", "shadow", "derived", "Elevation tier: floating popovers; defaults to 4."),
  token("--shadow-modal-multiplier", "shadow", "derived", "Elevation tier: dialogs and sheets; defaults to 5."),
  token("--shadow-ambient-multiplier", "shadow", "derived", "Elevation tier: ambient scene lift; defaults to 8."),

  token("--ease-standard", "motion", "advanced", "Default easing curve for color/text transitions."),
  token("--ease-emphasized", "motion", "advanced", "Emphasized curve for entrances and larger moves."),
  token("--duration-fast", "motion", "core", "Fast tempo (hover, color)."),
  token("--duration-base", "motion", "core", "Base tempo (menus, indicators)."),
  token("--duration-slow", "motion", "core", "Slow tempo (panel/message entrances)."),

  token("--popover-opacity", "surface", "advanced", "Floating-surface translucency; <1 + blur = frosted glass."),
  token("--backdrop-blur-popover", "surface", "advanced", "Backdrop blur behind floating surfaces."),
  token("--overlay-opacity", "surface", "advanced", "Modal overlay (dialog backdrop) dim strength."),
  token("--backdrop-blur-overlay", "surface", "advanced", "Backdrop blur of the modal overlay."),
  token("--scroll-fade-size", "surface", "advanced", "Edge-fade depth of scrollable surfaces; 0 = hard edges."),

  token("--popover-padding", "layout", "advanced", "Gap between popup container edge and rows (drives concentric corners)."),
  token("--padding-x", "layout", "advanced", "Horizontal content density of rounded surfaces (bubble, composer)."),
  token("--padding-y", "layout", "advanced", "Vertical content density of rounded surfaces."),
  token("--control-h", "layout", "advanced", "THE base control height (md); the ramp derives from it."),
  token("--control-h-xs", "layout", "derived", "Derived control height: xs (×0.78, px-snapped)."),
  token("--control-h-sm", "layout", "derived", "Derived control height: sm (×0.89, px-snapped)."),
  token("--control-h-lg", "layout", "derived", "Derived control height: lg (×1.11, px-snapped)."),
  token("--focus-ring-width", "layout", "derived", "Thickness of the keyboard focus indicator; 0 removes it and fails WCAG 2.4.7."),
  token(
    "--focus-ring-style",
    "layout",
    "derived",
    "Line style of the keyboard focus indicator (solid, dotted, dashed); none removes it and fails WCAG 2.4.7.",
  ),
  token(
    "--focus-ring-offset",
    "layout",
    "derived",
    "Gap between a control edge and its focus indicator; negative draws the indicator inside.",
  ),
  token("--control-rim-width", "layout", "derived", "Thickness of a control's own edge; defaults to 1px, shared across modes."),
];

export const THEME_CONTRACT_NAMES: ReadonlySet<string> = new Set(THEME_CONTRACT.map((entry) => entry.name));

/** Tokens every pack must resolve in both modes — derived tier rides its core default instead. */
export const REQUIRED_THEME_CONTRACT: readonly ThemeContractToken[] = THEME_CONTRACT.filter((entry) => entry.tier !== "derived");
export const REQUIRED_THEME_CONTRACT_NAMES: ReadonlySet<string> = new Set(REQUIRED_THEME_CONTRACT.map((entry) => entry.name));

// Core-owned mechanics stay off contract: --nest-safe, --nest-corner-ratio, --radius-popup-item-fit, and --control-h-md
// are math and aliases, not design choices, declared once on :where([data-skin]) so any pack override still wins.
