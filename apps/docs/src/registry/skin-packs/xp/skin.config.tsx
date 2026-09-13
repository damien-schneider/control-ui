import type { ControlUiSkin } from "@/components/control-ui/skin";

export const skin: ControlUiSkin = {
  id: "xp",
  motion: "reduced",
  sidebarLayout: "sidebar",
  indicators: { sidebar: "none", tree: "none" },
  adornments: {
    "chat-layout": {
      titlebar: (
        <div
          aria-hidden="true"
          className="flex h-[27px] shrink-0 select-none items-center rounded-t-[5px] bg-[image:var(--xp-titlebar)] px-2 font-['Trebuchet_MS',Tahoma,sans-serif] text-[13px] font-bold text-[var(--xp-white)] text-shadow-[1px_1px_var(--xp-title-shadow)]"
        >
          Agent Chat
        </div>
      ),
    },
  },
};
