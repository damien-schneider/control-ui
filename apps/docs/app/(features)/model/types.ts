import type { PracticeSkillId, SkillConcern, SkillConcernId } from "@control-ui/skills";
import type { blockEntries, UseCaseKindId } from "@/app/(features)/catalog/blocks";
import type { componentEntries } from "@/app/(features)/catalog/components";
import type { extensionEntries } from "@/app/(features)/catalog/extensions";
import type { GuideGroupId, guideEntries } from "@/app/(features)/catalog/guides";
import type { hookEntries, utilEntries } from "@/app/(features)/catalog/hooks-utils";
import type { CatalogOverviewId } from "@/app/(features)/catalog/overviews";
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
export type SkinMetaId = (typeof skinMetas)[number]["id"];
export type ActivePageId = PageId | SkinMetaId | CatalogOverviewId | "skins";
export type IntegrationId = (typeof integrationIds)[number];
export type RegistryKindId = (typeof registryKindIds)[number];
// `undefined` = stable
export type DocsStatus = CatalogStatus;

export type DocsSkinMeta = {
  id: SkinMetaId;
  label: string;
  kind: CatalogSkinKind;
  description: string;
  docsOnly?: boolean;
  packManifestPath?: string;
};

// `files` is empty for docsOnly skin, which ships no installable pack
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
  shared?: boolean;
};

export type DocsRegistryDependency = {
  registryKind: RegistryKindId;
  name: string;
  kind: "Agent" | "Block" | "Extension" | "Primitive";
  href: string;
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

export type DocsKnob = { name: string; syntax: string; defaultValue: string };
export type DocsKnobFamily = { id: string; href?: string; knobs: DocsKnob[] };

export type DocsPrimitive = {
  id: PrimitiveId;
  category: PrimitiveCategoryId;
  name: string;
  summary: string;
  status?: DocsStatus;
  // library-original primitive has no shadcn equivalent
  shadcnDocsUrl?: string;
  registry: {
    target: string;
    example: SourceFile;
    examples?: DocsPrimitiveExample[];
    source: SourceFile;
    supportFiles?: SourceFile[];
    composition?: CompositionExample[];
    registryKind: RegistryKindId;
    registryDependencies: DocsRegistryDependency[];
    knobs: DocsKnobFamily[];
  };
};

export type DocsHook = {
  id: HookId;
  name: string;
  summary: string;
  target: string;
  install: string;
  source: SourceFile;
  references?: { label: string; href: string }[];
};

export type DocsUtil = {
  id: UtilId;
  name: string;
  summary: string;
  target: string;
  source: SourceFile;
  // defaults to "every Control UI component"
  install?: string;
  hasPreview?: boolean;
};

// attach "root" mounts once above its targets and finds them by anatomy; "anchored" waits for skin.config to fill component's named adornment anchor
export type DocsExtension = {
  id: ExtensionId;
  name: string;
  summary: string;
  status?: DocsStatus;
  attach: "root" | "anchored";
  /** For anchored extensions: SkinAdornmentContexts anchor item fills. */
  anchor?: string;
  target: string;
  registryKind: RegistryKindId;
  activation: { description: string; code: string };
  /** Component or primitive pages whose "Available extensions" panel offers this item. */
  appliesTo?: (ComponentId | PrimitiveId)[];
  source: SourceFile;
  supportFiles?: SourceFile[];
  registryDependencies: DocsRegistryDependency[];
};

export type GuideSection = {
  id: string;
  title: string;
  body?: string;
  points?: string[];
  code?:
    | "skin-install"
    | "skin-scaffold-install"
    | "component-install"
    | "block-install"
    | "component-usage"
    | "runtime-agnostic-message"
    | "agent-endpoints"
    | "agent-llms"
    | "update-install";
};

export type ComparedApplication = { name: string; url: string };

export type GuideFaq = { question: string; answer: string };

export type GuidePage = {
  id: GuideId;
  group: GuideGroupId;
  name: string;
  summary: string;
  layout?: "default" | "wide";
  cta?: boolean;
  sections: GuideSection[];
  comparedApplications?: readonly ComparedApplication[];
  faqs?: readonly GuideFaq[];
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

// Not component version — one registry name never has two contents. Either sibling item sharing export name and
// props contract, so swapping is import-path change, or one composition of single installed item, so it is call-site change.
export type DocsComponentVersion = {
  id: string;
  label: string;
  registryKind: RegistryKindId;
  example: SourceFile;
  source: SourceFile;
  supportFiles: SourceFile[];
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
  registryDependencies: DocsRegistryDependency[];
  registryKind: RegistryKindId;
  versions?: DocsComponentVersion[];
  knobs: DocsKnobFamily[];
};

export type DocsBlock = {
  id: BlockId;
  useCaseKind: UseCaseKindId;
  name: string;
  summary: string;
  status?: DocsStatus;
  registryKind: RegistryKindId;
  example: SourceFile;
  usage: Record<IntegrationId, SourceFile>;
  registryDependencies: DocsRegistryDependency[];
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
