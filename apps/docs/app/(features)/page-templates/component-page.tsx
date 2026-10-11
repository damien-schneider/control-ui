"use client";

import { ComponentExamplePreview, ComponentPreview } from "@/app/(features)/components/previews";
import { installedDependencyFiles, publicRegistryHref, registryInstallCommand } from "@/app/(features)/model/registry";
import type { DocsComponent, DocsComponentExample, DocsExtension } from "@/app/(features)/model/types";
import { AvailableExtensions } from "./available-extensions";
import { type RegistryItemExample, RegistryItemPage } from "./registry-item-page";

export function ComponentPage({ component, extensions }: { component: DocsComponent; extensions: DocsExtension[] }) {
  const registryKind = component.registry.registryKind;
  const installCommand = registryInstallCommand(registryKind);
  const manifestHref = publicRegistryHref(registryKind);
  const exampleCode = component.registry.example.code;
  const supportFiles = component.registry.supportFiles ?? [];
  const dependencyFiles = installedDependencyFiles(supportFiles);

  return (
    <RegistryItemPage
      label="Components"
      title={component.name}
      summary={component.summary}
      status={component.status}
      preview={{
        code: exampleCode,
        className: component.previewClassName,
        layout: component.previewLayout ?? "centered",
        description: component.previewDescription,
        children: <ComponentPreview componentId={component.id} />,
      }}
      examples={examplesForComponent(component.id, component.registry.examples)}
      composition={component.registry.composition}
      install={{
        commands: [{ label: "Registry command", value: installCommand }],
        manifestHref,
        children: (
          <>
            The Control UI source installs this component from <code>{component.registry.source.path}</code>.
          </>
        ),
      }}
      knobs={component.registry.knobs}
      dependencies={dependencyFiles.length > 0 ? { files: dependencyFiles } : undefined}
      libraryDependencies={component.registry.registryDependencies}
      source={{ files: [component.registry.source, ...supportFiles], title: "Raw code" }}
    >
      <AvailableExtensions hostId={component.id} extensions={extensions} />
    </RegistryItemPage>
  );
}

function examplesForComponent(componentId: DocsComponent["id"], examples?: DocsComponentExample[]): RegistryItemExample[] {
  return (
    examples?.map((example) => ({
      id: example.id,
      title: example.title,
      description: example.description,
      source: example.source,
      previewClassName: example.previewClassName,
      previewLayout: example.previewLayout ?? "centered",
      children: <ComponentExamplePreview componentId={componentId} exampleId={example.id} />,
    })) ?? []
  );
}
