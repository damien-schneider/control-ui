import { describe, expect, test } from "bun:test";
import { blockEntries } from "@/app/(features)/catalog/blocks";
import { componentEntries } from "@/app/(features)/catalog/components";
import { extensionEntries } from "@/app/(features)/catalog/extensions";
import { primitiveEntries } from "@/app/(features)/catalog/primitives";
import { createRegistryItems } from "./registry-model";

function registryItem(name: string) {
  const item = createRegistryItems().find((candidate) => candidate.name === name);
  if (!item) throw new Error(`Missing registry item ${name}`);
  return item;
}

describe("Control UI starter registry items", () => {
  test("all follows the live component catalog and selects only the Refined skin", () => {
    const all = registryItem("all");
    const expectedDependencies = new Set([
      "core",
      "skin-refined",
      ...componentEntries.map((entry) => entry.registryKind),
      ...blockEntries.map((entry) => entry.registryKind),
      ...primitiveEntries.map((entry) => entry.paths.registry.registryKind),
    ]);

    expect(new Set(all.registryDependencies)).toEqual(expectedDependencies);
    expect(all.registryDependencies.filter((dependency) => dependency.startsWith("skin-"))).toEqual(["skin-refined"]);
    expect(all.registryDependencies).not.toEqual(expect.arrayContaining(extensionEntries.map((entry) => entry.registryKind)));
    expect(all.files).toEqual([]);
  });

  test("all wires the four Control UI styles into the host stylesheet", () => {
    expect(Object.keys(registryItem("all").css ?? {})).toEqual([
      '@import "../components/control-ui/styles/theme.css"',
      '@import "../components/control-ui/styles/effects.css"',
      '@import "../components/control-ui/styles/skin-theme.css"',
      '@import "../components/control-ui/styles/skin.css"',
    ]);
  });

  test("next-app owns only the default App Router layout and page", () => {
    const nextApp = registryItem("next-app");

    expect(nextApp.registryDependencies).toEqual(["all", "button", "core"]);
    expect(nextApp.dependencies).toEqual([]);
    expect(nextApp.files.map((file) => [file.type, file.target])).toEqual([
      ["registry:page", "~/app/layout.tsx"],
      ["registry:page", "~/app/page.tsx"],
    ]);
  });
});
