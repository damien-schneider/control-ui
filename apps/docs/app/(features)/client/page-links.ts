import { templateKinds } from "@/app/(features)/catalog/blocks";
import { categoriesWithEntries } from "@/app/(features)/catalog/categories";
import { componentEntries } from "@/app/(features)/catalog/components";
import { kitEntries } from "@/app/(features)/catalog/kits";
import type { CatalogOverviewId } from "@/app/(features)/catalog/overviews";
import { installedDependencyFiles, supportFilesFor } from "@/app/(features)/model/registry";
import type {
  DocsBlock,
  DocsComponent,
  DocsExtension,
  DocsHook,
  DocsKit,
  DocsSkill,
  DocsSkinPage,
  DocsUtil,
  GuidePage as GuidePageData,
} from "@/app/(features)/model/types";
import { hasExtensionDemo } from "@/app/(features)/page-templates/extension-demo-ids";

type PageLink = { href: string; label: string };

function componentPageLinks(activeComponent: DocsComponent, extensions: DocsExtension[]) {
  return [
    { href: "#preview", label: "Preview" },
    ...((activeComponent.registry.examples?.length ?? 0) > 0 ? [{ href: "#examples", label: "Examples" }] : []),
    { href: "#composition", label: "Composition" },
    { href: "#install", label: "Installation" },
    ...(installedDependencyFiles(activeComponent.registry.supportFiles ?? []).length > 0
      ? [{ href: "#dependencies", label: "Dependencies" }]
      : []),
    ...(activeComponent.registry.registryDependencies.length > 0 ? [{ href: "#library-dependencies", label: "Library dependencies" }] : []),
    { href: "#source", label: "Source" },
    ...(extensions.some((extension) => extension.appliesTo?.some((id) => id === activeComponent.id))
      ? [{ href: "#extensions", label: "Extensions" }]
      : []),
  ];
}

function kitPageLinks(kit: DocsKit, extensions: DocsExtension[]) {
  const hasDependencies = installedDependencyFiles(supportFilesFor(kit)).length > 0;
  const hasExtensions = extensions.some((extension) => extension.appliesTo?.some((id) => id === kit.id));

  return [
    ...(kit.alternatives ? [{ href: "#alternatives", label: "Alternatives" }] : []),
    ...(kit.variants ? [{ href: "#variants", label: "Variants" }] : []),
    { href: "#preview", label: "Preview" },
    ...((kit.examples?.length ?? 0) > 0 ? [{ href: "#examples", label: "Examples" }] : []),
    { href: "#composition", label: "Composition" },
    { href: "#install", label: "Installation" },
    { href: "#usage", label: "Usage" },
    ...(hasDependencies ? [{ href: "#dependencies", label: "Dependencies" }] : []),
    ...(kit.registryDependencies.length > 0 ? [{ href: "#library-dependencies", label: "Library dependencies" }] : []),
    { href: "#source", label: "Source" },
    ...(hasExtensions ? [{ href: "#extensions", label: "Extensions" }] : []),
  ];
}

function skinsOverviewPageLinks(): PageLink[] {
  return [
    { href: "#slot-vs-skin", label: "Slot vs skin.css" },
    { href: "#tokens", label: "Token contract" },
    { href: "#requirements", label: "Requirements" },
    { href: "#from-seed", label: "Generate from a seed" },
    { href: "#adornments", label: "Adornments" },
    { href: "#motion", label: "Motion flag" },
    { href: "#gotcha", label: "Gotcha" },
    { href: "#packs", label: "Skins" },
  ];
}

function catalogOverviewPageLinks(overview: CatalogOverviewId): PageLink[] {
  if (overview === "kits") return categoriesWithEntries(kitEntries).map((category) => ({ href: `#${category.id}`, label: category.label }));
  if (overview === "templates") return templateKinds.map((kind) => ({ href: `#${kind.slug}`, label: kind.label }));
  return categoriesWithEntries(componentEntries).map((category) => ({ href: `#${category.id}`, label: category.label }));
}

function skinPageLinks(skin: DocsSkinPage): PageLink[] {
  return [
    ...(skin.files.length > 0 ? [{ href: "#source", label: "Source" }] : []),
    { href: "#install", label: skin.docsOnly || skin.files.length === 0 ? "Availability" : "Installation" },
  ];
}

function skillPageLinks(skill: DocsSkill): PageLink[] {
  return [
    { href: "#checks", label: "Checks" },
    { href: "#avoid", label: "Avoid" },
    ...(skill.source ? [{ href: "#source", label: "Source" }] : []),
  ];
}

function extensionPageLinks(extension: DocsExtension): PageLink[] {
  return [
    ...(hasExtensionDemo(extension.id) ? [{ href: "#preview", label: "Preview" }] : []),
    { href: "#attach", label: "Attachment" },
    { href: "#install", label: "Installation" },
    { href: "#activation", label: "Activation" },
    ...(extension.registryDependencies.length > 0 ? [{ href: "#library-dependencies", label: "Library dependencies" }] : []),
    { href: "#source", label: "Source" },
  ];
}

function referencePageLinks(): PageLink[] {
  return [
    { href: "#install", label: "Installation" },
    { href: "#source", label: "Source" },
  ];
}

function templatePageLinks(template: DocsBlock): PageLink[] {
  return [
    { href: "#preview", label: "Preview" },
    { href: "#composition", label: "Composition" },
    { href: "#install", label: "Installation" },
    { href: "#usage", label: "Usage" },
    ...(template.registryDependencies.length > 0 ? [{ href: "#library-dependencies", label: "Library dependencies" }] : []),
    { href: "#included-source", label: "Included source" },
  ];
}

export function pageLinks({
  activeGuide,
  activeSkill,
  activeTemplate,
  activeComponent,
  activeReference,
  activeExtension,
  activeSkinPage,
  activeSkinsOverview,
  activeCatalogOverview,
  kit,
  extensions,
}: {
  activeGuide?: GuidePageData;
  activeSkill?: DocsSkill;
  activeTemplate?: DocsBlock;
  activeComponent?: DocsComponent;
  activeReference?: DocsHook | DocsUtil;
  activeExtension?: DocsExtension;
  activeSkinPage?: DocsSkinPage;
  activeSkinsOverview?: boolean;
  activeCatalogOverview?: CatalogOverviewId;
  kit?: DocsKit;
  components: DocsComponent[];
  extensions: DocsExtension[];
}) {
  if (activeGuide) return activeGuide.sections.map((section) => ({ href: `#${section.id}`, label: section.title }));

  if (activeCatalogOverview) return catalogOverviewPageLinks(activeCatalogOverview);
  if (activeSkinsOverview) return skinsOverviewPageLinks();
  if (activeSkinPage) return skinPageLinks(activeSkinPage);
  if (activeSkill) return skillPageLinks(activeSkill);
  if (activeExtension) return extensionPageLinks(activeExtension);
  if (activeReference) return referencePageLinks();
  if (activeTemplate) return templatePageLinks(activeTemplate);

  if (activeComponent) return componentPageLinks(activeComponent, extensions);

  return kit ? kitPageLinks(kit, extensions) : [];
}
