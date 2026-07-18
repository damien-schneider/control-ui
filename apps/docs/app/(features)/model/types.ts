import type { PracticeSkillId, SkillConcern, SkillConcernId } from "@control-ui/skills";
import type { blockEntries } from "@/app/(features)/catalog/blocks";
import type { componentEntries } from "@/app/(features)/catalog/components";
import type { extensionEntries } from "@/app/(features)/catalog/extensions";
import type { guideEntries } from "@/app/(features)/catalog/guides";
import type { hookEntries, utilEntries } from "@/app/(features)/catalog/hooks-utils";
import type { PrimitiveCategoryId, primitiveEntries } from "@/app/(features)/catalog/primitives";
import type { CatalogStatus, integrationIds, registryKindIds } from "@/app/(features)/catalog/shared";
import type { CatalogSkinKind, skinMetas } from "@/app/(features)/catalog/skins";

export type GuideId = (typeof guideEntries)[number]["id"];
export type ComponentId = (typeof componentEntries)[number]["id"];
export type BlockId = (typeof blockEntries)[number]["id"];
export type PrimitiveId = (typeof primitiveEntries)[number]["id"];
export type HookId = (typeof hookEntries)[number]["id"];
export type UtilId = (typeof utilEntries)[number]["id"];
export type ExtensionId = (typeof extensionEntries)[number]["id"];
export type SkillId = PracticeSkillId;
export type PageId = GuideId | ComponentId | BlockId | PrimitiveId | HookId | UtilId | ExtensionId | SkillId;
// SkinMetaId = the skin axis exposed by the theme editor and skin docs.
export type SkinMetaId = (typeof skinMetas)[number]["id"];
// Full set of pages docs shell can render: catalog pages + a page per skin (/skins/<id>) + skins overview (/skins); skin pages ride the same shell as everything else.
export type ActivePageId = PageId | SkinMetaId | "skins";
export type IntegrationId = (typeof integrationIds)[number];
export type RegistryKindId = (typeof registryKindIds)[number];
// Maturity of an installable item; `undefined` = stable (see catalogStatusIds).
export type DocsStatus = CatalogStatus;

// Serializable skin descriptor consumed by the theme editor (mirrors CatalogSkinMeta).
export type DocsSkinMeta = {
  id: SkinMetaId;
  label: string;
  kind: CatalogSkinKind;
  description: string;
  docsOnly?: boolean;
  packManifestPath?: string;
};

// A skin's docs page: metadata + pack's own source files read into the code-viewer; `files` is empty for docsOnly skins (no installable pack); each file's `label` is its per-file note.
export type DocsSkinPage = {
  id: SkinMetaId;
  label: string;
  kind: CatalogSkinKind;
  description: string;
  docsOnly: boolean;
  packManifestPath?: string;
  files: SourceFile[];
};

export type SearchItem = {
  id: ActivePageId;
  name: string;
  kind: "Guide" | "Skill" | "Agent" | "Block" | "Primitive" | "Hook" | "Util" | "Extension" | "Skin";
  summary: string;
  href: string;
  status?: DocsStatus;
};

export type SourceFile = {
  label: string;
  path: string;
  code: string;
  slot?: string;
};

export type DocsPrimitiveExample = {
  id: string;
  title: string;
  description?: string;
  source: SourceFile;
  previewClassName?: string;
};

export type CompositionExample = {
  title: string;
  description?: string;
  code: string;
};

export type DocsPrimitive = {
  id: PrimitiveId;
  category: PrimitiveCategoryId;
  name: string;
  summary: string;
  status?: DocsStatus;
  // Optional: a library-original primitive (e.g. table-of-contents) has no shadcn equivalent.
  shadcnDocsUrl?: string;
  registry: {
    target: string;
    example: SourceFile;
    examples?: DocsPrimitiveExample[];
    source: SourceFile;
    supportFiles?: SourceFile[];
    composition?: CompositionExample[];
    registryKind: RegistryKindId;
  };
};

