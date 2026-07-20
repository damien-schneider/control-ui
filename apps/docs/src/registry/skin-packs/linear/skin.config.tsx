import type { ButtonTone, ButtonVariant } from "@/components/control-ui/contracts";
import type { ControlUiSkin } from "@/components/control-ui/skin";

/*
 * ADVANCED skin: tokens (theme.css) + body type rendering & Tabs knobs (skin.css) + these per-slot
 * classes. The Linear through-line: hairlines carry structure, indigo carries intent, and only
 * floating surfaces are allowed elevation. Filled + bordered actions are pills; every other control
 * keeps the 6px control corner. No "use client" — the config stays RSC-pure.
 */

// Brand focus: the ring token IS the indigo, offset from the surface behind it.
const focus = "focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-background";
// Linear controls change color, never size — `active:scale-100` evicts the recipe's press-shrink.
// shadow-(--x) not shadow-[var(--x)]: tailwind-merge reads the bracket form as a shadow COLOR and would keep the recipe's box-shadow beside it.
const controlMotion =
  "transition-[background-color,border-color,box-shadow,color] duration-[var(--duration-fast)] ease-[var(--ease-standard)] active:scale-100";

// The pill: filled and bordered ACTIONS only (dialog footers, submit, CTAs).
const solid = `rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] shadow-(--linear-control-shadow) hover:bg-[var(--linear-primary-hover)] active:bg-[var(--linear-primary-active)] ${controlMotion} ${focus}`;
const danger = `rounded-full bg-[var(--destructive)] text-[var(--destructive-foreground)] shadow-(--linear-control-shadow) hover:brightness-105 active:brightness-95 ${controlMotion} ${focus}`;
// `surface` keeps the recipe's inset ring (and its data-[active] brand tint); only the fill is re-painted.
const surfaceControl = `rounded-full bg-[var(--linear-control-bg)] shadow-(--linear-control-shadow) hover:bg-[var(--linear-control-hover)] active:bg-[var(--linear-control-active)] ${controlMotion} ${focus}`;
// Icon buttons, toolbar chrome, menu triggers: 6px corner, row-fill hover, no ring and no elevation.
// `ring-0`/`bg-transparent` matter on the shared control chrome (menu + select triggers), not on Button's own ghost variant.
const ghost = `rounded-[var(--radius-control)] bg-transparent shadow-none ring-0 hover:bg-[var(--linear-row-hover)] ${controlMotion} ${focus}`;
const quiet = `${ghost} text-muted-foreground hover:text-foreground data-[active=true]:bg-[var(--linear-row-active)] data-[active=true]:text-foreground`;

function button(variant: ButtonVariant, tone: ButtonTone) {
  if (tone === "danger") return danger;
  if (variant === "solid") return solid;
  if (variant === "surface") return surfaceControl;
  if (variant === "ghost") return ghost;
  return quiet;
}

// Fields are outlines, not fills: transparent body, --input hairline, brand border once focused.
const field =
  "rounded-[var(--radius-control)] border-[var(--input)] bg-transparent shadow-none transition-[border-color,box-shadow] duration-[var(--duration-fast)] focus-visible:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]/25";
// Select/menu triggers wear the same outline, but their recipe draws the edge with an inset ring, not a border.
const ringField = `rounded-[var(--radius-control)] bg-transparent shadow-none ring-1 ring-inset ring-[var(--input)] hover:bg-[var(--linear-row-hover)] ${controlMotion} ${focus}`;

// Floating surfaces: the one place elevation is spent. Concentric geometry stays the recipe's.
const popupSurface = "border-border bg-popover shadow-(--linear-menu-shadow)";
const row =
  "rounded-[var(--radius-popup-item)] px-2 py-1 text-label data-[highlighted]:bg-[var(--linear-row-hover)] data-[disabled]:opacity-40";
const menuLabel = "px-2 py-1 text-caption font-medium normal-case tracking-normal text-muted-foreground";
const separator = "mx-0 my-1 bg-border";
// Modals float hardest and drop their edge in light mode (the shadow IS the boundary); dark keeps a rim.
const modal = "rounded-[var(--radius-panel)] border-transparent bg-popover shadow-(--linear-modal-shadow) dark:border-border";

// Panels are held by a hairline, never by a lift. Recipes draw their edge with either `border` or an
// inset ring, so these only re-color the ring and flatten the shadow — the widths stay the recipe's.
const panel = "rounded-[var(--radius-panel)] bg-card shadow-none ring-border";
const panelHeader = "border-b border-border bg-transparent";
// The one 1px lift in the shell: enough to detach the white sheet from the canvas.
const sheet = "rounded-[var(--radius-panel)] border-border bg-card shadow-(--linear-panel-shadow)";

// Nav rows and tree rows share ONE chrome. Every background sits on a modifier chain that
// SELECTION_INDICATOR_BG_RESET restates, so an app opting into indicator="slide" evicts them cleanly.
const navRow =
  "rounded-[var(--radius-control)] font-medium text-muted-foreground hover:bg-[var(--linear-row-hover)] hover:text-foreground active:bg-[var(--linear-row-active)] data-[active=true]:bg-[var(--linear-row-active)] data-[active=true]:text-foreground data-[state=open]:hover:bg-[var(--linear-row-active)]";
