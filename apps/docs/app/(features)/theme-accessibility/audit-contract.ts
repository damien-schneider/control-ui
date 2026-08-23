import { BADGE_COLORS } from "@/components/control-ui/ui/badge";
import { anatomyPairs } from "./anatomy-pairs";

export type ThemeAuditSeverity = "error" | "warning";
export type ThemeAuditCategory = "Text surfaces" | "Controls" | "Component states" | "Badges" | "Focus and boundaries" | "Rendered anatomy";

export type ThemeAuditNode = {
  attributes: Readonly<Record<string, string>>;
  /** Inline style the probe needs: geometry for a sizeless part, or the paint a consumer utility applies. */
  style?: string;
};

/**
 * Ancestor chain ending at the painted part. Earlier nodes carry the knob declarations the recipe
 * hangs off a family root; the last node is the part whose RENDERED paint the audit samples. Without
 * it a probe sits outside every family, so recipe-owned knobs fall back to their inert initial value
 * and the measurement describes no shipped pixel.
 */
export type ThemeAuditAnatomy = readonly [ThemeAuditNode, ...ThemeAuditNode[]];

export type ThemeAuditPair = {
  id: string;
  category: ThemeAuditCategory;
  label: string;
  foreground: string;
  background: string;
  surface: string;
  backgroundPaint?: string;
  surfacePaint?: string;
  underlays?: readonly string[];
  dependencies?: readonly string[];
  foregroundAnatomy?: ThemeAuditAnatomy;
  backgroundAnatomy?: ThemeAuditAnatomy;
  surfaceAnatomy?: ThemeAuditAnatomy;
  /** Sample the part's outline instead of its text color (focus indicators paint no glyph). */
  measure?: "text" | "outline";
  threshold: 3 | 4.5;
  severity: ThemeAuditSeverity;
};

export type ThemeAuditStatus = "pass" | "fail" | "unresolved";

export type ThemeAuditResult = ThemeAuditPair & {
  ratio: number | null;
  status: ThemeAuditStatus;
  resolvedForeground: string | null;
  resolvedBackground: string | null;
};

const textPair = (id: string, label: string, foreground: string, background: string, surface: string = "--background"): ThemeAuditPair => ({
  id,
  category: "Text surfaces",
  label,
  foreground,
  background,
  surface,
  threshold: 4.5,
  severity: "error",
});

const controlPairs = ["primary", "secondary", "accent", "destructive"].flatMap((tone) =>
  ["background", "card"].map(
    (surface): ThemeAuditPair => ({
      id: `${tone}-control-on-${surface}`,
      category: "Controls",
      label: `${tone[0].toUpperCase()}${tone.slice(1)} control on ${surface}`,
      foreground: `--${tone}-foreground`,
      background: `--${tone}`,
      surface: `--${surface}`,
      threshold: 4.5,
      severity: "error",
    }),
  ),
);

// Skins re-value the badge knobs wholesale, so the resting badge is measured on a rendered one rather than on its tokens.
const filledBadge = (color: string): ThemeAuditAnatomy => [
  { attributes: { "data-control-family": "badge", "data-slot": "root", "data-variant": "default", "data-color": color } },
];

const badgeFilledPairs = BADGE_COLORS.flatMap((color) =>
  ["background", "card"].flatMap((surface): ThemeAuditPair[] => [
    {
      id: `badge-${color}-filled-base-on-${surface}`,
      category: "Badges",
      label: `${color[0].toUpperCase()}${color.slice(1)} filled badge base on ${surface}`,
      foreground: "--cui-badge-foreground",
      background: "--cui-badge-background",
      backgroundAnatomy: filledBadge(color),
      surface: `--${surface}`,
      dependencies: [`--badge-${color}`, `--badge-${color}-foreground`],
      threshold: 4.5,
      severity: "error",
    },
    {
      id: `badge-${color}-filled-hover-on-${surface}`,
      category: "Badges",
      label: `${color[0].toUpperCase()}${color.slice(1)} filled badge hover on ${surface}`,
      foreground: `--badge-${color}-foreground`,
      background: `--badge-${color}-hover`,
      surface: `--${surface}`,
      threshold: 4.5,
      severity: "error",
    },
  ]),
);

