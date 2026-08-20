import { describe, expect, test } from "bun:test";
import { getDocsData } from "@/app/(features)/model/data";
import { filesFor } from "@/app/(features)/model/registry";
import { documentedRegistryFiles, installedRegistryFiles } from "@/app/(features)/model/registry-source-files";

describe("registry source closure", () => {
  test("shows DynamicNotification support code without duplicating public dependencies", () => {
    const component = getDocsData().components.find((candidate) => candidate.id === "dynamic-notification");
    if (!component) throw new Error("Missing DynamicNotification docs entry");

    const displayedPaths = filesFor(component).map((file) => file.path);
    const documentedPaths = documentedRegistryFiles(component.registryKind).map((file) => file.path);
    const installedPaths = installedRegistryFiles(component.registryKind).map((file) => file.path);

    expect(new Set(displayedPaths)).toEqual(new Set(documentedPaths));
    expect(displayedPaths).toEqual(
      expect.arrayContaining([
        "src/registry/sources/control-ui/dynamic-notification-glass.ts",
        "src/registry/sources/control-ui/dynamic-notification-liquid.ts",
        "src/registry/sources/control-ui/dynamic-notification-siri-wave.ts",
        "src/registry/lib/liquid-glass-optics.ts",
        "src/registry/sources/control-ui/recipes/dynamic-notification.css",
      ]),
    );
    expect(installedPaths).toContain("src/registry/sources/control-ui/ui/button.tsx");
    expect(displayedPaths).not.toContain("src/registry/sources/control-ui/ui/button.tsx");
    expect(displayedPaths).not.toContain("src/registry/contracts.ts");
    expect(component.registryDependencies.map((dependency) => dependency.registryKind)).toEqual(["button"]);
  });

  test("discovers ChatComposer's transitive serializer from the registry graph", () => {
    const component = getDocsData().components.find((candidate) => candidate.id === "chat-composer");
    if (!component) throw new Error("Missing ChatComposer docs entry");

    expect(filesFor(component).map((file) => file.path)).toContain("src/registry/sources/control-ui/chat-composer-editor/serialize.ts");
  });
});