const treeRow =
  "rounded-[var(--radius-control)] text-muted-foreground hover:bg-[var(--linear-row-hover)] hover:text-foreground data-[selected]:bg-[var(--linear-row-active)] data-[selected]:font-medium data-[selected]:text-foreground";

export const skin: ControlUiSkin = {
  id: "linear",
  // Linear's rail is narrower than shadcn's 16rem default and never draws a surface of its own.
  sidebarWidth: "15rem",
  families: {
    popup: {
      surface: popupSurface,
      "list-surface": popupSurface,
      item: row,
      label: menuLabel,
      separator,
      shortcut: "ml-auto text-caption tracking-normal text-muted-foreground",
    },
  },
  slots: {
    button: {
      root: ({ variant, tone }) => button(variant, tone),
      content: "gap-1.5",
    },
    select: {
      trigger: ringField,
    },
    "dropdown-menu": {
      trigger: ghost,
    },
    menubar: {
      trigger: ghost,
    },
    combobox: {
      trigger: ghost,
      input: field,
    },
    input: {
      root: field,
    },
    "input-group": {
      root: field,
    },
    textarea: {
      root: field,
    },
    "native-select": {
      root: field,
    },
    autocomplete: {
      input: field,
    },
    "number-field": {
      group: field,
    },
    "input-otp": {
      slot: field,
    },
    checkbox: {
      root: "rounded-[max(3px,calc(var(--radius-control)*0.5))] border-[var(--input)]",
    },
    "radio-group": {
      item: "border-[var(--input)]",
    },
    slider: {
      thumb: "rounded-full border-border bg-card shadow-(--linear-control-shadow)",
      indicator: "bg-[var(--primary)]",
    },
    progress: {
      indicator: "bg-[var(--primary)]",
    },
    meter: {
      indicator: "bg-[var(--primary)]",
    },
    "context-menu": {
      "sub-trigger": "data-[popup-open]:bg-[var(--linear-row-hover)]",
    },
    "navigation-menu": {
      viewport: popupSurface,
    },
    "thread-rail": {
      popover: popupSurface,
      item: "rounded-full bg-[var(--linear-row-active)]",
    },
    toast: {
      root: popupSurface,
    },
    command: {
      root: `${popupSurface} overflow-hidden`,
      "input-wrapper": "border-b border-border",
      item: `${row} data-[selected=true]:bg-[var(--linear-row-hover)]`,
      shortcut: "ml-auto text-caption text-muted-foreground",
    },
    dialog: {
      content: modal,
      title: "text-body-lg font-semibold tracking-[-0.01em]",
      description: "text-body text-muted-foreground",
    },
    "alert-dialog": {
      content: modal,
      title: "text-body-lg font-semibold tracking-[-0.01em]",
      description: "text-body text-muted-foreground",
    },
    sheet: {
      content: "border-border bg-popover shadow-(--linear-modal-shadow)",
    },
    sidebar: {
      inner: "border-0 bg-transparent",
      "menu-button": navRow,
      "group-label": "px-2 text-caption font-medium text-muted-foreground",
    },
    "sidebar-layout": {
      content: sheet,
    },
    tree: {
      root: "text-label",
      "item-trigger": treeRow,
    },
    tabs: {
      tab: "font-medium",
    },
    "table-of-contents": {
      item: "text-label",
    },
    card: {
      root: "rounded-[var(--radius-panel)] bg-card shadow-none",
    },
    alert: {
      root: "rounded-[var(--radius-panel)] bg-card shadow-none",
    },
    item: {
      root: `rounded-[var(--radius-control)] hover:bg-[var(--linear-row-hover)] ${controlMotion}`,
    },
    empty: {
      root: "rounded-[var(--radius-panel)] border border-dashed border-border bg-transparent",
    },
    badge: {
      root: "rounded-full font-medium",
    },
    kbd: {
      root: "rounded-[calc(var(--radius-control)*0.67)] bg-transparent text-muted-foreground shadow-none ring-border",
    },
    "scroll-area": {
      thumb: "rounded-full bg-foreground/20",
    },
    "chat-layout": {
      root: "rounded-[var(--radius-scene)] border-border bg-card shadow-(--linear-panel-shadow)",
    },
    activity: {
      root: ({ kind }) => (kind === "tool" ? "rounded-[var(--radius-panel)] bg-card shadow-none" : undefined),
      trigger: ({ kind }) => (kind === "tool" ? "rounded-[var(--radius-panel)]" : undefined),
    },
    "chat-message": {
      content: ({ role }) =>
        role === "user"
          ? "rounded-[var(--radius-field)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-none"
          : "rounded-[var(--radius-field)] bg-transparent",
      avatar: "rounded-full border-border bg-[var(--linear-control-bg)]",
    },
    "chat-composer": {
      shell: "rounded-[var(--radius-field)] border-border bg-card shadow-(--linear-panel-shadow) ring-0",
      submit: solid,
      mention: "rounded-[var(--radius-control)] border-border bg-[var(--linear-row-hover)]",
    },
    "markdown-block": {
      root: "rounded-[var(--radius-panel)] bg-card shadow-none ring-0",
      header: panelHeader,
    },
    code: {
      root: panel,
      header: panelHeader,
      title: "font-mono text-caption text-muted-foreground",
    },
    "code-diff": {
      root: panel,
      header: panelHeader,
    },
    "inline-attachment": {
      root: panel,
      image: "rounded-[var(--radius-control)]",
    },
  },
};
