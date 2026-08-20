import { SendAurora } from "@/components/control-ui/extensions/send-aurora";
import type { ControlUiSkin } from "@/components/control-ui/skin";

export const skin: ControlUiSkin = {
  id: "cuicui",
  sidebarLayout: "sidebar",
  sidebarWidth: "20rem",
  adornments: {
    button: {
      layer: (ctx) =>
        ctx.variant === "solid" && ctx.tone !== "danger" ? (
          <span
            aria-hidden
            className="cuicui-animated-gradient pointer-events-none absolute inset-0 rounded-[inherit] opacity-40 mix-blend-overlay"
          />
        ) : null,
    },
    "chat-composer": {
      "send-layer": (ctx) => (
        <SendAurora
          sendCount={ctx.sendCount}
          colors={["var(--cuicui-pink)", "var(--cuicui-orange)", "var(--cuicui-yellow)", "var(--cuicui-sky)", "var(--cuicui-blue)"]}
        />
      ),
    },
  },
};
