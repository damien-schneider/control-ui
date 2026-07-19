import { BADGE_COLORS } from "@/components/control-ui/contracts";

export type ThemeAuditSeverity = "error" | "warning";
export type ThemeAuditCategory = "Text surfaces" | "Controls" | "Component states" | "Badges" | "Focus and boundaries";
export type ThemeAuditProbe = "tabs-active";

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
  probe?: ThemeAuditProbe;
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

const badgeFilledPairs = BADGE_COLORS.flatMap((color) =>
  ["base", "hover"].flatMap((state) =>
    ["background", "card"].map(
      (surface): ThemeAuditPair => ({
        id: `badge-${color}-filled-${state}-on-${surface}`,
        category: "Badges",
        label: `${color[0].toUpperCase()}${color.slice(1)} filled badge ${state} on ${surface}`,
        foreground: `--badge-${color}-foreground`,
        background: state === "hover" ? `--badge-${color}-hover` : `--badge-${color}`,
        surface: `--${surface}`,
        threshold: 4.5,
        severity: "error",
      }),
    ),
  ),
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

const popupPairs = ["background", "card"].flatMap((surface): ThemeAuditPair[] => [
  {
    id: `popup-item-on-${surface}`,
    category: "Component states",
    label: `Popup item on ${surface}`,
    foreground: "--popup-item-foreground",
    background: "--popover",
    backgroundPaint: popoverPaint,
    surface: `--${surface}`,
    dependencies: ["--popover-opacity"],
    threshold: 4.5,
    severity: "error",
  },
  {
    id: `popup-item-highlighted-on-${surface}`,
    category: "Component states",
    label: `Highlighted popup item on ${surface}`,
    foreground: "--popup-item-foreground",
    background: "--popup-item-highlight-background",
    surface: "--popover",
    surfacePaint: popoverPaint,
    underlays: [`--${surface}`],
    dependencies: ["--popover-opacity"],
    threshold: 4.5,
    severity: "error",
  },
]);

const activeTabPairs = ["background", "card"].map(
  (surface): ThemeAuditPair => ({
    id: `active-tab-on-${surface}`,
    category: "Component states",
    label: `Active tab on ${surface}`,
    foreground: "--tabs-active-foreground",
    background: "--tabs-indicator-bg",
    surface: `--${surface}`,
    probe: "tabs-active",
    threshold: 4.5,
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
  ...badgeFilledPairs,
  ...badgeOutlinePairs,
  boundaryPair("border-on-background", "Border on background", "--border", "--background"),
  boundaryPair("border-on-card", "Border on card", "--border", "--card"),
  boundaryPair("input-on-background", "Input boundary on background", "--input", "--background"),
  boundaryPair("input-on-card", "Input boundary on card", "--input", "--card"),
  boundaryPair("ring-on-background", "Focus ring on background", "--ring", "--background"),
  boundaryPair("ring-on-card", "Focus ring on card", "--ring", "--card"),
];

export const THEME_AUDIT_CATEGORIES: readonly ThemeAuditCategory[] = [
  "Text surfaces",
  "Controls",
  "Component states",
  "Badges",
  "Focus and boundaries",
];
