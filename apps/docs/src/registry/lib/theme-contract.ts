// THE skin token contract — canonical typed list of every custom property every skin pack must define; values live in each pack's theme.css, this is the machine-readable index of NAMES
// feeds docs token-reference page + theme-contract-coverage test, which requires complete light/dark resolution per skin while core owns only bindings and invariant mechanics
// name absent from this list is NOT contract: packs must not declare it in theme.css; skin.css must never redeclare a name that IS here

export type ThemeContractGroup = "color" | "typography" | "radius" | "shadow" | "motion" | "surface" | "layout";

/** core = what a skin typically re-values first; advanced = fine-tuning knobs and derived scales. */
export type ThemeContractTier = "core" | "advanced";

export type ThemeContractToken = {
  /** Custom-property name as declared in theme.css, e.g. "--primary". */
  name: string;
  group: ThemeContractGroup;
  tier: ThemeContractTier;
  /** One-liner for the docs token-reference page. */
  description: string;
};

function token(name: string, group: ThemeContractGroup, tier: ThemeContractTier, description: string): ThemeContractToken {
  return { name, group, tier, description };
}

/** The soft badge palette: each hue carries a background / foreground / border / hover quartet. */
export const BADGE_HUES = [
  "neutral",
  "slate",
  "gray",
  "zinc",
  "stone",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
] as const;

const badgeTokens: ThemeContractToken[] = BADGE_HUES.flatMap((hue) => [
  token(`--badge-${hue}`, "color", "advanced", `Soft ${hue} badge background.`),
  token(`--badge-${hue}-foreground`, "color", "advanced", `Text color on the ${hue} badge.`),
  token(`--badge-${hue}-border`, "color", "advanced", `Border of the outline ${hue} badge variant.`),
  token(`--badge-${hue}-hover`, "color", "advanced", `Hover background of ${hue} badge links/buttons.`),
]);

