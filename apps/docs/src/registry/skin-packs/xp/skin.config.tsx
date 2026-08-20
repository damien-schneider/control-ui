import type { ControlUiSkin } from "@/components/control-ui/skin";

/*
 * titlebar adornments stay static decorative JSX, so this config never needs "use client".
 */

export const skin: ControlUiSkin = {
  id: "xp",
  // Luna motion IS "reduced": theme editor stamps data-motion from this flag; xp/theme.css also collapses --duration-* to 0ms standalone.
  motion: "reduced",
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
