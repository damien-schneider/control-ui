import type { ButtonTone, ButtonVariant } from "@/components/control-ui/contracts";
import { SendAurora } from "@/components/control-ui/extensions/send-aurora";
import type { ControlUiSkin } from "@/components/control-ui/skin";

const focus = "focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-background";
// press feel every cuicui control shares; rides skinSlot eviction since recipes paint transition/scale/shadow as utilities (skin.css [data-control] rule would silently lose)
// shadow-(--x) not shadow-[var(--x)]: tailwind-merge classes the var() arbitrary form as a shadow COLOR, would keep recipe's box-shadow beside it
const controlMotion =
  "transition-[background-color,border-color,box-shadow,transform] duration-[var(--duration-fast)] ease-[var(--ease-standard)] active:scale-[0.96]";
const control = `rounded-[var(--radius-control)] border border-[var(--cuicui-border)] bg-[var(--cuicui-control-bg)] text-foreground shadow-(--cuicui-control-shadow) ${controlMotion} hover:bg-[var(--cuicui-control-hover)] ${focus}`;
const solid = `cuicui-gradient-fill rounded-[var(--radius-control)] border border-transparent text-white shadow-(--cuicui-solid-shadow) ${controlMotion} ${focus}`;
const danger = `rounded-[var(--radius-control)] border border-transparent bg-[var(--destructive)] text-[var(--destructive-foreground)] shadow-(--cuicui-control-shadow) ${controlMotion} hover:brightness-105 ${focus}`;
const field = `rounded-[var(--radius-control)] border border-[var(--input)] bg-[var(--cuicui-field-bg)] text-foreground shadow-(--cuicui-control-shadow) ${focus}`;
const popup =
  "rounded-[var(--radius-popover)] border border-[var(--cuicui-border)] bg-popover/90 p-1 shadow-(--shadow-pop) backdrop-blur-[var(--backdrop-blur-popover)]";
const item =
  "rounded-[var(--radius-popup-item)] px-2.5 py-1 text-[13px] data-[highlighted]:bg-[var(--cuicui-control-bg)] data-[disabled]:opacity-45";
const label = "px-2 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground";
const separator = "mx-1 my-1 bg-[var(--cuicui-border)]";
const surface =
  "rounded-[var(--radius-panel)] border border-[var(--cuicui-border)] bg-[var(--cuicui-surface-bg)] shadow-(--shadow-soft) backdrop-blur-[var(--backdrop-blur-popover)]";
const flatSurface = "rounded-[var(--radius-panel)] border border-[var(--cuicui-border)] bg-[var(--cuicui-surface-bg)]";
const shellItem =
  "rounded-[var(--radius)] border border-transparent px-3 font-medium text-sm text-black/40 hover:bg-black/5 hover:text-black/70 dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-white/70 data-[active=true]:bg-black/5 data-[active=true]:text-black/70 dark:data-[active=true]:bg-white/10 dark:data-[active=true]:text-white/80";

function button(variant: ButtonVariant, tone: ButtonTone) {
  if (tone === "danger") return danger;
  if (variant === "solid") return solid;
  return control;
}

