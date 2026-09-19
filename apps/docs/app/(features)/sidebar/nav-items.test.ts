import { describe, expect, test } from "bun:test";
import { blockEntries, useCaseKinds } from "@/app/(features)/catalog/blocks";
import { componentEntries } from "@/app/(features)/catalog/components";
import { extensionEntries } from "@/app/(features)/catalog/extensions";
import { hookEntries, utilEntries } from "@/app/(features)/catalog/hooks-utils";
import { primitiveCategories, primitiveEntries } from "@/app/(features)/catalog/primitives";
import { catalogNavGroups, getUseCaseNavGroups, humanizeNavName } from "./nav-items";

const navGroups = catalogNavGroups({
  components: componentEntries,
  primitives: primitiveEntries,
  hooks: hookEntries,
  utils: utilEntries,
  extensions: extensionEntries,
});

describe("catalogNavGroups", () => {
  test("lists agents beside every primitive category and the support groups", () => {
    expect(navGroups.map((group) => group.id)).toEqual([
      "agents",
      ...primitiveCategories.map((category) => category.id),
      "hooks",
      "utils",
      "extensions",
    ]);
    expect(
      navGroups
        .find((group) => group.id === "agents")
        ?.items.map((item) => item.id)
        .toSorted(),
    ).toEqual(componentEntries.map((entry) => entry.id).toSorted());
  });

  test("renders every primitive once in its catalog category", () => {
    const primitiveGroups = navGroups.filter((group) => group.prefix === "/primitives/");
    const itemIds = primitiveGroups.flatMap((group) => group.items.map((item) => item.id));

    expect(itemIds.toSorted()).toEqual(primitiveEntries.map((entry) => entry.id).toSorted());
    expect(new Set(itemIds).size).toBe(primitiveEntries.length);
  });

  test("keeps items alphabetical inside each catalog group", () => {
    const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

    const sortedGroups = navGroups.filter(({ prefix }) => prefix === "/ai/" || prefix === "/primitives/");

    for (const group of sortedGroups) {
      const names = group.items.map((item) => humanizeNavName(item.name));
      expect(names).toEqual([...names].sort((a, b) => collator.compare(a, b)));
    }
  });
});

describe("getUseCaseNavGroups", () => {
  test("renders every block once in taxonomy order", () => {
    const groups = getUseCaseNavGroups(blockEntries);
    const itemIds = groups.flatMap((group) => group.items.map((item) => item.id));

    expect(groups.map((group) => group.id)).toEqual(useCaseKinds.map((kind) => kind.slug));
    expect(itemIds).toHaveLength(blockEntries.length);
    expect(new Set(itemIds).size).toBe(blockEntries.length);
    expect(itemIds.toSorted()).toEqual(blockEntries.map((entry) => entry.id).toSorted());
  });

  test("keeps items alphabetical inside each group", () => {
    const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });
    const groups = getUseCaseNavGroups(blockEntries);

    for (const group of groups) {
      const names = group.items.map((item) => humanizeNavName(item.name));
      expect(names).toEqual([...names].sort((a, b) => collator.compare(a, b)));
    }
  });
});
