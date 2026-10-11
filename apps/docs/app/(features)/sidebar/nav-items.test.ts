import { describe, expect, test } from "bun:test";
import { blockEntries, templateKinds } from "@/app/(features)/catalog/blocks";
import { catalogCategories } from "@/app/(features)/catalog/categories";
import { componentEntries } from "@/app/(features)/catalog/components";
import { extensionEntries } from "@/app/(features)/catalog/extensions";
import { hookEntries, utilEntries } from "@/app/(features)/catalog/hooks-utils";
import { kitEntries } from "@/app/(features)/catalog/kits";
import { catalogNavGroups, getTemplateNavGroups, humanizeNavName } from "./nav-items";

const navGroups = catalogNavGroups({
  kits: kitEntries,
  components: componentEntries,
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

  test("renders every kit and component once, in its category, under its own route", () => {
    const items = navGroups.flatMap((group) => group.items);
    const kitItems = items.filter((item) => item.href.startsWith("/kits/"));
    const componentItems = items.filter((item) => item.href.startsWith("/components/"));

    expect(kitItems.map((item) => item.id).toSorted()).toEqual(kitEntries.map((entry) => entry.id).toSorted());
    expect(componentItems.map((item) => item.id).toSorted()).toEqual(componentEntries.map((entry) => entry.id).toSorted());
    expect(items.map((item) => item.href)).toEqual([...new Set(items.map((item) => item.href))]);
  });

  test("groups a kit with the components that share its category", () => {
    const feedback = navGroups.find((group) => group.id === "feedback");

    expect(feedback?.items.map((item) => item.href)).toContain("/kits/dynamic-notification");
    expect(feedback?.items.map((item) => item.href)).toContain("/components/toast");
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

describe("getTemplateNavGroups", () => {
  test("renders every block once in taxonomy order", () => {
    const groups = getTemplateNavGroups(blockEntries);
    const itemIds = groups.flatMap((group) => group.items.map((item) => item.id));

    expect(groups.map((group) => group.id)).toEqual(templateKinds.map((kind) => kind.slug));
    expect(itemIds).toHaveLength(blockEntries.length);
    expect(new Set(itemIds).size).toBe(blockEntries.length);
    expect(itemIds.toSorted()).toEqual(blockEntries.map((entry) => entry.id).toSorted());
  });

  test("keeps items alphabetical inside each group", () => {
    const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });
    const groups = getTemplateNavGroups(blockEntries);

    for (const group of groups) {
      const names = group.items.map((item) => humanizeNavName(item.name));
      expect(names).toEqual([...names].sort((a, b) => collator.compare(a, b)));
    }
  });
});