const badgeOutlinePairs = BADGE_COLORS.flatMap((color) =>
  ["background", "card"].flatMap((surface) => {
    const surfaceToken = `--${surface}`;
    return [
      {
        id: `badge-${color}-outline-text-on-${surface}`,
        category: "Badges",
        label: `${color[0].toUpperCase()}${color.slice(1)} outline badge text on ${surface}`,
        foreground: `--badge-${color}-foreground`,
        background: surfaceToken,
        surface: surface === "card" ? "--background" : "--canvas",
        threshold: 4.5,
        severity: "error",
      },
      {
        id: `badge-${color}-outline-border-on-${surface}`,
        category: "Focus and boundaries",
        label: `${color[0].toUpperCase()}${color.slice(1)} outline badge border on ${surface}`,
        foreground: `--badge-${color}-border`,
        background: surfaceToken,
        surface: surface === "card" ? "--background" : "--canvas",
        threshold: 3,
        severity: "warning",
      },
    ] satisfies ThemeAuditPair[];
  }),
);

const popoverPaint = "oklch(from var(--popover) l c h / var(--popover-opacity))";

/** A consumer utility paints this text, so the probe carries the utility's own declaration. */
const mutedText: ThemeAuditAnatomy = [{ attributes: {}, style: "color: var(--muted-foreground)" }];

const popupSurface: ThemeAuditAnatomy = [
  { attributes: { "data-control-family": "popup", "data-popup-part": "surface", "data-slot": "content", "data-surface": "floating" } },
];
// A skin may paint a solid button with a gradient, so the label is measured against the button's own paint.
const solidButton = (tone: string): ThemeAuditAnatomy => [
  {
    attributes: {
      "data-control-ui": "button",
      "data-control-family": "button",
      "data-slot": "root",
      "data-control": "true",
      "data-variant": "solid",
      "data-tone": tone,
      "data-size": "md",
    },
  },
];

// A tooltip inverts the popup pair, so a skin that re-paints every popup surface has to re-paint this text with it.
const tooltipSurface: ThemeAuditAnatomy = [
  {
    attributes: {
      "data-control-ui": "tooltip",
      "data-control-family": "popup",
      "data-popup-kind": "tooltip",
      "data-popup-part": "surface",
      "data-slot": "content",
      "data-surface": "floating",
    },
  },
];
const popupItem: ThemeAuditAnatomy = [{ attributes: { "data-control-family": "popup", "data-popup-part": "item" } }];
const highlightedPopupItem: ThemeAuditAnatomy = [
  { attributes: { "data-control-family": "popup", "data-popup-part": "item", "data-highlighted": "" } },
];

const popupPairs = ["background", "card"].flatMap((surface): ThemeAuditPair[] => [
  {
    id: `popup-item-on-${surface}`,
    category: "Component states",
    label: `Popup item on ${surface}`,
    foreground: "--cui-popup-item-foreground",
    foregroundAnatomy: popupItem,
    background: "--popover",
    backgroundAnatomy: popupSurface,
    surface: `--${surface}`,
    dependencies: ["--popover-opacity"],
    threshold: 4.5,
    severity: "error",
  },
  {
    id: `popup-item-highlighted-on-${surface}`,
    category: "Component states",
    label: `Highlighted popup item on ${surface}`,
    foreground: "--cui-popup-item-highlight-foreground",
    background: "--cui-popup-item-highlight-background",
    backgroundAnatomy: highlightedPopupItem,
    surface: "--popover",
    surfaceAnatomy: popupSurface,
    underlays: [`--${surface}`],
    dependencies: ["--popover-opacity"],
    threshold: 4.5,
    severity: "error",
  },
  {
    id: `popup-item-highlighted-secondary-on-${surface}`,
    category: "Component states",
    label: `Highlighted popup item secondary text on ${surface}`,
    foreground: "--muted-foreground",
    foregroundAnatomy: mutedText,
    background: "--cui-popup-item-highlight-background",
    backgroundAnatomy: highlightedPopupItem,
    surface: "--popover",
    surfaceAnatomy: popupSurface,
    underlays: [`--${surface}`],
    dependencies: ["--popover-opacity"],
    threshold: 4.5,
    severity: "error",
  },
]);

// The indicator is a sibling painted BEHIND the tab; nesting the glyph inside it reproduces the stack.
const tabsList: ThemeAuditAnatomy = [
  { attributes: { "data-control-family": "tabs", "data-slot": "root" } },
  { attributes: { "data-control-family": "tabs", "data-slot": "list", "data-size": "sm" }, style: "--_tabs-trigger-h:32px" },
];
const tabsIndicator: ThemeAuditAnatomy = [
  { attributes: { "data-control-family": "tabs", "data-slot": "indicator" }, style: "position:static;width:96px;transform:none" },
];
const activeTab: ThemeAuditAnatomy = [
  { attributes: { "data-control-family": "tabs", "data-slot": "tab", "aria-selected": "true", "data-active": "" } },
];

