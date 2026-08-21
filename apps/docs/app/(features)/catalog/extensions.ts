import { sourceFile } from "./shared";

/*
 * "root" mounts once above its targets and finds them through emitted anatomy; "anchored" waits for skin.config
 * to fill component's named adornment anchor. `appliesTo` names pages whose extensions panel offers item.
 */
export const extensionEntries = [
  {
    id: "control-effects",
    kind: "Extension",
    name: "ControlEffects",
    summary:
      "CSS-driven control effects (top-shine, ripple, hover-circle) that follow every control app-wide through the emitted anatomy — portalled surfaces included.",
    attach: "root",
    target: "components/control-ui/extensions/control-effects-root.tsx",
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

// app layout — mirrors resolved list on <html> for in-tree controls
<ControlEffectsRuntime />

// or scope effects to one subtree instead (caller-wins local override)
<ControlEffectsRoot effects={["top-shine", "ripple"]}>
  <Toolbar />
</ControlEffectsRoot>`,
    },
    source: sourceFile("Runtime + subtree root", "src/registry/sources/control-ui/extensions/control-effects-root.tsx", "extension"),
    supportFiles: [sourceFile("Effect styles", "src/registry/sources/control-ui/extensions/control-effects.css", "effect-css")],
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

// element morph — CSS-native layoutId; works across portal and top layer
const { morph, triggerProps, surfaceProps } = useMorphTransition({ open });

<Dialog open={open} onOpenChange={(next) => morph(() => setOpen(next))}>
  {/* drop data-[popup-open]:opacity-0 to keep trigger on page while dialog is open */}
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
    supportFiles: [
      sourceFile("Morph binding", "src/registry/hooks/use-morph-transition.ts", "hook"),
      sourceFile("Transition presets", "src/registry/sources/control-ui/extensions/view-transition.css", "effect-css"),
    ],
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
