import { practiceSkills, skillConcerns } from "@control-ui/skills";
import { blockEntries } from "@/app/(features)/catalog/blocks";
import { componentEntries } from "@/app/(features)/catalog/components";
import { extensionEntries } from "@/app/(features)/catalog/extensions";
import { guideEntries } from "@/app/(features)/catalog/guides";
import { hookEntries, utilEntries } from "@/app/(features)/catalog/hooks-utils";
import { primitiveEntries } from "@/app/(features)/catalog/primitives";
import { type CatalogSourceFile, catalogStatus, integrationIds } from "@/app/(features)/catalog/shared";
import { type CatalogSkinMeta, skinMetas } from "@/app/(features)/catalog/skins";
import { source } from "@/app/(features)/model/data-source";
import type {
  CompositionExample,
  DocsBlock,
  DocsComponent,
  DocsExtension,
  DocsHook,
  DocsPrimitive,
  DocsShellData,
  DocsSkill,
  DocsSkillConcern,
  DocsSkinPage,
  DocsUtil,
  GuidePage,
  SourceFile,
} from "@/app/(features)/model/types";
import { objectFromEntries } from "@/lib/typed-object";

function hasCompositionArray(entry: unknown): entry is { composition: readonly CompositionExample[] } {
  return typeof entry === "object" && entry !== null && "composition" in entry;
}

function sourceFrom(file: CatalogSourceFile): SourceFile {
  return source(file.label, file.path, file.slot);
}

function sourceOutline(file: SourceFile): SourceFile {
  const functions = [...file.code.matchAll(/export\s+function\s+([A-Z][A-Za-z0-9]*)/g)].map((match) => `export function ${match[1]}() {}`);
  const constants = [...file.code.matchAll(/export\s+const\s+([A-Z][A-Za-z0-9]*)\s*=/g)].map(
    (match) => `export const ${match[1]} = undefined;`,
  );

  return { ...file, code: [...functions, ...constants].join("\n") };
}

function sourceRequiredRecord<T extends string>(keys: readonly T[], record: Readonly<Record<T, CatalogSourceFile>>): Record<T, SourceFile> {
  return objectFromEntries(keys.map((key) => [key, sourceFrom(record[key])] as const));
}

function compositionArray(examples: readonly { title: string; description?: string; code: string }[]) {
  return examples.map((example) => ({
    title: example.title,
    description: example.description,
    code: example.code,
  }));
}

function getGuides(): GuidePage[] {
  return guideEntries.map((entry) => ({
    id: entry.id,
    name: entry.name,
    summary: entry.summary,
    layout: "layout" in entry ? entry.layout : undefined,
    sections: entry.sections.map((section) => ({ ...section })),
  }));
}

function getSkills(): DocsSkill[] {
  return practiceSkills.map((skill) => ({
    ...skill,
    source: "source" in skill && skill.source ? { ...skill.source } : undefined,
    checks: [...skill.checks],
    avoid: [...skill.avoid],
  }));
}

function getSkillConcerns(): DocsSkillConcern[] {
  return skillConcerns.map((concern) => ({ ...concern }));
}

function getComponents(): DocsComponent[] {
  return componentEntries.map((entry) => ({
    id: entry.id,
    name: entry.name,
    summary: entry.summary,
    status: catalogStatus(entry),
    previewClassName: "previewClassName" in entry ? entry.previewClassName : undefined,
    example: sourceFrom(entry.paths.example),
    examples:
      "additionalPreviews" in entry
        ? entry.additionalPreviews.map((example) => ({
            id: example.id,
            title: example.title,
            description: example.description,
            source: sourceFrom(example.source),
            previewClassName: example.previewClassName,
          }))
        : undefined,
    usage: sourceRequiredRecord(integrationIds, entry.paths.usage),
    hook: "hook" in entry.paths ? sourceFrom(entry.paths.hook) : undefined,
    supportFiles: "supportFiles" in entry.paths ? entry.paths.supportFiles.map(sourceFrom) : undefined,
    source: sourceFrom(entry.paths.source),
    usesPrimitives: "usesPrimitives" in entry ? [...entry.usesPrimitives] : undefined,
    registryKind: entry.registryKind,
    versions:
      "versions" in entry
        ? entry.versions.map((version) => ({
            id: version.id,
            label: version.label,
            registryKind: version.registryKind,
            example: sourceFrom(version.paths.example),
            source: sourceFrom(version.paths.source),
          }))
        : undefined,
  }));
}

function getBlocks(): DocsBlock[] {
  return blockEntries.map((entry) => ({
    id: entry.id,
    useCaseKind: entry.useCaseKind,
    name: entry.name,
    summary: entry.summary,
    status: catalogStatus(entry),
    registryKind: entry.registryKind,
    example: sourceFrom(entry.paths.example),
    usage: sourceRequiredRecord(integrationIds, entry.paths.usage),
    files: entry.paths.files.map(sourceFrom),
    composition: hasCompositionArray(entry) ? compositionArray(entry.composition) : undefined,
  }));
}

