import { describe, expect, test } from "bun:test";
import { blockEntries, templateKinds } from "@/app/(features)/catalog/blocks";
import { catalogCategories, categoriesWithEntries } from "@/app/(features)/catalog/categories";
import { componentEntries } from "@/app/(features)/catalog/components";
import { kitEntries } from "@/app/(features)/catalog/kits";
import { docsPageManifest } from "@/app/(features)/catalog/pages";
import { pageLinks } from "@/app/(features)/client/page-links";
import type { BlockId } from "@/app/(features)/model/types";
import { sidebarPaneForActivePage } from "@/app/(features)/sidebar/nav-items";
import { componentGalleryGroups, kitGalleryGroups, templateGalleryGroups } from "./catalog-gallery";

describe("catalog galleries", () => {
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

  test("renders every kit once in its catalog category", () => {
    const groups = kitGalleryGroups();
    const items = groups.flatMap((group) => group.items);

    expect(items.map((item) => item.id).toSorted()).toEqual(kitEntries.map((entry) => entry.id).toSorted());
    expect(groups.map((group) => group.id)).toEqual(
      catalogCategories.filter((category) => kitEntries.some((entry) => entry.category === category.id)).map((category) => category.id),
    );
    expect(groups.every((group) => group.items.length > 0)).toBe(true);
    expect(new Set(items.map((item) => item.id)).size).toBe(kitEntries.length);

    for (const group of groups) {
      const expectedIds = kitEntries.filter((entry) => entry.category === group.id).map((entry) => entry.id);
      expect(group.items.map((item) => item.id).toSorted()).toEqual(expectedIds.toSorted());
      expect(group.items.every((item) => item.href === `/kits/${item.id}`)).toBe(true);
    }
  });

  test("renders every template once in taxonomy order with canonical links", () => {
    const groups = templateGalleryGroups();
    const items = groups.flatMap((group) => group.items);
    const expectedTemplateIds = [
      "chat",
      "coding-agent",
      "agent-run",
      "settings",
      "team-chat",
      "file-explorer",
      "design-canvas",
    ] satisfies BlockId[];

    expect(groups.map((group) => group.id)).toEqual(templateKinds.map((kind) => kind.slug));
    expect(
      groups
        .find((group) => group.kind === "screen")
        ?.items.map((item) => item.id)
        .toSorted(),
    ).toEqual(expectedTemplateIds.toSorted());
    expect(groups.find((group) => group.kind === "pattern")?.items.map((item) => item.id)).toEqual(["discussion", "theme-toggle"]);
    expect(items.map((item) => item.id).toSorted()).toEqual(blockEntries.map((entry) => entry.id).toSorted());
    expect(new Set(items.map((item) => item.id)).size).toBe(blockEntries.length);
    expect(items.every((item) => item.href === `/templates/${item.id}`)).toBe(true);
  });

  test("registers every overview with the correct shell mode and table of contents", () => {
    expect(docsPageManifest.find((page) => page.id === "components")?.href).toBe("/components");
    expect(docsPageManifest.find((page) => page.id === "kits")?.href).toBe("/kits");
    expect(docsPageManifest.find((page) => page.id === "templates")?.href).toBe("/templates");
    expect(sidebarPaneForActivePage("templates", docsPageManifest, [])).toBe("templates");

    expect(pageLinks({ activeCatalogOverview: "components", components: [], extensions: [] })).toEqual(
      categoriesWithEntries(componentEntries).map((category) => ({ href: `#${category.id}`, label: category.label })),
    );
    expect(pageLinks({ activeCatalogOverview: "kits", components: [], extensions: [] })).toEqual(
      categoriesWithEntries(kitEntries).map((category) => ({ href: `#${category.id}`, label: category.label })),
    );
    expect(pageLinks({ activeCatalogOverview: "templates", components: [], extensions: [] })).toEqual([
      { href: "#screens", label: "Screens" },
      { href: "#patterns", label: "Patterns" },
    ]);
  });
});
