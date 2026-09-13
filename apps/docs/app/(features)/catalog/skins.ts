import { type CatalogSourceFile, sourceFile } from "./shared";

export type CatalogSkinKind = "theme" | "advanced";
export type CatalogSkinMeta = {
  id: string;
  label: string;
  kind: CatalogSkinKind;
  description: string;
  docs?: string;
  docsOnly?: boolean;
  packManifestPath?: string;
  paths?: readonly CatalogSourceFile[];
};

function skinPackFiles(id: string, extra: readonly CatalogSourceFile[] = []): readonly CatalogSourceFile[] {
  const base = `src/registry/skin-packs/${id}`;
  return [
    sourceFile("theme.css — token block scoped to [data-skin]; a theme skin's entire brand", `${base}/theme.css`, "theme"),
    sourceFile(
      "skin.css — the pack's own vars + @utility helpers + descendant CSS the cva recipes can't express",
      `${base}/skin.css`,
      "skin",
    ),
    sourceFile("skin.config.tsx — per-slot classes, adornments, and the motion flag", `${base}/skin.config.tsx`, "config"),
    ...extra,
  ];
}

const retroSystemFont = sourceFile(
  "retro-system-font.css — embedded system font and its MIT license",
  "src/registry/skin-packs/retro-system-font.css",
  "font",
);

export const skinMetas = [
  {
    id: "refined",
    label: "Refined",
    kind: "theme",
    description: "Compact, calm starting skin with a complete Control UI token contract.",
    packManifestPath: "registry/refined/skin.json",
    paths: skinPackFiles("refined"),
  },
  {
    id: "xp",
    label: "Windows XP",
    kind: "advanced",
    description: "Windows XP Luna with compact system typography, glossy controls, blue window frames, and Explorer task panes.",
    packManifestPath: "registry/xp/skin.json",
    paths: skinPackFiles("xp", [
      retroSystemFont,
      sourceFile("xp-controls.css — buttons, fields, choices, and ranges", "src/registry/skin-packs/xp/xp-controls.css", "controls"),
    ]),
  },
  {
    id: "windows-98",
    label: "Windows 98",
    kind: "advanced",
    description:
      "Classic Windows 98 with bitmap system typography, raised gray controls, recessed fields, navy title bars, and Explorer tree navigation. Fixed to its original light palette.",
    packManifestPath: "registry/windows-98/skin.json",
    paths: skinPackFiles("windows-98", [
      retroSystemFont,
      sourceFile(
        "windows-98-controls.css — buttons, fields, choices, and ranges",
        "src/registry/skin-packs/windows-98/windows-98-controls.css",
        "controls",
      ),
    ]),
  },
  {
    id: "liquid-metal",
    label: "Liquid metal",
    kind: "advanced",
    description: "Polished metal skin with a WebGL shader control surface.",
    packManifestPath: "registry/liquid-metal/skin.json",
    paths: skinPackFiles("liquid-metal", [
      sourceFile(
        "liquid-metal-runtime.tsx — the root-mounted WebGL extension (metal-fx) that injects a shader canvas into every control; mount it once, like the ripple <ControlEffectsRuntime />",
        "src/registry/skin-packs/liquid-metal/liquid-metal-runtime.tsx",
        "runtime",
      ),
    ]),
  },
  {
    id: "rig",
    label: "Rig",
    kind: "theme",
    description: "Brutalist skin with coral accents, squared corners, and dense typography.",
    packManifestPath: "registry/rig/skin.json",
    paths: skinPackFiles("rig"),
  },
  {
    id: "flat",
    label: "Flat",
    kind: "theme",
    description: "Neutral reset skin with square corners, no shadows, and the stock motion tempo.",
    packManifestPath: "registry/flat/skin.json",
    paths: skinPackFiles("flat"),
  },
  {
    id: "modern-apple",
    label: "Modern Apple",
    kind: "advanced",
    description:
      "Apple-inspired Liquid Glass skin: WebGL-refraction on floating surfaces, precise directional rims, transparent inputs, and continuous corners.",
    docs: 'Add these imports once to app/globals.css: @import "../components/control-ui/styles/skin-theme.css"; @import "../components/control-ui/styles/skin.css"; Then mount ModernAppleLiquidGlassRuntime once near the app root from @/components/control-ui/modern-apple-liquid-glass-runtime. The runtime uses createImageBitmap when available; if an older browser needs its image-decoder fallback, allow data: in img-src or it will retain the CSS glass fallback.',
    packManifestPath: "registry/modern-apple/skin.json",
    paths: skinPackFiles("modern-apple", [
      sourceFile(
        "modern-apple-liquid-glass-runtime.tsx — root-mounted lifecycle that enhances visible floating surfaces and preserves the CSS fallback",
        "src/registry/skin-packs/modern-apple/modern-apple-liquid-glass-runtime.tsx",
        "runtime",
      ),
      sourceFile(
        "modern-apple-liquid-glass.ts — shared capture and neutral refractive renderer used by every enhanced surface",
        "src/registry/skin-packs/modern-apple/modern-apple-liquid-glass.ts",
        "renderer",
      ),
    ]),
  },
  {
    id: "cuicui",
    label: "Cuicui",
    kind: "advanced",
    description:
      "Cuicui-inspired shell skin with fixed grain, a docked w-80 sidebar, a neutral main container, and the send-aurora anchored extension on ChatComposer (skin.config fills the chat-composer:send-layer anchor).",
    packManifestPath: "registry/cuicui/skin.json",
    paths: skinPackFiles("cuicui"),
  },
  {
    id: "linear",
    label: "Linear",
    kind: "advanced",
    description:
      "Linear-inspired skin: indigo brand on a cool neutral ramp, a flat 13px chrome band, 8px controls on 12px panels, hairline borders instead of elevation, and 8px menu rows inset in a 4px gutter.",
    packManifestPath: "registry/linear/skin.json",
    paths: skinPackFiles("linear"),
  },
] as const satisfies readonly CatalogSkinMeta[];

export const skinsOverview = {
  id: "skins",
  label: "Skinning Control UI",
  description: "Author complete token-driven Control UI skins with slots, adornments, motion controls, and one shared component source.",
} as const;

export const skinsOverviewId = skinsOverview.id;
