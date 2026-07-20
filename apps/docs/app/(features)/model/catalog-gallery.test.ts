import { describe, expect, test } from "bun:test";
import { blockEntries, useCaseKinds } from "@/app/(features)/catalog/blocks";
import { componentEntries } from "@/app/(features)/catalog/components";
import { docsPageManifest } from "@/app/(features)/catalog/pages";
import { primitiveCategories, primitiveEntries } from "@/app/(features)/catalog/primitives";
import { pageLinks } from "@/app/(features)/client/page-links";
import type { BlockId } from "@/app/(features)/model/types";
import { sidebarModeForActivePage } from "@/app/(features)/sidebar/nav-items";
import { agentGalleryGroups, primitiveGalleryGroups, useCaseGalleryGroups } from "./catalog-gallery";

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

  test("renders every use case once in taxonomy order with canonical links", () => {
    const groups = useCaseGalleryGroups();
    const items = groups.flatMap((group) => group.items);
    const expectedTemplateIds = ["chat", "coding-agent", "settings", "file-explorer"] satisfies BlockId[];

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
    expect(docsPageManifest.find((page) => page.id === "ai")?.href).toBe("/ai");
    expect(docsPageManifest.find((page) => page.id === "use-cases")?.href).toBe("/use-cases");
    expect(sidebarModeForActivePage("primitives", docsPageManifest)).toBe("primitives");
    expect(sidebarModeForActivePage("ai", docsPageManifest)).toBe("agents");
    expect(sidebarModeForActivePage("use-cases", docsPageManifest)).toBe("use-cases");

    expect(pageLinks({ activeCatalogOverview: "primitives", primitives: [], extensions: [] })).toEqual(
      primitiveCategories.map((category) => ({ href: `#${category.id}`, label: category.label })),
    );
    expect(pageLinks({ activeCatalogOverview: "ai", primitives: [], extensions: [] })).toEqual([{ href: "#agents", label: "Agents" }]);
    expect(pageLinks({ activeCatalogOverview: "use-cases", primitives: [], extensions: [] })).toEqual([
      { href: "#templates", label: "Templates" },
      { href: "#patterns", label: "Patterns" },
    ]);
  });
});
