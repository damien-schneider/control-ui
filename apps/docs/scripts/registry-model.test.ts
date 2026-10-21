import { describe, expect, test } from "bun:test";
import { blockEntries } from "@/app/(features)/catalog/blocks";
import { componentEntries } from "@/app/(features)/catalog/components";
import { extensionEntries } from "@/app/(features)/catalog/extensions";
import { kitEntries } from "@/app/(features)/catalog/kits";
import { createRegistryItems } from "./registry-model";

const registryItems = createRegistryItems();

function registryItem(name: string) {
  const item = registryItems.find((candidate) => candidate.name === name);
  if (!item) throw new Error(`Missing registry item ${name}`);
  return item;
}

describe("Control UI starter registry items", () => {
  test("all-refined follows the live component catalog and selects only the Refined skin", () => {
    const allRefined = registryItem("all-refined");
    const expectedDependencies = new Set([
      "core",
      "skin-refined",
      "control-ui-skill",
      ...kitEntries.map((entry) => entry.registryKind),
      ...blockEntries.map((entry) => entry.registryKind),
      ...componentEntries.map((entry) => entry.paths.registry.registryKind),
    ]);

    expect(new Set(allRefined.registryDependencies)).toEqual(expectedDependencies);
    expect(allRefined.registryDependencies.filter((dependency) => dependency.startsWith("skin-"))).toEqual(["skin-refined"]);
    expect(allRefined.registryDependencies).not.toEqual(expect.arrayContaining(extensionEntries.map((entry) => entry.registryKind)));
    expect(allRefined.files).toEqual([]);
  });

  test("all aliases the Refined starter and owns no source", () => {
    const all = registryItem("all");

    expect(all.registryDependencies).toContain("core");
    expect(all.registryDependencies).toContain("button");
    expect(all.registryDependencies.some((dependency) => dependency.startsWith("skin-") || dependency.startsWith("all-"))).toBe(false);
    expect(all.files).toEqual([]);
    expect(all.css ?? {}).toEqual({});
  });

  test("all-refined wires the four Control UI styles into the host stylesheet", () => {
    expect(Object.keys(registryItem("all-refined").css ?? {})).toEqual([
      '@import "../components/control-ui/styles/theme.css"',
      '@import "../components/control-ui/styles/effects.css"',
      '@import "../components/control-ui/styles/skin-theme.css"',
      '@import "../components/control-ui/styles/skin.css"',
    ]);
  });

  test("next-app owns only the default App Router layout and page", () => {
    const nextApp = registryItem("next-app");

    expect(nextApp.registryDependencies).toEqual(["all", "button", "core", "typography"]);
    expect(nextApp.dependencies).toEqual([]);
    expect(nextApp.files.map((file) => [file.type, file.target])).toEqual([
      ["registry:page", "~/app/layout.tsx"],
      ["registry:page", "~/app/page.tsx"],
    ]);
  });
});

describe("optional accessories", () => {
  test("chat does not pull in the audio recorder, directly or through a dependency", () => {
    const installed = new Set<string>();
    const pending = ["chat"];
    for (let name = pending.pop(); name !== undefined; name = pending.pop()) {
      if (installed.has(name)) continue;
      installed.add(name);
      const item = registryItems.find((candidate) => candidate.name === name);
      if (item) pending.push(...item.registryDependencies);
    }
    const installedFiles = registryItems.filter((item) => installed.has(item.name)).flatMap((item) => item.files.map((file) => file.path));

    expect(installed.has("chat-composer")).toBe(true);
    expect(installed.has("audio-recorder")).toBe(false);
    expect(installedFiles.filter((file) => file.includes("audio-recorder"))).toEqual([]);
  });
});

describe("recipe cascade order", () => {
  test("shared popup foundations load before focused recipe modules", () => {
    expect(Object.keys(registryItem("tooltip").css ?? {})).toEqual([
      '@import "../components/control-ui/styles/recipes/popup.css"',
      '@import "../components/control-ui/styles/recipes/popup-controls.css"',
      '@import "../components/control-ui/styles/recipes/popup-lists.css"',
      '@import "../components/control-ui/styles/recipes/popup-motion.css"',
    ]);
  });

  test("dynamic notification foundations load before input and motion modules", () => {
    expect(Object.keys(registryItem("dynamic-notification").css ?? {}).filter((entry) => entry.includes("/recipes/"))).toEqual([
      '@import "../components/control-ui/styles/recipes/dynamic-notification.css"',
      '@import "../components/control-ui/styles/recipes/dynamic-notification-input.css"',
      '@import "../components/control-ui/styles/recipes/dynamic-notification-motion.css"',
    ]);
  });
});
