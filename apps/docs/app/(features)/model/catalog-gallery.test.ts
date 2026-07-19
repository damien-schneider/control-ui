import { describe, expect, test } from "bun:test";
import { componentEntries } from "@/app/(features)/catalog/components";
import { docsPageManifest } from "@/app/(features)/catalog/pages";
import { primitiveCategories, primitiveEntries } from "@/app/(features)/catalog/primitives";
import { pageLinks } from "@/app/(features)/client/page-links";
import { sidebarModeForActivePage } from "@/app/(features)/sidebar/nav-items";
import { agentGalleryGroups, primitiveGalleryGroups } from "./catalog-gallery";

describe("catalog galleries", () => {
  test("renders every primitive once in its catalog category", () => {
    const groups = primitiveGalleryGroups();
    const items = groups.flatMap((group) => group.items);

    expect(groups.map((group) => group.id)).toEqual(primitiveCategories.map((category) => category.id));
    expect(items.map((item) => item.id).toSorted()).toEqual(primitiveEntries.map((entry) => entry.id).toSorted());
    expect(new Set(items.map((item) => item.id)).size).toBe(primitiveEntries.length);

    for (const group of groups) {
      const expectedIds = primitiveEntries.filter((entry) => entry.category === group.id).map((entry) => entry.id);
      expect(group.items.map((item) => item.id).toSorted()).toEqual(expectedIds.toSorted());
      expect(group.items.every((item) => item.href === `/primitives/${item.id}`)).toBe(true);
    }
  });

  test("renders every agent once with its canonical documentation link", () => {
    const groups = agentGalleryGroups();
    const items = groups.flatMap((group) => group.items);

    expect(groups.map((group) => group.id)).toEqual(["agents"]);
    expect(items.map((item) => item.id).toSorted()).toEqual(componentEntries.map((entry) => entry.id).toSorted());
    expect(new Set(items.map((item) => item.id)).size).toBe(componentEntries.length);
    expect(items.every((item) => item.href === `/ai/${item.id}`)).toBe(true);
  });

  test("registers both overviews with the correct shell mode and table of contents", () => {
    expect(docsPageManifest.find((page) => page.id === "primitives")?.href).toBe("/primitives");
    expect(docsPageManifest.find((page) => page.id === "ai")?.href).toBe("/ai");
    expect(sidebarModeForActivePage("primitives", docsPageManifest)).toBe("primitives");
    expect(sidebarModeForActivePage("ai", docsPageManifest)).toBe("agents");

    expect(pageLinks({ activeCatalogOverview: "primitives", primitives: [], extensions: [] })).toEqual(
      primitiveCategories.map((category) => ({ href: `#${category.id}`, label: category.label })),
    );
    expect(pageLinks({ activeCatalogOverview: "ai", primitives: [], extensions: [] })).toEqual([{ href: "#agents", label: "Agents" }]);
  });
});
