import { describe, expect, test } from "bun:test";
import { blockEntries, useCaseKinds } from "@/app/(features)/catalog/blocks";
import { catalogCategories } from "@/app/(features)/catalog/categories";
import { componentEntries } from "@/app/(features)/catalog/components";
import { extensionEntries } from "@/app/(features)/catalog/extensions";
import { hookEntries, utilEntries } from "@/app/(features)/catalog/hooks-utils";
import { primitiveEntries } from "@/app/(features)/catalog/primitives";
import { catalogNavGroups, getUseCaseNavGroups, humanizeNavName } from "./nav-items";

const navGroups = catalogNavGroups({
  components: componentEntries,
  primitives: primitiveEntries,
  hooks: hookEntries,
  utils: utilEntries,
  extensions: extensionEntries,
});

describe("catalogNavGroups", () => {
  test("lists every catalog category beside the support groups", () => {
    expect(navGroups.map((group) => group.id)).toEqual([
      ...catalogCategories.map((category) => category.id),
      "hooks",
      "utils",
      "extensions",
    ]);
  });

  test("renders every component and primitive once, in its category, under its own route", () => {
    const items = navGroups.flatMap((group) => group.items);
    const componentItems = items.filter((item) => item.href.startsWith("/components/"));
    const primitiveItems = items.filter((item) => item.href.startsWith("/primitives/"));

    expect(componentItems.map((item) => item.id).toSorted()).toEqual(componentEntries.map((entry) => entry.id).toSorted());
    expect(primitiveItems.map((item) => item.id).toSorted()).toEqual(primitiveEntries.map((entry) => entry.id).toSorted());
    expect(items.map((item) => item.href)).toEqual([...new Set(items.map((item) => item.href))]);
  });

  test("groups a component with the primitives that share its category", () => {
    const feedback = navGroups.find((group) => group.id === "feedback");

    expect(feedback?.items.map((item) => item.href)).toContain("/components/dynamic-notification");
    expect(feedback?.items.map((item) => item.href)).toContain("/primitives/toast");
  });

  test("keeps items alphabetical inside each catalog group", () => {
    const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

    const categoryGroups = navGroups.filter((navGroup) => catalogCategories.some((category) => category.id === navGroup.id));

    for (const group of categoryGroups) {
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