export const skin: ControlUiSkin = {
  id: "cuicui",
  sidebarLayout: "sidebar",
  sidebarWidth: "20rem",
  adornments: {
    "chat-input": {
      "send-layer": (ctx) => (
        <SendAurora
          sendCount={ctx.sendCount}
          colors={["var(--cuicui-pink)", "var(--cuicui-orange)", "var(--cuicui-yellow)", "var(--cuicui-sky)", "var(--cuicui-blue)"]}
        />
      ),
    },
  },
  slots: {
    button: {
      root: ({ variant, tone }) => button(variant, tone),
      content: "gap-1.5",
    },
    select: {
      content: popup,
      trigger: control,
      item: item,
    },
    menu: {
      trigger: control,
      content: popup,
      item: item,
      separator: separator,
      label: label,
    },
    "context-menu": {
      content: popup,
      "sub-content": popup,
      item: item,
      "checkbox-item": item,
      "radio-item": item,
      "sub-trigger": `${item} data-[popup-open]:bg-[var(--cuicui-control-bg)]`,
      separator: separator,
      label: label,
      shortcut: "ml-auto text-[11px] tracking-wide text-muted-foreground",
    },
    menubar: {
      trigger: control,
      content: popup,
      "sub-content": popup,
      item: item,
      separator: separator,
      label: label,
    },
    input: {
      root: field,
    },
    "input-group": {
      root: field,
    },
    "native-select": {
      root: field,
    },
    textarea: {
      root: field,
    },
    combobox: {
      input: field,
      content: popup,
    },
    autocomplete: {
      input: field,
      content: popup,
    },
    "number-field": {
      group: field,
    },
    "color-picker": {
      content: `${popup} p-3`,
      panel: `${popup} p-3`,
    },
    "navigation-menu": {
      viewport: popup,
    },
    command: {
      root: `${popup} overflow-hidden`,
      "input-wrapper": "border-b border-[var(--cuicui-border)]",
      item: `${item} data-[selected=true]:bg-[var(--cuicui-control-bg)]`,
    },
    "trigger-menu": {
      root: popup,
      item: item,
      "group-label": label,
    },
    dialog: {
      content: `${surface} p-6`,
      title: "text-[15px] font-semibold tracking-[-0.01em]",
      description: "text-body text-muted-foreground",
    },
    "alert-dialog": {
      content: `${surface} p-6`,
    },
    sheet: {
      content: surface,
    },
    toast: {
      root: flatSurface,
    },
    popover: {
      content: popup,
    },
    "hover-card": {
      content: popup,
    },
    tooltip: {
      content:
        "rounded-[var(--radius-control)] border border-[var(--cuicui-border)] bg-popover px-2.5 py-1.5 text-[12px] shadow-(--shadow-pop)",
    },
    sidebar: {
      wrapper:
        "relative isolate bg-[var(--cuicui-page-from)] bg-[image:var(--cuicui-page-bg)] has-data-[variant=inset]:bg-[var(--cuicui-page-from)]",
      inset: "bg-[var(--cuicui-page-from)] bg-[image:var(--cuicui-page-bg)]",
      inner: "bg-transparent border-0 rounded-none p-3 shadow-none backdrop-blur-none text-sidebar-foreground",
      "menu-button": shellItem,
      "group-label": "px-3 py-1 text-xs font-medium tracking-tight text-neutral-500 dark:text-neutral-400",
    },
    "sidebar-layout": {
      content:
        "rounded-[var(--radius)] border border-[var(--cuicui-container-border)] bg-[var(--cuicui-main-container)] shadow-none backdrop-blur-none lg:mr-6 lg:mb-6",
    },
    tabs: {
      list: "rounded-[var(--radius-control)] bg-[var(--cuicui-control-bg)] p-1",
      tab: "rounded-[calc(var(--radius-control)*0.78)] font-medium data-[active]:text-white",
      indicator: "rounded-[calc(var(--radius-control)*0.78)]",
    },
    card: {
      root: surface,
    },
    alert: {
      root: flatSurface,
    },
    badge: {
      root: "rounded-full border border-[var(--cuicui-border)] bg-[var(--cuicui-control-bg)] px-2.5 py-0.5 font-medium text-muted-foreground",
    },
    item: {
      root: "rounded-[var(--radius-control)] border border-transparent hover:border-[var(--cuicui-border)] hover:bg-[var(--cuicui-control-bg)]",
    },
    empty: {
      root: "rounded-[var(--radius-panel)] border border-dashed border-[var(--cuicui-border)] bg-[var(--cuicui-surface-bg)]",
      media: "rounded-[var(--radius-control)] bg-[var(--cuicui-gradient-soft)]",
    },
    slider: {
      track: "rounded-full bg-[var(--cuicui-control-bg)]",
      indicator: "rounded-full bg-[var(--primary)]",
      thumb: `${control} shadow-(--shadow-sm)`,
    },
    switch: {
      root: "bg-[var(--cuicui-control-bg)] data-[checked]:bg-[var(--primary)]",
    },
    checkbox: {
      root: "rounded-[calc(var(--radius-control)*0.55)] border-[var(--cuicui-border)] data-[checked]:bg-[var(--primary)] data-[checked]:text-primary-foreground",
    },
    "radio-group": {
      item: "border-[var(--cuicui-border)] data-[checked]:border-[var(--primary)]",
    },
    "chat-scene": {
      root: surface,
    },
    activity: {
      root: ({ kind }) => (kind === "tool" ? surface : undefined),
      trigger: ({ kind }) => (kind === "tool" ? "bg-[var(--cuicui-control-bg)]" : undefined),
      status: ({ kind }) => (kind === "tool" ? "cuicui-gradient-text font-medium" : undefined),
    },
    "chat-message": {
      avatar: "rounded-full border border-[var(--cuicui-border)] bg-[var(--cuicui-control-bg)]",
      content: ({ role }) =>
        role === "user"
          ? "cuicui-gradient-fill rounded-[var(--radius-field)] text-white shadow-(--shadow-sm)"
          : "rounded-[var(--radius-field)] bg-transparent",
    },
    "chat-input": {
      shell: `${field} rounded-[var(--radius-field)]`,
      submit: solid,
      mention: "rounded-full border border-[var(--cuicui-border)] bg-[var(--cuicui-control-bg)]",
    },
    "markdown-block": {
      root: surface,
      header: "border-b border-[var(--cuicui-border)] bg-[var(--cuicui-control-bg)]",
      title: "font-semibold tracking-[-0.01em]",
    },
    markdown: {
      root: "text-foreground",
    },
    code: {
      root: surface,
      header: "border-b border-[var(--cuicui-border)] bg-[var(--cuicui-control-bg)]",
      title: "font-mono text-[12px] text-muted-foreground",
    },
    "code-diff": {
      root: surface,
      header: "border-b border-[var(--cuicui-border)] bg-[var(--cuicui-control-bg)]",
    },
    "inline-attachment": {
      root: flatSurface,
      image: "rounded-[var(--radius-control)]",
    },
    "thread-rail": {
      item: "rounded-full bg-[var(--cuicui-control-bg)]",
      popover: popup,
    },
    progress: {
      track: "bg-[var(--cuicui-control-bg)]",
      indicator: "bg-[var(--primary)]",
    },
    meter: {
      track: "bg-[var(--cuicui-control-bg)]",
      indicator: "bg-[var(--primary)]",
    },
  },
  paints: {
    "chat-message": {
      streaming: "cuicui-gradient-text",
    },
    skeleton: {
      shimmer: "cuicui-animated-gradient",
    },
  },
};