function getPrimitives(): DocsPrimitive[] {
  return primitiveEntries.map((entry) => ({
    id: entry.id,
    category: entry.category,
    name: entry.name,
    summary: entry.summary,
    status: catalogStatus(entry),
    shadcnDocsUrl: "shadcnDocsUrl" in entry ? entry.shadcnDocsUrl : undefined,
    registry: {
      target: entry.paths.registry.target,
      example: sourceFrom(entry.paths.registry.example),
      examples:
        "additionalPreviews" in entry
          ? entry.additionalPreviews.map((example) => ({
              id: example.id,
              title: example.title,
              description: example.description,
              source: sourceFrom(example.source),
              previewClassName: example.previewClassName,
            }))
          : undefined,
      source: sourceFrom(entry.paths.registry.source),
      supportFiles: "supportFiles" in entry.paths.registry ? entry.paths.registry.supportFiles.map(sourceFrom) : undefined,
      composition: hasCompositionArray(entry.paths.registry) ? compositionArray(entry.paths.registry.composition) : undefined,
      registryKind: entry.paths.registry.registryKind,
    },
  }));
}

function getHooks(): DocsHook[] {
  return hookEntries.map((entry) => ({
    id: entry.id,
    name: entry.name,
    summary: entry.summary,
    target: entry.target,
    install: entry.install,
    source: sourceFrom(entry.source),
    references: entry.references ? entry.references.map((reference) => ({ ...reference })) : undefined,
  }));
}

function getUtils(): DocsUtil[] {
  return utilEntries.map((entry) => ({
    id: entry.id,
    name: entry.name,
    summary: entry.summary,
    target: entry.target,
    source: sourceFrom(entry.source),
    install: "install" in entry ? entry.install : undefined,
    hasPreview: "preview" in entry,
  }));
}

function getExtensions(): DocsExtension[] {
  return extensionEntries.map((entry) => ({
    id: entry.id,
    name: entry.name,
    summary: entry.summary,
    status: catalogStatus(entry),
    attach: entry.attach,
    anchor: "anchor" in entry ? entry.anchor : undefined,
    target: entry.target,
    registryKind: entry.registryKind,
    activation: { ...entry.activation },
    appliesTo: "appliesTo" in entry ? [...entry.appliesTo] : undefined,
    source: sourceFrom(entry.source),
    supportFiles: "supportFiles" in entry ? entry.supportFiles.map(sourceFrom) : undefined,
  }));
}

function getSkinPages(): DocsSkinPage[] {
  return skinMetas.map((meta) => {
    // Widened alias reads `docsOnly`, declared on CatalogSkinMeta but absent from the inferred literal union (no pack sets it today).
    const contract: CatalogSkinMeta = meta;
    return {
      id: meta.id,
      label: meta.label,
      kind: meta.kind,
      description: meta.description,
      docsOnly: contract.docsOnly ?? false,
      packManifestPath: "packManifestPath" in meta ? meta.packManifestPath : undefined,
      files: "paths" in meta ? meta.paths.map(sourceFrom) : [],
    };
  });
}

let docsData: DocsShellData | undefined;
let docsShellData: DocsShellData | undefined;

export function getDocsData(): DocsShellData {
  docsData ??= {
    guides: getGuides(),
    skills: getSkills(),
    skillConcerns: getSkillConcerns(),
    components: getComponents(),
    blocks: getBlocks(),
    primitives: getPrimitives(),
    hooks: getHooks(),
    utils: getUtils(),
    extensions: getExtensions(),
    skinPages: getSkinPages(),
  };

  return docsData;
}

// The persistent client shell needs navigation metadata and source anatomy, not every file body.
// Route pages receive the one full item they render, keeping the initial payload proportional to the current page.
export function getDocsShellData(): DocsShellData {
  if (docsShellData) return docsShellData;

  const data = getDocsData();
  docsShellData = {
    guides: data.guides,
    skills: data.skills,
    skillConcerns: data.skillConcerns,
    components: data.components.map((component) => ({
      ...component,
      example: sourceOutline(component.example),
      examples: component.examples?.map((example) => ({ ...example, source: sourceOutline(example.source) })),
      usage: objectFromEntries(integrationIds.map((id) => [id, sourceOutline(component.usage[id])] as const)),
      hook: component.hook ? sourceOutline(component.hook) : undefined,
      supportFiles: component.supportFiles?.map(sourceOutline),
      source: sourceOutline(component.source),
      versions: component.versions?.map((version) => ({
        ...version,
        example: sourceOutline(version.example),
        source: sourceOutline(version.source),
      })),
    })),
    blocks: data.blocks.map((block) => ({
      ...block,
      example: sourceOutline(block.example),
      usage: objectFromEntries(integrationIds.map((id) => [id, sourceOutline(block.usage[id])] as const)),
      files: block.files.map(sourceOutline),
    })),
    primitives: data.primitives.map((primitive) => ({
      ...primitive,
      registry: {
        ...primitive.registry,
        example: sourceOutline(primitive.registry.example),
        examples: primitive.registry.examples?.map((example) => ({ ...example, source: sourceOutline(example.source) })),
        source: sourceOutline(primitive.registry.source),
        supportFiles: primitive.registry.supportFiles?.map(sourceOutline),
      },
    })),
    hooks: data.hooks.map((hook) => ({ ...hook, source: sourceOutline(hook.source) })),
    utils: data.utils.map((util) => ({ ...util, source: sourceOutline(util.source) })),
    extensions: data.extensions.map((extension) => ({
      ...extension,
      source: sourceOutline(extension.source),
      supportFiles: extension.supportFiles?.map(sourceOutline),
    })),
    skinPages: data.skinPages.map((skin) => ({ ...skin, files: skin.files.map(sourceOutline) })),
  };

  return docsShellData;
}