const activeTabPairs = ["background", "card"].map(
  (surface): ThemeAuditPair => ({
    id: `active-tab-on-${surface}`,
    category: "Component states",
    label: `Active tab on ${surface}`,
    foreground: "--cui-tabs-active-foreground",
    foregroundAnatomy: activeTab,
    background: "--cui-tabs-indicator-background",
    backgroundAnatomy: tabsIndicator,
    surface: "--cui-tabs-list-background",
    surfaceAnatomy: tabsList,
    underlays: [`--${surface}`],
    threshold: 4.5,
    severity: "error",
  }),
);

// A skin may paint the sidebar backdrop on the wrapper and leave the inner transparent, so both layers show up here.
const sidebarSurface: ThemeAuditAnatomy = [
  { attributes: { "data-control-family": "sidebar", "data-slot": "wrapper" } },
  { attributes: { "data-control-family": "sidebar", "data-slot": "root" } },
  { attributes: { "data-control-family": "sidebar", "data-slot": "inner" } },
];
const slidingIndicator: ThemeAuditAnatomy = [{ attributes: { "data-control-family": "track-highlight", "data-slot": "root" } }];
const menuButton = (state: Readonly<Record<string, string>>): ThemeAuditAnatomy => [
  { attributes: { "data-control-family": "sidebar", "data-slot": "menu-button", ...state } },
];

// The indicator slides to the hovered row, so active text owes contrast on the bare sidebar too.
const sidebarPairs: readonly ThemeAuditPair[] = [
  {
    id: "sidebar-menu-button",
    category: "Component states",
    label: "Sidebar menu button on the sidebar surface",
    foreground: "--cui-sidebar-menu-button-foreground",
    foregroundAnatomy: menuButton({}),
    background: "--cui-sidebar-inner-background",
    backgroundAnatomy: sidebarSurface,
    surface: "--background",
    threshold: 4.5,
    severity: "error",
  },
  {
    id: "sidebar-menu-button-active",
    category: "Component states",
    label: "Active sidebar menu button on the sidebar surface",
    foreground: "--cui-sidebar-menu-button-active-foreground",
    foregroundAnatomy: menuButton({ "data-active": "" }),
    background: "--cui-sidebar-inner-background",
    backgroundAnatomy: sidebarSurface,
    surface: "--background",
    threshold: 4.5,
    severity: "error",
  },
  {
    id: "sidebar-muted-text",
    category: "Component states",
    label: "Muted text on the sidebar surface",
    foreground: "--muted-foreground",
    foregroundAnatomy: mutedText,
    background: "--cui-sidebar-inner-background",
    backgroundAnatomy: sidebarSurface,
    surface: "--background",
    threshold: 4.5,
    severity: "error",
  },
  {
    id: "sidebar-menu-button-active-on-indicator",
    category: "Component states",
    label: "Active sidebar menu button on the sliding indicator",
    foreground: "--cui-sidebar-menu-button-active-foreground",
    foregroundAnatomy: menuButton({ "data-active": "" }),
    background: "--cui-track-highlight-background",
    backgroundAnatomy: slidingIndicator,
    surface: "--cui-sidebar-inner-background",
    surfaceAnatomy: sidebarSurface,
    underlays: ["--background"],
    threshold: 4.5,
    severity: "error",
  },
];

const solidButtonPairs = ["primary", "danger"].flatMap((tone) =>
  ["background", "card"].map(
    (surface): ThemeAuditPair => ({
      id: `solid-${tone}-button-on-${surface}`,
      category: "Controls",
      label: `Solid ${tone} button label on ${surface}`,
      foreground: "--cui-button-foreground",
      background: "--cui-button-bg",
      backgroundAnatomy: solidButton(tone),
      surface: `--${surface}`,
      threshold: 4.5,
      severity: "error",
    }),
  ),
);

const tooltipPair: ThemeAuditPair = {
  id: "tooltip-text",
  category: "Component states",
  label: "Tooltip text on the tooltip surface",
  foreground: "--cui-popup-foreground",
  background: "--cui-popup-background",
  backgroundAnatomy: tooltipSurface,
  surface: "--background",
  threshold: 4.5,
  severity: "error",
};

