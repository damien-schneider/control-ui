import { type CatalogSourceFile, sourceFile } from "./shared";

// SKIN axis (theme editor), site-wide over Control UI source. Every pack has the same three-file shape;
// kind=theme primarily changes tokens, while kind=advanced also uses slots/adornments/ControlUiSkin fields.
// +skin.css, may DOCUMENT a root-mounted extension (e.g. liquid-metal WebGL, mounted by app, never imported by components/skin.config); indicator-pill behavior
// is NOT an extension (lazy-imported by components). docsOnly: demoed only. packManifestPath: installable skin.json. paths: pack files for code-viewer.
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

// Three files every pack ships, wired for code-viewer; `label` = per-file note (theme.css=contract tokens, skin.css=pack vars+@utility, skin.config=slots+adornments+motion).
// `slot` keys the tab so theme-stub and advanced pack read alike. `extra` appends pack-specific files (liquid-metal adds root-mounted WebGL runtime).
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
    description: "Windows XP-inspired Luna tokens, bevels, and titlebar details.",
    packManifestPath: "registry/xp/skin.json",
    paths: skinPackFiles("xp"),
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
    description: "Neutral reset skin with square corners, no shadows, and instant motion.",
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
      "Cuicui-inspired shell skin with fixed grain, a docked w-80 sidebar, a neutral main container, and the send-aurora anchored extension on ChatInput (skin.config fills the chat-input:send-layer anchor).",
    packManifestPath: "registry/cuicui/skin.json",
    paths: skinPackFiles("cuicui"),
  },
  {
    id: "linear",
    label: "Linear",
    kind: "advanced",
    description:
      "Linear-inspired skin: indigo brand on a cool neutral ramp, a flat 13px chrome band, 4px radius, hairline borders instead of elevation, and pill-shaped filled actions.",
    packManifestPath: "registry/linear/skin.json",
    paths: skinPackFiles("linear"),
  },
] as const satisfies readonly CatalogSkinMeta[];

// /skins is a catalog page, not a pack. Its identity lives here so navigation, visible copy, SEO, and agent surfaces share it.
export const skinsOverview = {
  id: "skins",
  label: "Skinning Control UI",
  description: "Author complete token-driven Control UI skins with slots, adornments, motion controls, and one shared component source.",
} as const;

export const skinsOverviewId = skinsOverview.id;
