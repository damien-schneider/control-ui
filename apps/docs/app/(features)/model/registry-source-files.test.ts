import { describe, expect, test } from "bun:test";
import { getDocsData } from "@/app/(features)/model/data";
import { filesFor, installedDependencyFiles, supportFilesFor } from "@/app/(features)/model/registry";
import { documentedRegistryFiles, installedRegistryFiles } from "@/app/(features)/model/registry-source-files";

describe("registry source closure", () => {
  test("shows DynamicNotification support code without duplicating public dependencies", () => {
    const component = getDocsData().components.find((candidate) => candidate.id === "dynamic-notification");
    if (!component) throw new Error("Missing DynamicNotification docs entry");

    const displayedPaths = filesFor(component).map((file) => file.path);
    const documentedPaths = documentedRegistryFiles(component.registryKind).map((file) => file.path);
    const installedPaths = installedRegistryFiles(component.registryKind).map((file) => file.path);

    const knobContract = "src/registry/knob-contracts/dynamic-notification-knobs.ts";
    expect(new Set(displayedPaths)).toEqual(new Set(documentedPaths.filter((path) => path !== knobContract)));
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

describe("installed dependency rows", () => {
  test("never repeat a file another docs page owns", () => {
    const data = getDocsData();
    const ownerByPath = new Map<string, string>([
      ...data.primitives.map((primitive) => [primitive.registry.source.path, `/primitives/${primitive.id}`] as const),
      ...data.components.map((component) => [component.source.path, `/ai/${component.id}`] as const),
    ]);
    const rows = [
      ...data.primitives.map((primitive) => ({
        page: `/primitives/${primitive.id}`,
        files: installedDependencyFiles(primitive.registry.supportFiles ?? []),
      })),
      ...data.components.map((component) => ({ page: `/ai/${component.id}`, files: installedDependencyFiles(supportFilesFor(component)) })),
    ];

    const repeated = rows.flatMap(({ page, files }) =>
      files.filter((file) => (ownerByPath.get(file.path) ?? page) !== page).map((file) => `${page} lists ${file.path}`),
    );

    expect(repeated).toEqual([]);
  });
});

describe("knob family ownership", () => {
  test("a page browses its own family recipe and none of the families it only consumes", () => {
    const data = getDocsData();
    const paths = (primitiveId: string) => {
      const primitive = data.primitives.find((candidate) => candidate.id === primitiveId);
      if (!primitive) throw new Error(`Missing ${primitiveId} docs entry`);
      return [primitive.registry.source, ...(primitive.registry.supportFiles ?? [])].map((file) => file.path);
    };

    expect(paths("button")).toContain("src/registry/sources/control-ui/recipes/button.css");
    expect(paths("menubar")).toEqual([
      "src/registry/sources/control-ui/ui/menubar.tsx",
      "src/registry/sources/control-ui/surface-variants.ts",
      "src/registry/sources/control-ui/control-variants.ts",
    ]);
  });

  test("links a consumed family to the page that owns it", () => {
    const menubar = getDocsData().primitives.find((candidate) => candidate.id === "menubar");
    if (!menubar) throw new Error("Missing Menubar docs entry");

    expect(menubar.registry.knobs.map((family) => [family.id, family.href])).toEqual([
      ["button", "/primitives/button"],
      ["popup", undefined],
    ]);
  });

  test("keeps the owned recipe out of the installed rows", () => {
    const button = getDocsData().primitives.find((candidate) => candidate.id === "button");
    if (!button) throw new Error("Missing Button docs entry");

    expect(installedDependencyFiles(button.registry.supportFiles ?? []).map((file) => file.path)).toEqual([
      "src/registry/sources/control-ui/control-variants.ts",
    ]);
  });
});
