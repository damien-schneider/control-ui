"use client";

import { useState } from "react";
import { ComponentExamplePreview, ComponentVersionPreview, Preview } from "@/app/(features)/components/previews";
import { componentComposition, filesFor, publicRegistryHref, registryInstallCommands } from "@/app/(features)/model/registry";
import type { DocsComponent, DocsComponentVersion, DocsExtension, IntegrationId, RegistryKindId } from "@/app/(features)/model/types";
import { Button } from "@/components/control-ui/ui/button";
import { AvailableExtensions } from "./available-extensions";
import { RegistryItemPage } from "./registry-item-page";

function selectedVersion(versions: DocsComponentVersion[] | undefined, pickedVersionId: string | undefined) {
  if (!versions) return undefined;
  return versions.find((item) => item.id === pickedVersionId) ?? versions[0];
}

function versionCopy(version: DocsComponentVersion | undefined, versionsShareItem: boolean, registryKind: RegistryKindId) {
  if (!version) {
    return {
      installDescription: (
        <>This agent installs from the {registryKind} registry. Install the bundle with the command above, or inspect the source below.</>
      ),
      sourceDescription: "This agent's owned source and private support files",
    };
  }

  if (versionsShareItem) {
    return {
      installDescription: (
        <>
          Every version ships from this one registry item, so the install command is identical — the picker only swaps the documented
          composition; switching versions later is a call-site change, not a reinstall.
        </>
      ),
      sourceDescription: "Owned source and private support files shared by every version",
    };
  }

  return {
    installDescription: (
      <>
        Usage versions are sibling registry items sharing one export and one props contract — install the {version.label} item with the
        command above; swapping versions later is an import-path change, no call site moves.
      </>
    ),
    sourceDescription: `Owned source and private support files (${version.label} version)`,
  };
}

function dependencyDetails(files: ReturnType<typeof filesFor>) {
  const dependencyFiles = files.filter((file) => file.slot !== "component");
  if (dependencyFiles.length === 0) return undefined;
  return {
    files: dependencyFiles,
    description: "Private support files installed with this agent. Public library dependencies stay linked to their own pages.",
  };
}

export function ComponentPage({
  component,
  integration,
  extensions,
}: {
  component: DocsComponent;
  integration: IntegrationId;
  extensions: DocsExtension[];
}) {
  const [pickedVersionId, setPickedVersionId] = useState<string | undefined>(undefined);
  const version = selectedVersion(component.versions, pickedVersionId);
  const versionsShareItem = component.versions?.every((item) => item.registryKind === component.registryKind) ?? false;

  const registryKind = version?.registryKind ?? component.registryKind;
  const commands = registryInstallCommands(registryKind);
  const files = filesFor(component, version);
  const composition = componentComposition(component);
  const manifestHref = publicRegistryHref(registryKind);
  const exampleCode = version ? version.example.code : component.example.code;
  const usageCode = component.usage[integration].code;
  const { installDescription, sourceDescription } = versionCopy(version, versionsShareItem, registryKind);

  return (
    <RegistryItemPage
      label="Agents"
      title={component.name}
      summary={component.summary}
      status={component.status}
      preview={{
        code: exampleCode,
        className: component.previewClassName,
        controls:
          component.versions && version ? (
            <VersionPicker versions={component.versions} activeId={version.id} onPick={setPickedVersionId} />
          ) : undefined,
        children: (
          <div className="w-full">
            {version ? (
              <ComponentVersionPreview componentId={component.id} versionId={version.id} integration={integration} />
            ) : (
              <Preview componentId={component.id} integration={integration} />
            )}
          </div>
        ),
      }}
      examples={
        component.examples?.map((example) => ({
          id: example.id,
          title: example.title,
          description: example.description,
          source: example.source,
          previewClassName: example.previewClassName,
          children: (
            <div className="flex w-full justify-center">
              <ComponentExamplePreview componentId={component.id} exampleId={example.id} />
            </div>
          ),
        })) ?? []
      }
      composition={composition}
      compositionDescription="The preferred shape for composing the installed agent from its exported parts."
      install={{
        commands,
        manifestHref,
        subtitle: "registry",
        children: installDescription,
      }}
      usageCode={usageCode}
      knobs={component.knobs}
      dependencies={dependencyDetails(files)}
      libraryDependencies={component.registryDependencies}
      source={{
        files,
        title: "Raw code",
        description: sourceDescription,
      }}
    >
      <AvailableExtensions hostId={component.id} extensions={extensions} />
    </RegistryItemPage>
  );
}

function VersionPicker({
  versions,
  activeId,
  onPick,
}: {
  versions: DocsComponentVersion[];
  activeId: string;
  onPick: (id: string) => void;
}) {
  return (
    <>
      <span className="hidden text-caption font-medium text-muted-foreground sm:inline">Version</span>
      {versions.map((version) => {
        const active = version.id === activeId;

        return (
          <Button
            key={version.id}
            type="button"
            variant={active ? "surface" : "quiet"}
            size="xs"
            active={active}
            aria-pressed={active}
            onClick={() => onPick(version.id)}
          >
            {version.label}
          </Button>
        );
      })}
    </>
  );
}
