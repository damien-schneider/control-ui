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
    description: "Craft-inspired neutral surfaces, Inter typography, pill controls, and quiet layered shadows.",
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
    id: "none",
    label: "No skin",
    kind: "theme",
    description: "Control UI defaults: neutral colors, square corners, and no shadows. No skin required.",
    docsOnly: true,
    paths: [sourceFile("theme.css — library defaults", "src/registry/sources/control-ui/theme.css", "theme")],
  },
  {
    id: "modern-apple",
    label: "macOS",
    kind: "advanced",
    description: "Apple-inspired glass skin with live backdrop blur, SVG edge refraction, paired light and dark rims, and a flush sidebar.",
    docs: 'Import skin-theme.css and skin.css in your global CSS, then mount <ModernAppleGlassFilter /> once in your root layout from "@/components/control-ui/modern-apple-glass-filter". This static SVG adds edge refraction in Chromium without client effects or backdrop capture. Other browsers retain native blur and glass rims.',
    packManifestPath: "registry/modern-apple/skin.json",
    paths: skinPackFiles("modern-apple", [
      sourceFile(
        "modern-apple-glass-filter.tsx — a static SVG definition for native backdrop edge refraction; mount once in the root layout",
        "src/registry/skin-packs/modern-apple/modern-apple-glass-filter.tsx",
        "filter",
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

export const skinPackIds = skinMetas.filter((skin) => !("docsOnly" in skin && skin.docsOnly)).map((skin) => skin.id);

export const skinsOverview = {
  id: "skins",
  label: "Skinning Control UI",
  description: "Author complete token-driven Control UI skins with slots, adornments, motion controls, and one shared component source.",
} as const;

export const skinsOverviewId = skinsOverview.id;
