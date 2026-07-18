import type { ControlUiSkin } from "@/components/control-ui/skin";

/*
 * ADVANCED skin, no cva slots here: metal surface via skin.css + root-mounted WebGL
 * extension (liquid-metal-runtime.tsx) injecting metal-fx <canvas> per data-control node.
 * Mount <LiquidMetalSkinRuntime/> at app root (ControlEffectsRuntime-style) or shader stays off.
 */
export const skin: ControlUiSkin = { id: "liquid-metal" };
