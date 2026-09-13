import type { ControlUiSkin } from "@/components/control-ui/skin";

export const skin: ControlUiSkin = {
  id: "windows-98",
  motion: "reduced",
  colorScheme: "light",
  sidebarLayout: "sidebar",
  indicators: { sidebar: "none", tree: "none" },
  adornments: {
    "chat-layout": {
      titlebar: (
        <div
          aria-hidden="true"
          className="flex h-5 shrink-0 select-none items-center bg-[image:var(--win98-titlebar)] px-1 text-[11px] font-bold text-[var(--win98-white)]"
        >
          Agent Chat
        </div>
      ),
    },
  },
};
