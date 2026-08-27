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
import { knobFamiliesFor, knobFamilyIdOf } from "@/app/(features)/model/knob-docs";
import { publicRegistryDependencies, registryDocumentedSourceFiles } from "@/app/(features)/model/registry-source-files";
import type {
  CompositionExample,
  DocsBlock,
  DocsComponent,
  DocsComponentVersion,
  DocsExtension,
  DocsHook,
  DocsKnobFamily,
  DocsPrimitive,
  DocsRegistryDependency,
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

const documentedSourceOwners = new Map<string, string>([
  ...primitiveEntries.map((entry) => [entry.paths.registry.source.path, entry.paths.registry.registryKind] as const),
  ...componentEntries.map((entry) => [entry.paths.source.path, entry.registryKind] as const),
]);

function documentedSourceSet(registryKind: string, primary: CatalogSourceFile, declaredFiles: readonly CatalogSourceFile[]) {
  for (const declared of declaredFiles) {
    const owner = documentedSourceOwners.get(declared.path);
    if (owner && owner !== registryKind)
      throw new Error(`${registryKind}: ${declared.path} belongs to ${owner} — depend on it instead of declaring its source here`);
  }

  const files = registryDocumentedSourceFiles(registryKind, [primary, ...declaredFiles]);
  const primarySource = files.find((file) => file.path === primary.path);
  if (!primarySource) throw new Error(`${registryKind}: missing primary source ${primary.path}`);
  const supportFiles = files.filter((file) => file.path !== primary.path);

  return {
    source: primarySource,
    supportFiles: ownSourceFiles(supportFiles, registryKind),
    knobs: knobFamilies(files, registryKind),
  };
}

// Family-named item documents the recipe CSS; every other consumer gets the knob list instead.
function ownSourceFiles(files: SourceFile[], registryKind: string) {
  return files.filter((file) => {
    if (file.slot === "knob-contract") return false;
    const family = knobFamilyIdOf(file);
    return family === undefined || family === registryKind;
  });
}

function docsPageFor(kind: string): DocsRegistryDependency | undefined {
  const component = componentEntries.find((entry) => entry.registryKind === kind);
  if (component) return { registryKind: component.registryKind, name: component.name, kind: "Agent", href: `/ai/${component.id}` };

  const primitive = primitiveEntries.find((entry) => entry.paths.registry.registryKind === kind);
  if (primitive)
    return {
      registryKind: primitive.paths.registry.registryKind,
      name: primitive.name,
      kind: "Primitive",
      href: `/primitives/${primitive.id}`,
    };

  const block = blockEntries.find((entry) => entry.registryKind === kind);
  if (block) return { registryKind: block.registryKind, name: block.name, kind: "Block", href: `/use-cases/${block.id}` };

  const extension = extensionEntries.find((entry) => entry.registryKind === kind);
  if (extension)
    return { registryKind: extension.registryKind, name: extension.name, kind: "Extension", href: `/extensions/${extension.id}` };

  return undefined;
}

function registryDependencyReferences(registryKind: string): DocsRegistryDependency[] {
  return publicRegistryDependencies(registryKind).map((dependency) => {
    const page = docsPageFor(dependency);
    if (!page) throw new Error(`${registryKind}: public dependency ${dependency} has no docs page`);
    return page;
  });
}

function knobFamilies(files: SourceFile[], registryKind: string): DocsKnobFamily[] {
  return knobFamiliesFor(files).map((family) => {
    const page = family.id === registryKind ? undefined : docsPageFor(family.id);
    return page ? { ...family, href: page.href } : family;
  });
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
    group: entry.group,
    name: entry.name,
    summary: entry.summary,
    layout: "layout" in entry ? entry.layout : undefined,
    cta: "cta" in entry ? entry.cta : undefined,
    sections: entry.sections.map((section) => ({ ...section })),
    comparedApplications: "comparedApplications" in entry ? [...entry.comparedApplications] : undefined,
    faqs: "faqs" in entry ? [...entry.faqs] : undefined,
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

function getComponentVersions(
  entry: (typeof componentEntries)[number],
  declaredSupport: readonly CatalogSourceFile[],
): DocsComponentVersion[] | undefined {
  if (!("versions" in entry)) return undefined;

  return entry.versions.map((version) => {
    const installed = documentedSourceSet(
      version.registryKind,
      version.paths.source,
      version.registryKind === entry.registryKind ? declaredSupport : [],
    );
    return {
      id: version.id,
      label: version.label,
      registryKind: version.registryKind,
      example: sourceFrom(version.paths.example),
      source: installed.source,
      supportFiles: installed.supportFiles,
    };
  });
}

function getComponents(): DocsComponent[] {
  return componentEntries.map((entry) => {
    const hook = "hook" in entry.paths ? entry.paths.hook : undefined;
    const declaredSupport = [...(hook ? [hook] : []), ...("supportFiles" in entry.paths ? entry.paths.supportFiles : [])];
    const installed = documentedSourceSet(entry.registryKind, entry.paths.source, declaredSupport);

    return {
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
      hook: hook ? installed.supportFiles.find((file) => file.path === hook.path) : undefined,
      supportFiles: installed.supportFiles.filter((file) => file.path !== hook?.path),
      source: installed.source,
      registryDependencies: registryDependencyReferences(entry.registryKind),
      registryKind: entry.registryKind,
      versions: getComponentVersions(entry, declaredSupport),
      knobs: installed.knobs,
    };
  });
}

function getBlocks(): DocsBlock[] {
  return blockEntries.map((entry) => {
    const [primary] = entry.paths.files;
    if (!primary) throw new Error(`${entry.registryKind}: missing block source`);
    const installed = documentedSourceSet(entry.registryKind, primary, []);

    return {
      id: entry.id,
      useCaseKind: entry.useCaseKind,
      name: entry.name,
      summary: entry.summary,
      status: catalogStatus(entry),
      registryKind: entry.registryKind,
      registryDependencies: registryDependencyReferences(entry.registryKind),
      example: sourceFrom(entry.paths.example),
      usage: sourceRequiredRecord(integrationIds, entry.paths.usage),
      files: [installed.source, ...installed.supportFiles],
      composition: hasCompositionArray(entry) ? compositionArray(entry.composition) : undefined,
    };
  });
}

function getPrimitives(): DocsPrimitive[] {
  return primitiveEntries.map((entry) => {
    const declaredFiles = "supportFiles" in entry.paths.registry ? entry.paths.registry.supportFiles : [];
    const installed = documentedSourceSet(entry.paths.registry.registryKind, entry.paths.registry.source, declaredFiles);

    return {
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
        source: installed.source,
        supportFiles: installed.supportFiles,
        composition: hasCompositionArray(entry.paths.registry) ? compositionArray(entry.paths.registry.composition) : undefined,
        registryDependencies: registryDependencyReferences(entry.paths.registry.registryKind),
        registryKind: entry.paths.registry.registryKind,
        knobs: installed.knobs,
      },
    };
  });
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
  return extensionEntries.map((entry) => {
    const declaredFiles = "supportFiles" in entry ? entry.supportFiles : [];
    const installed = documentedSourceSet(entry.registryKind, entry.source, declaredFiles);

    return {
      id: entry.id,
      name: entry.name,
      summary: entry.summary,
      status: catalogStatus(entry),
      attach: entry.attach,
      anchor: "anchor" in entry ? entry.anchor : undefined,
      target: entry.target,
      registryKind: entry.registryKind,
      registryDependencies: registryDependencyReferences(entry.registryKind),
      activation: { ...entry.activation },
      appliesTo: "appliesTo" in entry ? [...entry.appliesTo] : undefined,
      source: installed.source,
      supportFiles: installed.supportFiles,
    };
  });
}

function getSkinPages(): DocsSkinPage[] {
  return skinMetas.map((meta) => {
    // Widened alias reads `docsOnly`, declared on CatalogSkinMeta but absent from inferred literal union (no pack sets it today).
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

// persistent client shell needs navigation metadata and source anatomy, not every file body.
// Route pages receive one full item they render, keeping initial payload proportional to current page.
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
      knobs: [],
      versions: component.versions?.map((version) => ({
        ...version,
        example: sourceOutline(version.example),
        source: sourceOutline(version.source),
        supportFiles: version.supportFiles.map(sourceOutline),
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
        knobs: [],
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
