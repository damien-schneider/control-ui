import { sourceFile } from "./shared";

/*
 * Extensions: optional installable items layered on the library, never part of a component's own bundle.
 * Two attachment modes share the concept:
 * - "root": mounted once above its targets, discovers them through the emitted anatomy (control-effects, view-transition).
 * - "anchored": a component ships a named adornment anchor (positioned wrapper, behavioral ctx) and skin.config
 *   fills it with the extension — pack or app brand, same gesture (send-aurora on chat-composer:send-layer).
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
      "Interrupt-safe driver for the browser View Transitions API: page transitions, shared-element morphs, and a reduced-motion fallback for both.",
    attach: "root",
    target: "components/control-ui/extensions/view-transition.ts",
    registryKind: "view-transition",
    activation: {
      description:
        "Wrap your router navigation in startPageViewTransition and resolve it once the new route has rendered. For element morphs, useMorphTransition hands out one shared name and two prop bags — the trigger wears it while closed, the surface while open, so a portalled popup can grow out of the button that opened it. Both CSS presets ship with the item.",
      code: `// page — on navigation (framework-agnostic, router glue stays in your app)
startPageViewTransition(() => router.push(href));
finishPageViewTransition(); // once the new view is on screen (e.g. a pathname effect)

// element morph — the CSS-native layoutId; works across a portal and the top layer
const { morph, triggerProps, surfaceProps } = useMorphTransition({ open });

<Dialog open={open} onOpenChange={(next) => morph(() => setOpen(next))}>
  {/* drop data-[popup-open]:opacity-0 to keep the trigger on the page while the dialog is open */}
  <DialogTrigger
    {...triggerProps}
    className={cn(triggerProps.className, "data-[popup-open]:opacity-0")}
    render={<Button />}
  >
    Open
  </DialogTrigger>
  <DialogContent {...surfaceProps}>…</DialogContent>
</Dialog>`,
    },
    source: sourceFile("View transition driver", "src/registry/sources/control-ui/extensions/view-transition.ts", "extension"),
    supportFiles: [sourceFile("Morph binding", "src/registry/hooks/use-morph-transition.ts", "hook")],
  },
  {
    id: "send-aurora",
    kind: "Extension",
    name: "SendAurora",
    summary:
      "Anchored ChatComposer extension: a blurred aurora backdrop that sweeps up once per sent message — activated from skin.config via the chat-composer:send-layer anchor.",
    attach: "anchored",
    anchor: "chat-composer:send-layer",
    target: "components/control-ui/extensions/send-aurora.tsx",
    registryKind: "send-aurora",
    appliesTo: ["chat-composer"],
    activation: {
      description:
        "Fill the anchor from skin.config — your app brand or an installed pack, same gesture. The ctx is a render prop: sendCount replays the sweep once per send; ChatComposer owns the positioned wrapper (aria-hidden, pointer-events-none, paint-contained), the extension only supplies visuals.",
      code: `// skin.config.tsx (import the "use client" extension; the config itself stays RSC-pure)
import { SendAurora } from "@/components/control-ui/extensions/send-aurora";

export const skin: ControlUiSkin = {
  id: "my-brand",
  adornments: {
    "chat-composer": {
      "send-layer": (ctx) => <SendAurora sendCount={ctx.sendCount} />,
    },
  },
};`,
    },
    source: sourceFile("Aurora layer", "src/registry/sources/control-ui/extensions/send-aurora.tsx", "extension"),
    supportFiles: [sourceFile("Sweep motion + palette tokens", "src/registry/sources/control-ui/extensions/send-aurora.css", "effect-css")],
  },
] as const;
