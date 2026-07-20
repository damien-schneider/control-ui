import type { ControlUiSkin } from "@/components/control-ui/skin";

/*
 * XP (Luna) advanced skin: config carries structure (classes/adornments); theme.css owns colors, skin.css owns effects.
 * No "use client" — titlebar adornments are static decorative (aria-hidden) JSX; keeps it server-renderable.
 */

// dotted focus rectangle inset into the control — the Luna keyboard-focus reading.
const xpFocus =
  "focus-visible:ring-0 focus-visible:outline focus-visible:outline-1 focus-visible:outline-dotted focus-visible:outline-[var(--foreground)] focus-visible:outline-offset-[-3px]";

// raised Luna control: 3px corner, blue outline, top-light gradient, orange hover glow.
// radius = max(3px, --radius-control): keeps signature corner but lets radius knob round past it.
// no transition-none needed (XP already collapses --duration-* to 0ms); active:scale-100 stays (style override, not duration).
const lunaRaised = `rounded-[max(3px,var(--radius-control))] border border-[var(--xp-control-border)] bg-linear-to-b from-(--xp-control-top) to-(--xp-control-bottom) text-foreground shadow-[inset_0_1px_0_var(--xp-bevel-light)] hover:shadow-[inset_0_0_0_1px_var(--ring),inset_0_1px_0_var(--xp-bevel-light)] active:from-(--xp-control-bottom) active:to-(--xp-control-top) active:scale-100 ${xpFocus}`;

// flat toolbar button — no fill until hover pops the bevel out, press sinks it in.
const lunaFlat = `rounded-[max(3px,var(--radius-control))] border border-transparent bg-transparent text-foreground shadow-none hover:border-[var(--xp-bevel-dark)] hover:xp-bevel-up active:xp-bevel-down ${xpFocus}`;

// solid (default action): the pale-blue Luna default button with a thin blue inner ring.
const lunaSolid = `rounded-[max(3px,var(--radius-control))] border border-[var(--xp-control-border)] bg-linear-to-b from-(--xp-solid-top) to-(--xp-solid-bottom) font-bold text-foreground shadow-[inset_0_0_0_1px_var(--xp-solid-ring),inset_0_1px_0_var(--xp-bevel-light)] active:scale-100 ${xpFocus}`;

// Luna user bubble — raised pale-blue gradient with a top light bevel; returned only for user rows.
const lunaBubble =
  "rounded-[3px] border border-[var(--xp-field-border)] bg-linear-to-b/srgb from-(--xp-bubble-user-top) to-(--xp-bubble-user-bottom) text-foreground shadow-[inset_0_1px_0_var(--xp-bevel-light)]";

// square white popup, hard drop shadow — classic XP menu/list container.
// no transition-none / data-[starting/ending-style] needed: at 0ms tempo Base UI enter/exit already snaps instantly.
// backdrop-blur-none + ring-0 stay (style overrides, not durations).
const xpPopupSurface =
  "rounded-none border border-[var(--xp-field-border)] bg-popover text-foreground shadow-[3px_3px_4px_rgba(0,0,0,0.35)] ring-0 backdrop-blur-none";
const xpPopupList = `${xpPopupSurface} p-0.5`;

// full-bleed row with the solid selection-blue highlight.
const xpItem =
  "rounded-none px-5 py-0.5 min-h-6 text-[12px] data-[highlighted]:bg-[var(--primary)] data-[highlighted]:text-[var(--primary-foreground)] data-[disabled]:opacity-40";

const xpSeparator = "mx-1 rounded-none bg-[var(--xp-separator)]";
const xpMenuLabel = "text-[11px] normal-case tracking-normal text-muted-foreground";

// sunken white field, square by default (--radius-control=0); radius knob can round inputs, pack keeps its look.
const xpField = `rounded-[var(--radius-control)] border border-[var(--xp-field-border)] bg-[var(--background)] text-foreground shadow-[inset_1px_1px_0_var(--xp-bevel-dark)] focus-visible:ring-0 focus-within:ring-0 focus-visible:border-[var(--primary)] ${xpFocus}`;

