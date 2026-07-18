"use client";

import Link from "next/link";
import { useState } from "react";
import { ComponentExamplePreview, ComponentVersionPreview, Preview } from "@/app/(features)/components/previews";
import {
  componentComposition,
  filesFor,
  publicRegistryHref,
  registryInstallCommands,
  resolvePrimitives,
} from "@/app/(features)/model/registry";
import type {
  DocsComponent,
  DocsComponentVersion,
  DocsExtension,
  DocsPrimitive,
  IntegrationId,
  RegistryKindId,
} from "@/app/(features)/model/types";
import { Badge } from "@/components/control-ui/ui/badge";
import { Button } from "@/components/control-ui/ui/button";
import { AvailableExtensions } from "./available-extensions";
import { RegistryItemPage } from "./registry-item-page";
import { SectionTitle } from "./shared";

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
      sourceDescription: "Primary installed agent source",
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
      sourceDescription: "Primary installed agent source (shared by every version)",
    };
  }

  return {
    installDescription: (
      <>
        Usage versions are sibling registry items sharing one export and one props contract — install the {version.label} item with the
        command above; swapping versions later is an import-path change, no call site moves.
      </>
    ),
    sourceDescription: `Primary installed agent source (${version.label} version)`,
  };
}

function dependencyDetails(files: ReturnType<typeof filesFor>) {
  const dependencyFiles = files.filter((file) => file.slot !== "component");
  if (dependencyFiles.length === 0) return undefined;
  return {
    files: dependencyFiles,
    description:
      "Installed with this agent because the visible component depends on them; they are support files, not separate product surfaces.",
  };
}

export function ComponentPage({
  component,
  integration,
  primitives,
  extensions,
}: {
  component: DocsComponent;
  integration: IntegrationId;
  primitives: DocsPrimitive[];
  extensions: DocsExtension[];
}) {
  const [pickedVersionId, setPickedVersionId] = useState<string | undefined>(undefined);
  const version = selectedVersion(component.versions, pickedVersionId);
  const versionsShareItem = component.versions?.every((item) => item.registryKind === component.registryKind) ?? false;

  const registryKind = version?.registryKind ?? component.registryKind;
  const commands = registryInstallCommands(registryKind);
  const files = filesFor(component);
  const usedPrimitives = resolvePrimitives(component, primitives);
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
      dependencies={dependencyDetails(files)}
      source={{
        files: [version ? version.source : component.source],
        title: "Raw code",
        description: sourceDescription,
      }}
    >
      <AvailableExtensions hostId={component.id} extensions={extensions} />
      <PrimitiveReferences primitives={usedPrimitives} />
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

function PrimitiveReferences({ primitives }: { primitives: DocsPrimitive[] }) {
  if (primitives.length === 0) return null;

  return (
    <section id="primitives" className="min-w-0 scroll-mt-20">
      <SectionTitle
        title="Primitives"
        description="This agent composes these library primitives, installed under components/control-ui/ui/*."
      />
      <div className="grid gap-2">
        {primitives.map((primitive) => (
          <PrimitiveLink key={primitive.id} primitive={primitive} />
        ))}
      </div>
    </section>
  );
}

function PrimitiveLink({ primitive }: { primitive: DocsPrimitive }) {
  return (
    <Link
      href={`/primitives/${primitive.id}`}
      className="flex min-w-0 items-center justify-between gap-4 rounded-xl border border-border/70 bg-card px-4 py-3 text-body shadow-sm transition hover:border-foreground/20 hover:bg-muted/30"
    >
      <span className="flex min-w-0 items-center gap-2">
        <span className="font-medium">{primitive.name}</span>
        <code className="min-w-0 truncate text-label text-muted-foreground">{primitive.registry.target}</code>
      </span>
      <Badge variant="outline" size="sm">
        Library slot
      </Badge>
    </Link>
  );
}
