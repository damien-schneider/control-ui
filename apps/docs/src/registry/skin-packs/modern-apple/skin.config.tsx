import type { ControlUiSkin } from "@/components/control-ui/skin";

/*
 * Mount ModernAppleLiquidGlassRuntime once for WebGL floating surfaces; skin.css keeps the
 * unsupported-browser fallback.
 */

export const skin: ControlUiSkin = {
  id: "modern-apple",
  // Apple floats sidebar (native shadcn `floating` variant, detached rounded panel) while content
  // stays flat; component reads via skinSidebarLayout(), skin.css re-materialises panel as glass.
  sidebarLayout: "floating",
};
