import { BADGE_COLORS } from "../sources/control-ui/ui/badge";
import { CHART_COLORS } from "../sources/control-ui/ui/chart-colors";

export type ThemeContractGroup = "color" | "typography" | "radius" | "shadow" | "motion" | "surface" | "layout";

export type ThemeContractTier = "core" | "advanced" | "derived";

export type ThemeContractToken = {
  name: string;
  group: ThemeContractGroup;
  tier: ThemeContractTier;

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

const chartColorTokens: ThemeContractToken[] = CHART_COLORS.map((color) =>
  token(`--chart-${color}`, "color", "derived", `Chart series color for the ${color} hue; area, line, bar, arc, and legend paint read it.`),
);

export const COLOR_RAMPS = ["neutral", "primary", ...BADGE_COLORS.filter((color) => color !== "neutral")] as const;

export const RAMP_STEP_COUNT = 12;

const rampSeedTokens: ThemeContractToken[] = COLOR_RAMPS.map((ramp) =>
  token(
    `--scale-${ramp}-seed`,
    "color",
    "derived",
    `Seed of the ${ramp} ramp; its hue and chroma drive --scale-${ramp}-1 to --scale-${ramp}-${RAMP_STEP_COUNT}.`,
  ),
);

export const THEME_CONTRACT: readonly ThemeContractToken[] = [
  token("--background", "color", "core", "Base surface color (panels, bubbles read it via bg-background)."),
  token("--foreground", "color", "core", "Default text color on --background."),
  token("--card", "color", "core", "Card surface; sits on --background in light, one ramp step above it in dark."),
  token("--card-foreground", "color", "core", "Text color on --card."),
  token("--popover", "color", "core", "Floating surface base (popover / menu / select / dialog)."),
  token("--popover-foreground", "color", "core", "Text color on --popover."),
  token("--primary", "color", "core", "THE brand color; primary action surfaces route through it."),
  token("--primary-foreground", "color", "core", "Text color on --primary."),
  token("--primary-text", "color", "derived", "Readable brand text color on base and card surfaces; --primary at ramp step 11."),
  token("--muted", "color", "core", "Subdued fill for quiet surfaces."),
  token("--muted-foreground", "color", "core", "Secondary / meta text color."),
  token("--secondary", "color", "core", "Secondary action fill (assistant bubble in chat skins)."),
  token("--secondary-foreground", "color", "core", "Text color on --secondary."),
  token("--accent", "color", "core", "Hover / selection highlight fill."),
  token("--accent-foreground", "color", "core", "Text color on --accent."),
  token("--destructive", "color", "core", "Destructive action color."),
  token("--destructive-foreground", "color", "core", "Text color on --destructive."),
  token(
    "--destructive-text",
    "color",
    "derived",
    "Readable destructive text color on base and card surfaces; --destructive at ramp step 11.",
  ),
  token("--success", "color", "advanced", "Success status color; defaults to --scale-green-9."),
  token("--warning", "color", "advanced", "Warning status color; defaults to --scale-yellow-9."),
  token("--info", "color", "advanced", "Info status color; defaults to --scale-blue-9."),
  token("--success-text", "color", "derived", "Readable success text color on base and card surfaces; --success at ramp step 11."),
  token("--warning-text", "color", "derived", "Readable warning text color on base and card surfaces; defaults to --scale-yellow-11."),
  token("--info-text", "color", "derived", "Readable informational text color on base and card surfaces; defaults to --scale-blue-11."),
  token("--border", "color", "core", "Hairline border color (carries --ring-opacity)."),
  token("--input", "color", "derived", "Form field border color; defaults to --control-rim."),
  token(
    "--ring",
    "color",
    "core",
    "Ring palette color; --focus-ring derives from it at 70% alpha, so a skin whose ring loses 3:1 there (a saturated accent or a softened halo) must set --focus-ring.",
  ),
  token(
    "--focus-ring",
    "color",
    "derived",
    "Color of the keyboard focus indicator; defaults to --ring at 70% alpha. Must clear 3:1 against every surface it lands on (WCAG 1.4.11).",
  ),
  token("--control-rim", "color", "derived", "Boundary color of a control's own edge; defaults to --border."),
  token(
    "--control-boundary",
    "color",
    "derived",
    "Edge of a control that has no other outline (unchecked checkbox, radio, switch track); defaults to --foreground at 60% and must clear 3:1 on --background and --card (WCAG 1.4.11).",
  ),
  token(
    "--image-outline",
    "color",
    "derived",
    "Hairline inside images and media that separates them from any surface; 10% black in light, 10% white in dark.",
  ),
  token("--control-fill", "color", "derived", "Resting fill shared by fields and surface controls; defaults to --card at 72% alpha."),
  token("--hover-fill", "color", "derived", "Wash a row or control takes on hover; defaults to a 6% tint of --foreground."),
  token("--active-fill", "color", "derived", "Wash a selected or pressed row keeps; defaults to an 8% tint of --foreground."),
  token(
    "--canvas",
    "color",
    "core",
    "The page paper the scene/panels float on; same ramp step as --background by default, skins may drop it below.",
  ),
  token("--canvas-grid-dot", "color", "derived", "Dot color of canvas and flow grid backgrounds."),

  token("--ring-opacity", "color", "derived", "Alpha of the --border hairline; 0 = borderless, defaults to 1."),
  ...rampSeedTokens,
  token("--badge-fill-alpha", "color", "advanced", "Alpha of every tinted badge fill; defaults to 0.16."),
  token("--badge-border-alpha", "color", "advanced", "Alpha of every tinted badge border; defaults to 0.2."),
  token("--badge-hover-alpha", "color", "advanced", "Alpha a tinted badge fill reaches on hover; defaults to 0.24."),
  ...badgeColorTokens,
  ...chartColorTokens,
  token("--sidebar", "color", "derived", "Sidebar surface; defaults to --canvas."),
  token("--sidebar-foreground", "color", "derived", "Text on the sidebar surface; defaults to --foreground."),
  token("--sidebar-primary", "color", "derived", "Accent of the active sidebar item; defaults to --primary."),
  token("--sidebar-accent", "color", "derived", "Hover and active wash of sidebar items; defaults to --hover-fill."),
  token("--sidebar-accent-foreground", "color", "derived", "Text on a washed sidebar item; defaults to --foreground."),
  token("--sidebar-border", "color", "derived", "Edge between the sidebar and the page; defaults to --border."),

  token("--font-sans", "typography", "core", "Typeface for the whole UI."),
  token("--font-mono", "typography", "core", "Monospace face (code, kbd)."),
  token("--font-body", "typography", "derived", "Font ROLE for body/UI text; defaults to --font-sans."),
  token("--font-display", "typography", "derived", "Font ROLE for headings; defaults to --font-sans."),
  token("--text-micro", "typography", "derived", "10px rung — kbd, badge counters, dense numeric meta."),
  token("--text-caption", "typography", "derived", "11px rung — overlines, timestamps, group labels."),
  token("--text-label", "typography", "derived", "12px rung — form labels + small chrome."),
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
  token("--radius-field", "radius", "advanced", "User bubble corner; --radius × 2.2."),
  token(
    "--radius-composer",
    "radius",
    "derived",
    "Composer shell corner, concentric with the fitted control corner plus composer padding and rim.",
  ),
  token("--composer-padding", "layout", "derived", "Inset shared by the composer shell, toolbar controls, and nested corner geometry."),
  token("--radius-panel", "radius", "advanced", "Code / markdown panel corner; --radius × 2.6."),
  token("--radius-scene", "radius", "advanced", "Scene frame / large media corner; --radius × 2.8."),
  token("--corner-shape", "radius", "derived", "Progressive corner reshape (round | squircle | scoop | …); defaults to round."),
  token("--radius-popup-item", "radius", "advanced", "Select/menu row corner; derived from --radius-control."),
  token("--radius-popover", "radius", "derived", "Popup container corner, concentric with the fitted row corner."),

  token("--shadow-color", "shadow", "advanced", "Hue every shadow is tinted with."),
  token("--shadow-highlight", "shadow", "derived", "Inner top light painted along raised surfaces' top edge (carries its resting alpha)."),
  token("--shadow-size", "shadow", "advanced", "Global geometry multiplier: 0 = flat (the default), 1 = full depth."),
  token("--shadow-opacity", "shadow", "advanced", "Global alpha multiplier: 1 = default density, 0 = invisible."),
  token("--shadow-y", "shadow", "derived", "Vertical bias: 0 = centered, 1 = default bottom cast."),
  token("--shadow-control-multiplier", "shadow", "derived", "Elevation tier: controls; defaults to 1."),
  token("--shadow-panel-multiplier", "shadow", "derived", "Elevation tier: panels; defaults to 2."),
  token("--shadow-popover-multiplier", "shadow", "derived", "Elevation tier: floating popovers; defaults to 4."),
  token("--shadow-modal-multiplier", "shadow", "derived", "Elevation tier: dialogs and sheets; defaults to 5."),
  token("--shadow-ambient-multiplier", "shadow", "derived", "Elevation tier: ambient scene lift; defaults to 8."),

  token("--ease-standard", "motion", "advanced", "Default easing curve for color/text transitions."),
  token("--ease-emphasized", "motion", "advanced", "Emphasized curve for entrances and larger moves."),
  token("--duration-fast", "motion", "core", "Fast tempo for press feedback and small state transitions; frequent hover paint is instant."),
  token("--duration-base", "motion", "core", "Base tempo (menus, indicators)."),
  token("--duration-slow", "motion", "core", "Slow tempo (panel/message entrances)."),
  token("--duration-loop", "motion", "derived", "Period of one loader turn; essential loaders keep it under reduced motion."),

  token("--popover-opacity", "surface", "advanced", "Floating-surface translucency; <1 + blur = frosted glass."),
  token("--backdrop-blur-popover", "surface", "advanced", "Backdrop blur behind floating surfaces."),
  token("--overlay-opacity", "surface", "advanced", "Modal overlay (dialog backdrop) dim strength."),
  token("--backdrop-blur-overlay", "surface", "advanced", "Backdrop blur of the modal overlay."),
  token("--scroll-fade-size", "surface", "advanced", "Edge-fade depth of scrollable surfaces; 0 = hard edges."),
  token("--disabled-opacity", "surface", "derived", "Opacity of a disabled control; defaults to 0.45."),

  token("--popover-padding", "layout", "advanced", "Gap between popup container edge and rows (drives concentric corners)."),
  token("--padding-x", "layout", "advanced", "Horizontal content density of rounded surfaces (bubble, composer)."),
  token("--padding-y", "layout", "advanced", "Vertical content density of rounded surfaces."),
  token("--control-h", "layout", "advanced", "THE base control height (md); the ramp derives from it."),
  token("--control-h-xs", "layout", "derived", "Derived control height: xs (×0.78, px-snapped)."),
  token("--control-h-sm", "layout", "derived", "Derived control height: sm (×0.89, px-snapped)."),
  token("--control-h-md", "layout", "derived", "Derived control height: md (= --control-h)."),
  token("--control-h-lg", "layout", "derived", "Derived control height: lg (×1.11, px-snapped)."),
  token("--sidebar-width", "layout", "advanced", "Expanded sidebar width; a dragged width overrides it inline."),
  token("--sidebar-width-icon", "layout", "advanced", "Collapsed icon-rail sidebar width."),
  token("--z-overlay", "layout", "advanced", "Stacking level of modal backdrops."),
  token("--z-modal", "layout", "advanced", "Stacking level of dialogs and sheets."),
  token("--z-popup", "layout", "advanced", "Stacking level of menus, popovers, and selects."),
  token("--z-tooltip", "layout", "advanced", "Stacking level of tooltips."),
  token("--z-toast", "layout", "advanced", "Stacking level of toasts."),
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
    "Gap between a control edge and its focus ring; negative draws it inside. Bordered fields ignore it and paint the indicator over their border.",
  ),
  token("--control-rim-width", "layout", "derived", "Thickness of a control's own edge; defaults to 1px, shared across modes."),
  token("--touch-target", "layout", "derived", "Minimum hit area of a control under a coarse pointer (WCAG 2.5.5); defaults to 44px."),
  token("--target-min", "layout", "derived", "Minimum hit area of a small control under a fine pointer (WCAG 2.5.8); defaults to 24px."),
  token(
    "--text-input-min",
    "layout",
    "derived",
    "Smallest text-input font size under a coarse pointer, so iOS never zooms on focus; defaults to 16px.",
  ),
];

export const THEME_CONTRACT_NAMES: ReadonlySet<string> = new Set(THEME_CONTRACT.map((entry) => entry.name));

export const REQUIRED_THEME_CONTRACT: readonly ThemeContractToken[] = THEME_CONTRACT.filter((entry) => entry.tier === "core");
export const REQUIRED_THEME_CONTRACT_NAMES: ReadonlySet<string> = new Set(REQUIRED_THEME_CONTRACT.map((entry) => entry.name));