export const THEME_CONTRACT: readonly ThemeContractToken[] = [
  // ---- color — the shadcn base names + the page canvas ------------------------------------------
  token("--background", "color", "core", "Base surface color (panels, bubbles read it via bg-background)."),
  token("--foreground", "color", "core", "Default text color on --background."),
  token("--card", "color", "core", "Elevated card surface."),
  token("--card-foreground", "color", "core", "Text color on --card."),
  token("--popover", "color", "core", "Floating surface base (popover / menu / select / dialog)."),
  token("--popover-foreground", "color", "core", "Text color on --popover."),
  token("--primary", "color", "core", "THE brand color; primary action surfaces route through it."),
  token("--primary-foreground", "color", "core", "Text color on --primary."),
  token("--primary-text", "color", "core", "Readable brand text color on base and card surfaces."),
  token("--muted", "color", "core", "Subdued fill for quiet surfaces."),
  token("--muted-foreground", "color", "core", "Secondary / meta text color."),
  token("--secondary", "color", "core", "Secondary action fill (assistant bubble in chat skins)."),
  token("--secondary-foreground", "color", "core", "Text color on --secondary."),
  token("--accent", "color", "core", "Hover / selection highlight fill."),
  token("--accent-foreground", "color", "core", "Text color on --accent."),
  token("--destructive", "color", "core", "Destructive action color."),
  token("--destructive-foreground", "color", "core", "Text color on --destructive."),
  token("--destructive-text", "color", "core", "Readable destructive text color on base and card surfaces."),
  token("--border", "color", "core", "Hairline border color (carries --ring-opacity)."),
  token("--input", "color", "core", "Form field border color."),
  token("--ring", "color", "core", "Focus ring color."),
  token("--canvas", "color", "core", "The page paper the scene/panels float on — a level BELOW --background."),
  // color knobs
  token("--ring-opacity", "color", "advanced", "Alpha of the border/ring hairlines; 0 = borderless."),
  token("--popup-item-foreground", "color", "advanced", "Text color of popup (menu/select) rows."),
  token("--popup-item-icon-foreground", "color", "advanced", "Icon color inside popup rows."),
  token("--popup-item-highlight-background", "color", "advanced", "Hover/highlight fill of popup rows."),
  ...badgeTokens,

  // ---- typography — faces, roles, and the role-named type scale ---------------------------------
  token("--font-sans", "typography", "core", "Typeface for the whole UI."),
  token("--font-mono", "typography", "core", "Monospace face (code, kbd)."),
  token("--font-body", "typography", "advanced", "Font ROLE for body/UI text; defaults to --font-sans."),
  token("--font-display", "typography", "advanced", "Font ROLE for headings; defaults to --font-sans."),
  token("--text-micro", "typography", "advanced", "10px rung — kbd, badge counters, dense numeric meta."),
  token("--text-caption", "typography", "advanced", "11px rung — overlines, timestamps, group labels."),
  token("--text-label", "typography", "advanced", "12px rung — form labels + small chrome."),
  token("--text-body", "typography", "advanced", "14px rung — DEFAULT body & control text."),
  token("--text-body-lg", "typography", "advanced", "16px rung — emphasized / larger body."),
  token("--text-heading-4", "typography", "advanced", "Smallest heading rung (15px)."),
  token("--text-heading-4--line-height", "typography", "advanced", "Line-height paired onto text-heading-4."),
  token("--text-heading-4--font-weight", "typography", "advanced", "Weight paired onto text-heading-4."),
  token("--text-heading-3", "typography", "advanced", "Heading rung (18px)."),
  token("--text-heading-3--line-height", "typography", "advanced", "Line-height paired onto text-heading-3."),
  token("--text-heading-3--font-weight", "typography", "advanced", "Weight paired onto text-heading-3."),
  token("--text-heading-2", "typography", "advanced", "Heading rung (22px)."),
  token("--text-heading-2--line-height", "typography", "advanced", "Line-height paired onto text-heading-2."),
  token("--text-heading-2--font-weight", "typography", "advanced", "Weight paired onto text-heading-2."),
  token("--text-heading-1", "typography", "advanced", "Largest content heading (30px — in-page / markdown h1)."),
  token("--text-heading-1--line-height", "typography", "advanced", "Line-height paired onto text-heading-1."),
  token("--text-heading-1--font-weight", "typography", "advanced", "Weight paired onto text-heading-1."),
  token("--text-heading-1--letter-spacing", "typography", "advanced", "Tracking paired onto text-heading-1."),
  token("--text-display", "typography", "advanced", "Display rung above h1 (36px — page titles, heroes)."),
  token("--text-display--line-height", "typography", "advanced", "Line-height paired onto text-display."),
  token("--text-display--font-weight", "typography", "advanced", "Weight paired onto text-display."),
  token("--text-display--letter-spacing", "typography", "advanced", "Tracking paired onto text-display."),
  token("--text-meta", "typography", "advanced", "Legacy alias of --text-caption (11px)."),
  token("--text-title-sm", "typography", "advanced", "Legacy alias of --text-heading-4."),
  token("--text-title-sm--line-height", "typography", "advanced", "Line-height paired onto text-title-sm."),
  token("--text-title-sm--font-weight", "typography", "advanced", "Weight paired onto text-title-sm."),
  token("--text-title-md", "typography", "advanced", "Legacy alias of --text-heading-3."),
  token("--text-title-md--line-height", "typography", "advanced", "Line-height paired onto text-title-md."),
  token("--text-title-md--font-weight", "typography", "advanced", "Weight paired onto text-title-md."),
  token("--text-title-lg", "typography", "advanced", "Legacy alias of --text-heading-2."),
  token("--text-title-lg--line-height", "typography", "advanced", "Line-height paired onto text-title-lg."),
  token("--text-title-lg--font-weight", "typography", "advanced", "Weight paired onto text-title-lg."),

  // ---- radius — THE knob, its derived scale, and corner geometry --------------------------------
  token("--radius", "radius", "core", "THE single radius knob; the whole scale multiplies from it."),
  token("--radius-control", "radius", "advanced", "Shared control corner (button, trigger, field, chip); ×2 from --radius."),
  token("--radius-sm", "radius", "advanced", "Scale rung: --radius × 0.6."),
  token("--radius-md", "radius", "advanced", "Scale rung: --radius × 0.8."),
  token("--radius-lg", "radius", "advanced", "Scale rung: --radius × 1."),
  token("--radius-xl", "radius", "advanced", "Scale rung: --radius × 1.4."),
  token("--radius-2xl", "radius", "advanced", "Scale rung: --radius × 1.6."),
  token("--radius-field", "radius", "advanced", "User bubble / composer shell corner; --radius × 2.2."),
  token("--radius-panel", "radius", "advanced", "Code / markdown panel corner; --radius × 2.6."),
  token("--radius-scene", "radius", "advanced", "Scene frame / large media corner; --radius × 2.8."),
  token("--corner-shape", "radius", "advanced", "Progressive corner reshape (round | squircle | scoop | …)."),
  token("--corner-shape-control", "radius", "advanced", "Corner shape for controls; defaults to --corner-shape."),
  token("--corner-shape-popover", "radius", "advanced", "Corner shape for floating surfaces; defaults to --corner-shape."),
  token("--corner-shape-panel", "radius", "advanced", "Corner shape for panels; defaults to --corner-shape."),
  token("--corner-radius-fit", "radius", "advanced", "Fallback radius shrink where corner-shape: squircle is unsupported."),
  token("--radius-popup-item", "radius", "advanced", "Select/menu row corner; derived from --radius-control."),
  token("--radius-popup-item-fit", "radius", "advanced", "Row corner clamped to half the row height (browser render cap)."),
  token("--radius-popover", "radius", "advanced", "Popup container corner, concentric with the fitted row corner."),
  token("--nest-safe", "radius", "advanced", "Sub-pixel guard for rounded children inside clipped rounded containers."),
  token("--nest-corner-ratio", "radius", "advanced", "Corner-fit ratio (2 + √2) capping panel corners near inset controls."),

  // ---- shadow — one geometry, themed by global knobs + tier multipliers -------------------------
  token("--shadow-color", "shadow", "advanced", "Hue every shadow is tinted with."),
  token("--shadow-highlight", "shadow", "advanced", "Inner top light painted along raised surfaces' top edge (carries its resting alpha)."),
  token("--shadow-size", "shadow", "advanced", "Global geometry multiplier: 1 = default depth, 0 = flat."),
  token("--shadow-opacity", "shadow", "advanced", "Global alpha multiplier: 1 = default density, 0 = invisible."),
  token("--shadow-y", "shadow", "advanced", "Vertical bias: 0 = centered, 1 = default bottom cast."),
  token("--shadow-control-multiplier", "shadow", "advanced", "Elevation tier: controls."),
  token("--shadow-panel-multiplier", "shadow", "advanced", "Elevation tier: panels."),
  token("--shadow-popover-multiplier", "shadow", "advanced", "Elevation tier: floating popovers."),
  token("--shadow-modal-multiplier", "shadow", "advanced", "Elevation tier: dialogs and sheets."),
  token("--shadow-ambient-multiplier", "shadow", "advanced", "Elevation tier: ambient scene lift."),

  // ---- motion — curves and tempo ----------------------------------------------------------------
  token("--ease-standard", "motion", "advanced", "Default easing curve for color/text transitions."),
  token("--ease-emphasized", "motion", "advanced", "Emphasized curve for entrances and larger moves."),
  token("--duration-fast", "motion", "core", "Fast tempo (hover, color)."),
  token("--duration-base", "motion", "core", "Base tempo (menus, indicators)."),
  token("--duration-slow", "motion", "core", "Slow tempo (panel/message entrances)."),

  // ---- surface — translucency, overlays, scroll fades --------------------------------------------
  token("--popover-opacity", "surface", "advanced", "Floating-surface translucency; <1 + blur = frosted glass."),
  token("--backdrop-blur-popover", "surface", "advanced", "Backdrop blur behind floating surfaces."),
  token("--overlay-opacity", "surface", "advanced", "Modal overlay (dialog backdrop) dim strength."),
  token("--backdrop-blur-overlay", "surface", "advanced", "Backdrop blur of the modal overlay."),
  token("--scroll-fade-size", "surface", "advanced", "Edge-fade depth of scrollable surfaces; 0 = hard edges."),
  token("--popup-item-disabled-opacity", "surface", "advanced", "Opacity of disabled popup rows."),

  // ---- layout — density and the control ramp ------------------------------------------------------
  token("--popover-padding", "layout", "advanced", "Gap between popup container edge and rows (drives concentric corners)."),
  token("--padding-x", "layout", "advanced", "Horizontal content density of rounded surfaces (bubble, composer)."),
  token("--padding-y", "layout", "advanced", "Vertical content density of rounded surfaces."),
  token("--control-h", "layout", "advanced", "THE base control height (md); the ramp derives from it."),
  token("--control-h-xs", "layout", "advanced", "Derived control height: xs (×0.78, px-snapped)."),
  token("--control-h-sm", "layout", "advanced", "Derived control height: sm (×0.89, px-snapped)."),
  token("--control-h-md", "layout", "advanced", "Control height alias for the md base."),
  token("--control-h-lg", "layout", "advanced", "Derived control height: lg (×1.11, px-snapped)."),
];

/** Fast membership lookup for the guard tests and docs cross-links. */
export const THEME_CONTRACT_NAMES: ReadonlySet<string> = new Set(THEME_CONTRACT.map((entry) => entry.name));
