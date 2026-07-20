import { describe, expect, test } from "bun:test";
import { blockEntries, useCaseKinds } from "@/app/(features)/catalog/blocks";
import { primitiveCategories, primitiveEntries } from "@/app/(features)/catalog/primitives";
import { humanizeNavName, primitiveNavGroups, useCaseNavGroups } from "./nav-items";

const navPrimitives = primitiveEntries.map((entry) => ({
  id: entry.id,
  category: entry.category,
  name: entry.name,
}));

describe("primitiveNavGroups", () => {
  test("renders every primitive once in the catalog category order", () => {
    const groups = primitiveNavGroups(navPrimitives);
    const itemIds = groups.flatMap((group) => group.items.map((item) => item.id));
    const expectedCategoryCounts = primitiveCategories.map(
      (category) => navPrimitives.filter((primitive) => primitive.category === category.id).length,
    );

    expect(groups.map((group) => group.id)).toEqual(primitiveCategories.map((category) => category.id));
    expect(groups.map((group) => group.items.length)).toEqual(expectedCategoryCounts);
    expect(itemIds).toHaveLength(primitiveEntries.length);
    expect(new Set(itemIds).size).toBe(primitiveEntries.length);
  });

  test("keeps items alphabetical inside each category", () => {
    const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

    for (const group of primitiveNavGroups(navPrimitives)) {
      const names = group.items.map((item) => humanizeNavName(item.name));
      expect(names).toEqual([...names].sort((a, b) => collator.compare(a, b)));
    }
  });
});

describe("useCaseNavGroups", () => {
  test("renders every block once in taxonomy order", () => {
    const groups = useCaseNavGroups(blockEntries);
    const itemIds = groups.flatMap((group) => group.items.map((item) => item.id));

    expect(groups.map((group) => group.id)).toEqual(useCaseKinds.map((kind) => kind.slug));
    expect(itemIds).toHaveLength(blockEntries.length);
    expect(new Set(itemIds).size).toBe(blockEntries.length);
    expect(itemIds.toSorted()).toEqual(blockEntries.map((entry) => entry.id).toSorted());
  });

  test("keeps items alphabetical inside each group", () => {
    const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });
    const groups = useCaseNavGroups(blockEntries);

    for (const group of groups) {
      const names = group.items.map((item) => humanizeNavName(item.name));
      expect(names).toEqual([...names].sort((a, b) => collator.compare(a, b)));
    }
  });
});
