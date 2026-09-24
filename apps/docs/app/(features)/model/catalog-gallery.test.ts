import { describe, expect, test } from "bun:test";
import { blockEntries, useCaseKinds } from "@/app/(features)/catalog/blocks";
import { catalogCategories, categoriesWithEntries } from "@/app/(features)/catalog/categories";
import { componentEntries } from "@/app/(features)/catalog/components";
import { docsPageManifest } from "@/app/(features)/catalog/pages";
import { primitiveEntries } from "@/app/(features)/catalog/primitives";
import { pageLinks } from "@/app/(features)/client/page-links";
import type { BlockId } from "@/app/(features)/model/types";
import { sidebarPaneForActivePage } from "@/app/(features)/sidebar/nav-items";
import { componentGalleryGroups, primitiveGalleryGroups, useCaseGalleryGroups } from "./catalog-gallery";

describe("catalog galleries", () => {
  test("renders every primitive once in its catalog category", () => {
    const groups = primitiveGalleryGroups();
    const items = groups.flatMap((group) => group.items);

    expect(items.map((item) => item.id).toSorted()).toEqual(primitiveEntries.map((entry) => entry.id).toSorted());
    expect(groups.map((group) => group.id)).toEqual(
      catalogCategories
        .filter((category) => primitiveEntries.some((entry) => entry.category === category.id))
        .map((category) => category.id),
    );
    expect(groups.every((group) => group.items.length > 0)).toBe(true);
    expect(new Set(items.map((item) => item.id)).size).toBe(primitiveEntries.length);

    for (const group of groups) {
      const expectedIds = primitiveEntries.filter((entry) => entry.category === group.id).map((entry) => entry.id);
      expect(group.items.map((item) => item.id).toSorted()).toEqual(expectedIds.toSorted());
      expect(group.items.every((item) => item.href === `/primitives/${item.id}`)).toBe(true);
    }
  });

  test("renders every component once in its catalog category", () => {
    const groups = componentGalleryGroups();
    const items = groups.flatMap((group) => group.items);

    expect(items.map((item) => item.id).toSorted()).toEqual(componentEntries.map((entry) => entry.id).toSorted());
    expect(groups.map((group) => group.id)).toEqual(
      catalogCategories
        .filter((category) => componentEntries.some((entry) => entry.category === category.id))
        .map((category) => category.id),
    );
    expect(groups.every((group) => group.items.length > 0)).toBe(true);
    expect(new Set(items.map((item) => item.id)).size).toBe(componentEntries.length);

    for (const group of groups) {
      const expectedIds = componentEntries.filter((entry) => entry.category === group.id).map((entry) => entry.id);
      expect(group.items.map((item) => item.id).toSorted()).toEqual(expectedIds.toSorted());
      expect(group.items.every((item) => item.href === `/components/${item.id}`)).toBe(true);
    }
  });

  test("renders every use case once in taxonomy order with canonical links", () => {
    const groups = useCaseGalleryGroups();
    const items = groups.flatMap((group) => group.items);
    const expectedTemplateIds = ["chat", "coding-agent", "settings", "file-explorer", "design-canvas"] satisfies BlockId[];

    expect(groups.map((group) => group.id)).toEqual(useCaseKinds.map((kind) => kind.slug));
    expect(
      groups
        .find((group) => group.kind === "template")
        ?.items.map((item) => item.id)
        .toSorted(),
    ).toEqual(expectedTemplateIds.toSorted());
    expect(groups.find((group) => group.kind === "pattern")?.items.map((item) => item.id)).toEqual(["theme-toggle"]);
    expect(items.map((item) => item.id).toSorted()).toEqual(blockEntries.map((entry) => entry.id).toSorted());
    expect(new Set(items.map((item) => item.id)).size).toBe(blockEntries.length);
    expect(items.every((item) => item.href === `/use-cases/${item.id}`)).toBe(true);
  });

  test("registers every overview with the correct shell mode and table of contents", () => {
    expect(docsPageManifest.find((page) => page.id === "primitives")?.href).toBe("/primitives");
    expect(docsPageManifest.find((page) => page.id === "components")?.href).toBe("/components");
    expect(docsPageManifest.find((page) => page.id === "use-cases")?.href).toBe("/use-cases");
    expect(sidebarPaneForActivePage("use-cases", docsPageManifest, [])).toBe("use-cases");

    expect(pageLinks({ activeCatalogOverview: "primitives", primitives: [], extensions: [] })).toEqual(
      categoriesWithEntries(primitiveEntries).map((category) => ({ href: `#${category.id}`, label: category.label })),
    );
    expect(pageLinks({ activeCatalogOverview: "components", primitives: [], extensions: [] })).toEqual(
      categoriesWithEntries(componentEntries).map((category) => ({ href: `#${category.id}`, label: category.label })),
    );
    expect(pageLinks({ activeCatalogOverview: "use-cases", primitives: [], extensions: [] })).toEqual([
      { href: "#templates", label: "Templates" },
      { href: "#patterns", label: "Patterns" },
    ]);
  });
});
