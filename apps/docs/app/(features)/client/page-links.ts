import type { CatalogOverviewId } from "@/app/(features)/catalog/overviews";
import { primitiveCategories } from "@/app/(features)/catalog/primitives";
import { componentComposition, primitiveComposition, resolvePrimitives } from "@/app/(features)/model/registry";
import type {
  DocsBlock,
  DocsComponent,
  DocsExtension,
  DocsHook,
  DocsPrimitive,
  DocsSkill,
  DocsSkinPage,
  DocsUtil,
  GuidePage as GuidePageData,
} from "@/app/(features)/model/types";
import { hasExtensionDemo } from "@/app/(features)/page-templates/extension-demo-ids";

type PageLink = { href: string; label: string };

function primitivePageLinks(activePrimitive: DocsPrimitive, extensions: DocsExtension[]) {
  return [
    { href: "#preview", label: "Preview" },
    ...((activePrimitive.registry.examples?.length ?? 0) > 0 ? [{ href: "#examples", label: "Examples" }] : []),
    ...(primitiveComposition(activePrimitive).length > 0 ? [{ href: "#composition", label: "Composition" }] : []),
    { href: "#install", label: "Installation" },
    ...((activePrimitive.registry.supportFiles?.length ?? 0) > 0 ? [{ href: "#dependencies", label: "Dependencies" }] : []),
    { href: "#source", label: "Source" },
    ...(extensions.some((extension) => extension.appliesTo?.some((id) => id === activePrimitive.id))
      ? [{ href: "#extensions", label: "Extensions" }]
      : []),
  ];
}

function componentPageLinks(component: DocsComponent, primitives: DocsPrimitive[], extensions: DocsExtension[]) {
  const hasComposition = componentComposition(component).length > 0;
  const hasDependencies = Boolean(component.hook) || (component.supportFiles?.length ?? 0) > 0;
  const hasExtensions = extensions.some((extension) => extension.appliesTo?.some((id) => id === component.id));

  return [
    { href: "#preview", label: "Preview" },
    ...((component.examples?.length ?? 0) > 0 ? [{ href: "#examples", label: "Examples" }] : []),
    ...(hasComposition ? [{ href: "#composition", label: "Composition" }] : []),
    { href: "#install", label: "Installation" },
    { href: "#usage", label: "Usage" },
    ...(hasDependencies ? [{ href: "#dependencies", label: "Dependencies" }] : []),
    { href: "#source", label: "Source" },
    ...(hasExtensions ? [{ href: "#extensions", label: "Extensions" }] : []),
    ...(resolvePrimitives(component, primitives).length > 0 ? [{ href: "#primitives", label: "Primitives" }] : []),
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
  if (overview === "ai") return [{ href: "#agents", label: "Agents" }];
  return primitiveCategories.map((category) => ({ href: `#${category.id}`, label: category.label }));
}

function skinPageLinks(skin: DocsSkinPage): PageLink[] {
  if (skin.docsOnly || skin.files.length === 0) return [{ href: "#install", label: "Availability" }];
  return [{ href: "#install", label: "Installation" }];
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
    { href: "#source", label: "Source" },
  ];
}

function referencePageLinks(): PageLink[] {
  return [
    { href: "#install", label: "Installation" },
    { href: "#source", label: "Source" },
  ];
}

function blockPageLinks(block: DocsBlock): PageLink[] {
  const hasComposition = (block.composition?.length ?? 0) > 0;
  return [
    { href: "#preview", label: "Preview" },
    ...(hasComposition ? [{ href: "#composition", label: "Composition" }] : []),
    { href: "#install", label: "Installation" },
    { href: "#usage", label: "Usage" },
    { href: "#agents", label: "Agents" },
  ];
}

export function pageLinks({
  activeGuide,
  activeSkill,
  activeBlock,
  activePrimitive,
  activeReference,
  activeExtension,
  activeSkinPage,
  activeSkinsOverview,
  activeCatalogOverview,
  component,
  primitives,
  extensions,
}: {
  activeGuide?: GuidePageData;
  activeSkill?: DocsSkill;
  activeBlock?: DocsBlock;
  activePrimitive?: DocsPrimitive;
  activeReference?: DocsHook | DocsUtil;
  activeExtension?: DocsExtension;
  activeSkinPage?: DocsSkinPage;
  activeSkinsOverview?: boolean;
  activeCatalogOverview?: CatalogOverviewId;
  component?: DocsComponent;
  primitives: DocsPrimitive[];
  extensions: DocsExtension[];
}) {
  if (activeGuide) return activeGuide.sections.map((section) => ({ href: `#${section.id}`, label: section.title }));

  if (activeCatalogOverview) return catalogOverviewPageLinks(activeCatalogOverview);
  if (activeSkinsOverview) return skinsOverviewPageLinks();
  if (activeSkinPage) return skinPageLinks(activeSkinPage);
  if (activeSkill) return skillPageLinks(activeSkill);
  if (activeExtension) return extensionPageLinks(activeExtension);
  if (activeReference) return referencePageLinks();
  if (activeBlock) return blockPageLinks(activeBlock);

  if (activePrimitive) return primitivePageLinks(activePrimitive, extensions);

  return component ? componentPageLinks(component, primitives, extensions) : [];
}
