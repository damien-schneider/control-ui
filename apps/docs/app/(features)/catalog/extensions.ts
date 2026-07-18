import { sourceFile } from "./shared";

/*
 * Extensions: optional installable items layered on the library, never part of a component's own bundle.
 * Two attachment modes share the concept:
 * - "root": mounted once above its targets, discovers them through the emitted anatomy (control-effects, view-transition).
 * - "anchored": a component ships a named adornment anchor (positioned wrapper, behavioral ctx) and skin.config
 *   fills it with the extension — pack or app brand, same gesture (send-aurora on chat-input:send-layer).
 * `appliesTo` lists the component or primitive pages whose "Available extensions" panel offers the item.
 */
export const extensionEntries = [
  {
    id: "control-effects",
    kind: "Extension",
    name: "ControlEffects",
    summary:
      "CSS-driven control effects (top-shine, ripple, hover-circle) that follow every control app-wide through the emitted anatomy — portalled surfaces included.",
    attach: "root",
    target: "components/control-ui/extensions/control-effects.ts",
    registryKind: "control-effects",
    appliesTo: ["button"],
    activation: {
      description:
        "Declare effects on your skin (DS-level, covers portals) and mount the runtime once for in-tree controls; a subtree ControlEffectsRoot stays the caller-wins local override.",
      code: `// skin.config.tsx — a brand's controls either all ripple or none do
export const skin: ControlUiSkin = {
  id: "my-brand",
  effects: ["ripple"],
};

// app layout — mirrors the resolved list on <html> for in-tree controls
<ControlEffectsRuntime />

// or scope effects to one subtree instead (caller-wins local override)
<ControlEffectsRoot effects={["top-shine", "ripple"]}>
  <Toolbar />
</ControlEffectsRoot>`,
    },
    source: sourceFile("Effects contract", "src/registry/sources/control-ui/extensions/control-effects.ts", "extension"),
    supportFiles: [
      sourceFile("Runtime + subtree root", "src/registry/sources/control-ui/extensions/control-effects-root.tsx", "extension"),
      sourceFile("Effect styles", "src/registry/sources/control-ui/effects.css", "effect-css"),
    ],
  },
  {
    id: "view-transition",
    kind: "Extension",
    name: "viewTransition",
    summary:
      "Interrupt-safe driver for the browser View Transitions API: deferred finish, fast-click interruption, reduced-motion fallback.",
    attach: "root",
    target: "components/control-ui/extensions/view-transition.ts",
    registryKind: "view-transition",
    activation: {
      description:
        "Wrap your router navigation in startPageViewTransition and resolve it once the new route has rendered; the paired view-page-rise CSS preset ships with the item.",
      code: `// on navigation (framework-agnostic — router glue stays in your app)
startPageViewTransition(() => router.push(href));

// once the new view is on screen (e.g. in a pathname effect)
finishPageViewTransition();`,
    },
    source: sourceFile("View transition driver", "src/registry/sources/control-ui/extensions/view-transition.ts", "extension"),
  },
  {
    id: "send-aurora",
    kind: "Extension",
    name: "SendAurora",
    summary:
      "Anchored ChatInput extension: a blurred aurora backdrop that sweeps up once per sent message — activated from skin.config via the chat-input:send-layer anchor.",
    attach: "anchored",
    anchor: "chat-input:send-layer",
    target: "components/control-ui/extensions/send-aurora.tsx",
    registryKind: "send-aurora",
    appliesTo: ["chat-input"],
    activation: {
      description:
        "Fill the anchor from skin.config — your app brand or an installed pack, same gesture. The ctx is a render prop: sendCount replays the sweep once per send; ChatInput owns the positioned wrapper (aria-hidden, pointer-events-none, paint-contained), the extension only supplies visuals.",
      code: `// skin.config.tsx (import the "use client" extension; the config itself stays RSC-pure)
import { SendAurora } from "@/components/control-ui/extensions/send-aurora";

export const skin: ControlUiSkin = {
  id: "my-brand",
  adornments: {
    "chat-input": {
      "send-layer": (ctx) => <SendAurora sendCount={ctx.sendCount} />,
    },
  },
};`,
    },
    source: sourceFile("Aurora layer", "src/registry/sources/control-ui/extensions/send-aurora.tsx", "extension"),
    supportFiles: [sourceFile("Sweep motion + palette tokens", "src/registry/sources/control-ui/extensions/send-aurora.css", "effect-css")],
  },
] as const;