// A hook is local UI behavior installed alongside the component or primitive that uses it.
export type DocsHook = {
  id: HookId;
  name: string;
  summary: string;
  target: string;
  install: string;
  source: SourceFile;
  references?: { label: string; href: string }[];
};

// A util is a shared library file every Control UI install carries.
export type DocsUtil = {
  id: UtilId;
  name: string;
  summary: string;
  target: string;
  source: SourceFile;
  // Optional install phrasing (defaults to "every Control UI component"); whether util ships an interactive preview (looked up client-side by id in <UtilPreview />).
  install?: string;
  hasPreview?: boolean;
};

// An extension: an optional installable layered on the library, never part of a component's own bundle.
// attach "root" = mounted once above its targets, discovers them by anatomy; attach "anchored" = a component
// ships a named adornment anchor and skin.config fills it (pack or app brand, same gesture).
export type DocsExtension = {
  id: ExtensionId;
  name: string;
  summary: string;
  status?: DocsStatus;
  attach: "root" | "anchored";
  /** For anchored extensions: the SkinAdornmentContexts anchor the item fills. */
  anchor?: string;
  target: string;
  registryKind: RegistryKindId;
  activation: { description: string; code: string };
  /** Component or primitive pages whose "Available extensions" panel offers this item. */
  appliesTo?: (ComponentId | PrimitiveId)[];
  source: SourceFile;
  supportFiles?: SourceFile[];
};

export type GuideSection = {
  id: string;
  title: string;
  body?: string;
  points?: string[];
  code?:
    | "skin-install"
    | "component-install"
    | "block-install"
    | "component-usage"
    | "runtime-agnostic-message"
    | "agent-endpoints"
    | "agent-llms";
};

export type GuidePage = {
  id: GuideId;
  name: string;
  summary: string;
  layout?: "default" | "wide";
  sections: GuideSection[];
};

export type DocsSkill = {
  id: SkillId;
  title: string;
  concern: SkillConcernId;
  summary: string;
  goal: string;
  source?: {
    label: string;
    path: string;
  };
  checks: readonly string[];
  avoid: readonly string[];
};
export type DocsSkillConcern = SkillConcern;

// A usage version: either a sibling registry item sharing the component's export name + props contract
// (different rendering; swapping = import-path change), or — when every version keeps the parent
// registryKind — one composition of a single installed item (swapping = call-site change). NOT a component
// version — one registry name never has two contents; the page shows a picker, the consumer installs one item.
export type DocsComponentVersion = {
  id: string;
  label: string;
  registryKind: RegistryKindId;
  example: SourceFile;
  source: SourceFile;
};

export type DocsComponent = {
  id: ComponentId;
  name: string;
  summary: string;
  status?: DocsStatus;
  previewClassName?: string;
  example: SourceFile;
  examples?: DocsPrimitiveExample[];
  usage: Record<IntegrationId, SourceFile>;
  hook?: SourceFile;
  supportFiles?: SourceFile[];
  source: SourceFile;
  usesPrimitives?: PrimitiveId[];
  registryKind: RegistryKindId;
  versions?: DocsComponentVersion[];
};

export type DocsBlock = {
  id: BlockId;
  name: string;
  summary: string;
  status?: DocsStatus;
  registryKind: RegistryKindId;
  example: SourceFile;
  usage: Record<IntegrationId, SourceFile>;
  files: SourceFile[];
  composition?: CompositionExample[];
};

export type DocsShellData = {
  guides: GuidePage[];
  skills: readonly DocsSkill[];
  skillConcerns: readonly DocsSkillConcern[];
  components: DocsComponent[];
  blocks: DocsBlock[];
  primitives: DocsPrimitive[];
  hooks: DocsHook[];
  utils: DocsUtil[];
  extensions: DocsExtension[];
  skinPages: DocsSkinPage[];
};

export type SetupPreferenceUpdate = Partial<{
  integration: IntegrationId;
}>;
