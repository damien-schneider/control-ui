import type { ControlUiSkin } from "@/components/control-ui/skin";

/*
 * ADVANCED skin: mount ModernAppleLiquidGlassRuntime once for WebGL floating surfaces; skin.css
 * keeps the unsupported-browser fallback while these slots style controls and content.
 */

// white focus halo — the ring token is white in this skin, so focus reads as a soft luminous glow.
const appleFocus = "focus-visible:ring-[3px] focus-visible:ring-[var(--ring)] focus-visible:ring-offset-0";

// Glass wafer: translucent white control, backdrop-blur, 0.5px ring (not base's ring-1) —
// tailwind-merge keeps last ring since skin classes append after base. Shadow overrides base via
// arg-order (leading `inset_` reads as box-shadow); ambiguous bare `shadow-[var(--x)]` needs `shadow-(--x)`.
const appleGlass =
  "bg-[var(--glass-fill)] text-foreground backdrop-blur-[var(--backdrop-blur-glass)] backdrop-saturate-[1.8] ring-[0.5px] ring-inset ring-[var(--glass-rim)] shadow-[inset_0_1px_0_0_var(--glass-gloss),0_1px_2px_0_rgba(0,0,0,0.06)] hover:bg-[var(--glass-fill-hover)] active:bg-[var(--glass-fill-active)] active:scale-[0.97]";
const appleControl = `rounded-[var(--radius-control)] ${appleGlass} ${appleFocus}`;

// the solid variant = the system-blue capsule CTA, with its own white top gloss so it reads as glass.
const appleSolid = `rounded-[var(--radius-control)] border-0 bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35),0_1px_3px_0_rgba(10,102,240,0.4)] hover:brightness-105 active:brightness-95 active:scale-[0.97] ${appleFocus}`;

// Transparent glass field: frosted backdrop + white rim, no solid fill ("input transparent" ask).
const appleField = `rounded-[var(--radius-control)] border border-[var(--input)] bg-transparent text-foreground backdrop-blur-[var(--backdrop-blur-glass)] backdrop-saturate-[1.8] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] ${appleFocus}`;

// Floating popup: geometry only (radius+row padding) — full DS material painted in skin.css globally.
const applePopup = "rounded-[0.75rem] p-1";
// Menu row: 24px (DS Menu/Height=1.5rem), 13px text. Active row = solid #0069f9 pill w/ WHITE
// text (DS node 2004:25249), not translucent tint. `group/mi` whitens row's icons+shortcut too.
const appleItem =
  "group/mi min-h-[1.5rem] rounded-[var(--radius-popup-item)] px-2 py-0.5 text-[13px] data-[highlighted]:bg-[var(--menu-selection)] data-[highlighted]:text-white data-[disabled]:opacity-40";
const appleMenuLabel = "px-2 py-1 text-label font-semibold normal-case tracking-normal text-muted-foreground";
const appleSeparator = "mx-0 my-1 bg-[var(--hairline)]";

export const skin: ControlUiSkin = {
  id: "modern-apple",
  // Apple floats sidebar (native shadcn `floating` variant, detached rounded panel) while content
  // stays flat; component reads via skinSidebarLayout(), skin.css re-materialises panel as glass.
  sidebarLayout: "floating",
  slots: {
    button: {
      root: ({ variant }) => (variant === "solid" ? appleSolid : appleControl),
    },
    menu: {
      trigger: appleControl,
      content: applePopup,
      item: appleItem,
      separator: appleSeparator,
      label: appleMenuLabel,
    },
    "context-menu": {
      content: applePopup,
      "sub-content": applePopup,
      item: appleItem,
      "checkbox-item": appleItem,
      "radio-item": appleItem,
      "sub-trigger": `${appleItem} data-[popup-open]:bg-[var(--menu-selection)] data-[popup-open]:text-white`,
      separator: appleSeparator,
      label: appleMenuLabel,
      shortcut: "ml-auto text-meta tracking-widest text-muted-foreground group-data-[highlighted]/cmi:text-white",
    },
    select: {
      trigger: appleControl,
      content: applePopup,
      item: `${appleItem} data-[highlighted]:[&>span:last-child]:text-white`,
    },
    "thread-rail": {
      popover: "rounded-[var(--radius-lg)]",
    },
    activity: {
      root: ({ kind }) =>
        kind === "tool"
          ? "rounded-[var(--radius-panel)] border border-[var(--glass-rim)] bg-[var(--glass-fill)] backdrop-blur-[var(--backdrop-blur-glass)] backdrop-saturate-[1.8]"
          : undefined,
      trigger: ({ kind }) => (kind === "tool" ? "bg-transparent" : undefined),
    },
    input: {
      root: appleField,
    },
    "input-group": {
      root: appleField,
    },
    dialog: {
      content: "rounded-[0.75rem]",
      title: "text-[15px] font-semibold",
      description: "text-body text-muted-foreground",
    },
    "sidebar-layout": {
      content: "m-0 rounded-none border-0 bg-transparent shadow-none lg:m-0",
    },
    sidebar: {
      inner:
        "rounded-[var(--radius-panel)] border border-[var(--glass-rim)] bg-[var(--glass-fill)] backdrop-blur-[var(--backdrop-blur-glass)] backdrop-saturate-[1.8]",
      "menu-button":
        "rounded-[var(--radius-control)] data-[active=true]:bg-[oklch(from_var(--primary)_l_c_h/0.14)] data-[active=true]:text-foreground",
    },
    slider: {
      thumb: "rounded-full border border-[var(--glass-rim)] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.28)]",
      indicator: "bg-[var(--primary)]",
    },
    "chat-message": {
      content:
        "data-[role=user]:rounded-[var(--radius-field)] data-[role=user]:bg-[var(--primary)] data-[role=user]:text-[var(--primary-foreground)] data-[role=user]:shadow-none",
    },
    "chat-input": {
      shell: `rounded-[var(--radius-field)] ${appleField}`,
      submit: appleSolid,
    },
    "markdown-block": {
      root: "rounded-[var(--radius-panel)] border border-[var(--glass-rim)]",
    },
    "chat-scene": {
      root: "rounded-[var(--radius-scene)] border border-[var(--glass-rim)] bg-[oklch(from_var(--card)_l_c_h/0.7)] backdrop-blur-[var(--backdrop-blur-popover)] backdrop-saturate-[1.8] shadow-(--shadow-soft)",
    },
  },
};
