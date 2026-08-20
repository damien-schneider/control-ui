import type { ControlUiSkin } from "@/components/control-ui/skin";

export const skin: ControlUiSkin = {
  id: "linear",
  // Linear's rail is narrower than shadcn's 16rem default and never draws surface of its own.
  sidebarWidth: "15rem",
};