export const skin: ControlUiSkin = {
  id: "xp",
  // Luna motion IS "reduced": theme editor stamps data-motion from this flag; xp/theme.css also collapses --duration-* to 0ms standalone.
  motion: "reduced",
  families: {
    popup: {
      surface: xpPopupSurface,
      "list-surface": xpPopupList,
      item: xpItem,
      label: xpMenuLabel,
      separator: xpSeparator,
      shortcut: "text-[11px] text-muted-foreground",
    },
  },
  slots: {
    button: {
      root: ({ variant }) => {
        if (variant === "solid") return lunaSolid;
        if (variant === "surface") return lunaRaised;
        return lunaFlat;
      },
      content: "gap-1 leading-none",
    },
    select: {
      trigger: lunaRaised,
      icon: "rotate-0 text-[var(--xp-control-border)]",
    },
    "dropdown-menu": {
      trigger: lunaRaised,
    },
    "context-menu": {
      "sub-trigger": "data-[popup-open]:bg-[var(--primary)] data-[popup-open]:text-[var(--primary-foreground)]",
    },
    input: {
      root: xpField,
    },
    "input-group": {
      root: xpField,
    },
    dialog: {
      content:
        "rounded-none rounded-t-[5px] border-[3px] border-[var(--xp-frame)] bg-background p-0 shadow-[3px_3px_8px_rgba(0,0,0,0.35)] backdrop-blur-none",
      header: "px-3 pb-0 pt-2",
      title: "text-[13px] font-bold",
      description: "text-[12px] text-muted-foreground",
      close:
        "rounded-[3px] border border-white/70 bg-linear-to-b/srgb from-(--xp-close-top) from-0% to-(--xp-close-bottom) to-100% text-white shadow-[inset_0_1px_0_oklch(1_0_0/0.45)]",
    },
    sidebar: {
      inner:
        "rounded-none border border-[var(--xp-field-border)] bg-linear-to-b/srgb from-(--xp-task-pane-top) to-(--xp-task-pane-bottom) shadow-none",
      "menu-button":
        "rounded-none text-[var(--xp-link)] hover:bg-[var(--primary)]/10 data-[active=true]:bg-[var(--primary)] data-[active=true]:text-[var(--primary-foreground)]",
      "group-label": "text-[var(--xp-link)] normal-case",
    },
    slider: {
      track: "rounded-[var(--radius-control)] bg-[var(--xp-scroll-track)] shadow-[inset_1px_1px_0_var(--xp-bevel-dark)]",
      indicator: "rounded-[var(--radius-control)] bg-[var(--primary)]",
      thumb:
        "rounded-[var(--radius-control)] border border-[var(--xp-control-border)] bg-linear-to-b from-(--xp-control-top) to-(--xp-control-bottom) shadow-[inset_0_1px_0_var(--xp-bevel-light)]",
    },
    "scroll-area": {
      root: "xp-scrollbar",
      scrollbar: "xp-scroll-track",
      thumb: "xp-scroll-thumb",
    },
    "chat-message": {
      content: ({ role }) => (role === "user" ? lunaBubble : undefined),
    },
    activity: {
      root: ({ kind }) =>
        kind === "tool"
          ? "rounded-none border border-[var(--xp-groupbox-border)] bg-background shadow-[inset_1px_1px_0_var(--xp-bevel-light)]"
          : undefined,
      trigger: ({ kind }) => (kind === "tool" ? "rounded-none bg-[var(--secondary)] text-foreground" : undefined),
    },
    "chat-composer": {
      shell: `rounded-[3px] ${xpField}`,
      submit: lunaSolid,
    },
    "markdown-block": {
      root: "rounded-none border border-[var(--xp-groupbox-border)] xp-scrollbar",
      header: "rounded-none border-b border-[var(--xp-groupbox-border)] bg-[var(--secondary)]",
    },
    "thread-rail": {
      item: "rounded-none",
      line: "rounded-none",
    },
    "chat-layout": {
      root: "rounded-none rounded-t-[8px] border-[3px] border-[var(--xp-frame)] shadow-[3px_3px_8px_rgba(0,0,0,0.35)]",
    },
    "chat-thread": {
      root: "xp-scrollbar",
    },
  },
  paints: {
    skeleton: {
      shimmer: "bg-[var(--xp-skeleton)]",
    },
    "chat-message": {
      streaming: "progress-sweep",
    },
  },
  adornments: {
    "chat-layout": {
      titlebar: (
        <div
          aria-hidden="true"
          className="flex h-[30px] shrink-0 select-none items-center gap-1.5 rounded-t-[5px] bg-[linear-gradient(180deg,#5398f7_0%,var(--xp-titlebar-top)_10%,var(--xp-titlebar-bottom)_55%,var(--xp-titlebar-edge)_100%)] pl-2 pr-1"
        >
          <span className="size-4 shrink-0 rounded-[2px] border border-white/50 bg-[linear-gradient(135deg,#9ec7f5_0%,#2a5bd0_100%)]" />
          <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-white text-shadow-[1px_1px_1px_oklch(0_0_0/0.45)]">
            Agent Chat
          </span>
          <span className="flex shrink-0 items-center gap-[2px]">
            <span className="flex size-[21px] items-center justify-center rounded-[3px] border border-white/70 bg-[linear-gradient(180deg,#7ba7f0_0%,#3a6fe0_45%,#2a5bd0_100%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
              <svg viewBox="0 0 16 16" className="size-3" aria-hidden="true" fill="none">
                <path d="M4 11.5h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <span className="flex size-[21px] items-center justify-center rounded-[3px] border border-white/70 bg-[linear-gradient(180deg,#7ba7f0_0%,#3a6fe0_45%,#2a5bd0_100%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
              <svg viewBox="0 0 16 16" className="size-3" aria-hidden="true" fill="none">
                <path d="M4.5 5h7v6.5h-7z" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </span>
            <span className="flex size-[21px] items-center justify-center rounded-[3px] border border-white/70 bg-[linear-gradient(180deg,#e5714e_0%,#d44242_100%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
              <svg viewBox="0 0 16 16" className="size-3" aria-hidden="true" fill="none">
                <path d="M4.5 4.5 11.5 11.5M11.5 4.5 4.5 11.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
          </span>
        </div>
      ),
    },
    dialog: {
      titlebar: (
        <div
          aria-hidden="true"
          className="flex h-[26px] shrink-0 select-none items-center gap-1.5 rounded-t-[2px] bg-[linear-gradient(180deg,#5398f7_0%,var(--xp-titlebar-top)_10%,var(--xp-titlebar-bottom)_55%,var(--xp-titlebar-edge)_100%)] px-2 text-[13px] font-bold text-white text-shadow-[1px_1px_1px_oklch(0_0_0/0.45)]"
        >
          Dialog
        </div>
      ),
    },
    "chat-thought": {
      details: (
        <span aria-hidden="true" className="ml-1 text-[11px] font-bold text-[var(--xp-link)]">
          Details
        </span>
      ),
    },
  },
};
