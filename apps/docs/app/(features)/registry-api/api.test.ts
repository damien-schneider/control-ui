import { describe, expect, mock, test } from "bun:test";
import { skinMetas } from "@/app/(features)/catalog/skins";

mock.module("server-only", () => ({}));
const { getRegistryItem } = await import("./api");
const { listRegistry } = await import("./registry-index");

describe("registry anatomy discovery", () => {
  test("the agent index links the full skin and theme contracts", () => {
    const index = listRegistry();
    expect(index.data.contracts.skin).toEndWith("/r/skin-contract.json");
    expect(index.data.contracts.theme).toEndWith("/r/theme-contract.json");
  });

  test("the agent index exposes one full-install manifest per skin", () => {
    const index = listRegistry();
    expect(index.data.fullInstalls.map((bundle) => bundle.skin)).toEqual(skinMetas.map((skin) => skin.id));
    expect(index.data.fullInstalls.every((bundle) => bundle.install.endsWith(`/r/${bundle.id}.json`))).toBe(true);
  });

  test("full-install bundles are inspectable through the item API", () => {
    const result = getRegistryItem("all-linear");
    if ("error" in result) throw new Error(result.error);
    expect(result.data.kind).toBe("Bundle");
    expect(result.data.manifestUrl).toEndWith("/r/all-linear.json");
    expect(result.data.deps?.registryDependencies).toContain("skin-linear");
    expect(result.data.anatomy?.installedScopes.select).toBeDefined();
  });

  test("an item separates its own anatomy from installed dependency anatomy", () => {
    const result = getRegistryItem("code-diff");
    if ("error" in result) throw new Error(result.error);
    expect(result.data.anatomy?.version).toBe(5);
    expect("root" in (result.data.anatomy?.ownScopes["code-diff"].parts ?? {})).toBe(true);
    expect(result.data.anatomy?.ownScopes.button).toBeUndefined();
    expect(result.data.anatomy?.installedScopes.button).toBeDefined();
    expect(result.data.anatomy?.installedScopes.code).toBeDefined();
    expect(result.data.anatomy?.contractUrl).toEndWith("/r/skin-contract.json");
  });

  test("an item owns only the foreign-scope parts it actually emits", () => {
    const result = getRegistryItem("select");
    if ("error" in result) throw new Error(result.error);
    const ownButtonParts = result.data.anatomy?.ownScopes.button?.parts ?? {};
    const installedButtonParts = result.data.anatomy?.installedScopes.button?.parts ?? {};
    expect("content" in ownButtonParts).toBe(true);
    expect("root" in ownButtonParts).toBe(false);
    expect("root" in installedButtonParts).toBe(false);
  });
});
