import { skin as refined } from "@/src/registry/skin-packs/refined/skin.config";
import type { ControlUiSkin } from "./skin";

let current = refined;

// -? forces every ControlUiSkin key to be forwarded.
type CompleteSkinView = ControlUiSkin & { [K in keyof ControlUiSkin]-?: unknown };

export const skin: CompleteSkinView = {
  get id() {
    return current.id;
  },
  get motion() {
    return current.motion;
  },
  get colorScheme() {
    return current.colorScheme;
  },
  get sidebarLayout() {
    return current.sidebarLayout;
  },
  get indicators() {
    return current.indicators;
  },
  get sidebarWidth() {
    return current.sidebarWidth;
  },
  get adornments() {
    return current.adornments;
  },
  get effects() {
    return current.effects;
  },
};

export function setSkin(next: ControlUiSkin) {
  current = next;
}