// WCAG 1.4.11: the focus indicator is non-text content and owes 3:1 against what it lands on. It is
// measured on a really focused control, so a skin that blanks --focus-ring-width shows up here.
const focusedButton: ThemeAuditAnatomy = [
  {
    attributes: {
      "data-control-ui": "button",
      "data-control-family": "button",
      "data-slot": "root",
      "data-control": "true",
      "data-variant": "solid",
      "data-tone": "primary",
    },
    style: "width:48px;height:24px",
  },
];

const focusRingPairs = ["background", "card"].map(
  (surface): ThemeAuditPair => ({
    id: `focus-ring-on-${surface}`,
    category: "Focus and boundaries",
    label: `Focus indicator on ${surface}`,
    foreground: "--focus-ring",
    foregroundAnatomy: focusedButton,
    measure: "outline",
    background: `--${surface}`,
    surface: `--${surface}`,
    dependencies: ["--focus-ring-width", "--focus-ring-style", "--focus-ring-offset"],
    threshold: 3,
    severity: "error",
  }),
);

const boundaryPair = (id: string, label: string, foreground: string, background: string): ThemeAuditPair => ({
  id,
  category: "Focus and boundaries",
  label,
  foreground,
  background,
  surface: background,
  threshold: 3,
  severity: "warning",
});

export const THEME_AUDIT_PAIRS: readonly ThemeAuditPair[] = [
  textPair("body-on-background", "Body text on background", "--foreground", "--background"),
  textPair("body-on-canvas", "Body text on canvas", "--foreground", "--canvas"),
  textPair("card-text", "Card text", "--card-foreground", "--card"),
  {
    ...textPair("popover-text-on-background", "Popover text on background", "--popover-foreground", "--popover", "--background"),
    backgroundPaint: popoverPaint,
    dependencies: ["--popover-opacity"],
  },
  {
    ...textPair("popover-text-on-card", "Popover text on card", "--popover-foreground", "--popover", "--card"),
    backgroundPaint: popoverPaint,
    dependencies: ["--popover-opacity"],
  },
  textPair("muted-on-background", "Muted text on background", "--muted-foreground", "--background"),
  textPair("muted-on-card", "Muted text on card", "--muted-foreground", "--card"),
  ...["background", "card", "canvas"].map((surface) => ({
    ...textPair(
      `muted-on-popover-over-${surface}`,
      `Muted text on popover over ${surface}`,
      "--muted-foreground",
      "--cui-popup-background",
      `--${surface}`,
    ),
    foregroundAnatomy: mutedText,
    backgroundAnatomy: popupSurface,
    dependencies: ["--popover-opacity"],
  })),
  {
    ...textPair("muted-on-muted-over-background", "Muted text on muted fill over background", "--muted-foreground", "--muted"),
    surface: "--background",
  },
  {
    ...textPair("muted-on-muted-over-card", "Muted text on muted fill over card", "--muted-foreground", "--muted"),
    surface: "--card",
  },
  textPair("primary-text-on-background", "Primary semantic text on background", "--primary-text", "--background"),
  textPair("primary-text-on-card", "Primary semantic text on card", "--primary-text", "--card"),
  textPair("destructive-text-on-background", "Destructive text on background", "--destructive-text", "--background"),
  textPair("destructive-text-on-card", "Destructive text on card", "--destructive-text", "--card"),
  ...controlPairs,
  ...popupPairs,
  ...activeTabPairs,
  ...sidebarPairs,
  ...solidButtonPairs,
  tooltipPair,
  ...focusRingPairs,
  ...badgeFilledPairs,
  ...badgeOutlinePairs,
  boundaryPair("border-on-background", "Border on background", "--border", "--background"),
  boundaryPair("border-on-card", "Border on card", "--border", "--card"),
  boundaryPair("input-on-background", "Input boundary on background", "--input", "--background"),
  boundaryPair("input-on-card", "Input boundary on card", "--input", "--card"),
  boundaryPair("ring-on-background", "Focus ring on background", "--ring", "--background"),
  boundaryPair("ring-on-card", "Focus ring on card", "--ring", "--card"),
  ...anatomyPairs,
];

export const THEME_AUDIT_CATEGORIES: readonly ThemeAuditCategory[] = [
  "Text surfaces",
  "Controls",
  "Component states",
  "Badges",
  "Focus and boundaries",
  "Rendered anatomy",
];
