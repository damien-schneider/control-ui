"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ComponentChoicePreview, ComponentExamplePreview, Preview } from "@/app/(features)/components/previews";
import {
  filesFor,
  installedDependencyFiles,
  publicRegistryHref,
  registryInstallCommands,
  supportFilesFor,
} from "@/app/(features)/model/registry";
import type {
  DocsComponent,
  DocsComponentAlternative,
  DocsComponentChoice,
  DocsComponentVariant,
  DocsExtension,
  IntegrationId,
  SourceFile,
} from "@/app/(features)/model/types";
import { AvailableExtensions } from "./available-extensions";
import { ComponentChoicePicker } from "./component-choice-picker";
import { IntegrationSelect, integrationChangesCode } from "./integration";
import { RegistryItemPage } from "./registry-item-page";

type ComponentPageProps = {
  component: DocsComponent;
  integration: IntegrationId;
  extensions: DocsExtension[];
};

function dependencyDetails(supportFiles: SourceFile[]) {
  const dependencyFiles = installedDependencyFiles(supportFiles);
  return dependencyFiles.length > 0 ? { files: dependencyFiles } : undefined;
}

function selectedChoice<T extends DocsComponentChoice>(choices: T[] | undefined, selectedId?: string | null) {
  return choices?.find((item) => item.id === selectedId) ?? choices?.[0];
}

function componentChoiceCopy(alternative?: DocsComponentAlternative, variant?: DocsComponentVariant) {
  let installDescription = <>Use this command to install the component.</>;
  let sourceDescription = "Installed component source and support files";
  if (alternative) {
    installDescription = (
      <>
        Install the <strong>{alternative.label}</strong> alternative. To adopt another implementation, install its registry item and update
        the import in your project. Check its data requirements and options in Usage.
      </>
    );
    sourceDescription = `Installed source for the ${alternative.label} alternative`;
  } else if (variant) {
    installDescription = <>All variants use this installation. Choose the appearance with the variant prop and its optional parts.</>;
    sourceDescription = "Installed source shared by all variants";
  }

  return { installDescription, sourceDescription };
}

export function ComponentPage(props: ComponentPageProps) {
  if (!props.component.alternatives && !props.component.variants) return <ComponentPageContent {...props} />;

  return (
    <Suspense fallback={<ComponentPageContent {...props} />}>
      <SelectedComponentPage {...props} />
    </Suspense>
  );
}

function SelectedComponentPage(props: ComponentPageProps) {
  const searchParams = useSearchParams();
  const kind = props.component.alternatives ? "alternative" : "variant";

  function selectChoice(id: string) {
    const url = new URL(window.location.href);
    if (url.searchParams.get(kind) === id) return;
    url.searchParams.set(kind, id);
    window.history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  return <ComponentPageContent {...props} selectedId={searchParams.get(kind)} onPick={selectChoice} />;
}

function ComponentPageContent({
  component,
  integration,
  extensions,
  selectedId,
  onPick,
}: ComponentPageProps & { selectedId?: string | null; onPick?: (id: string) => void }) {
  const alternatives = component.alternatives;
  const variants = component.variants;
  const alternative = selectedChoice(alternatives, selectedId);
  const variant = selectedChoice(variants, selectedId);
  const choice = alternative ?? variant;
  const kind = alternatives ? "alternative" : "variant";
  const choices = alternatives ?? variants;
  const registryKind = alternative?.registryKind ?? component.registryKind;
  const files = filesFor(component, alternative);
  const usage = choice?.usage ?? component.usage;
  const usageChangesWithIntegration = integrationChangesCode((id) => usage[id].code);

  const { installDescription, sourceDescription } = componentChoiceCopy(alternative, variant);

  return (
    <RegistryItemPage
      label="Components"
      title={component.name}
      summary={component.summary}
      status={component.status}
      beforePreview={
        choices && choice ? <ComponentChoicePicker kind={kind} choices={choices} activeId={choice.id} onPick={onPick} /> : undefined
      }
      preview={{
        code: choice?.example.code ?? component.example.code,
        className: component.previewClassName,
        layout: component.previewLayout ?? "full",
        description: component.previewDescription,
        children: choice ? (
          <ComponentChoicePreview componentId={component.id} choiceId={choice.id} kind={kind} integration={integration} />
        ) : (
          <Preview componentId={component.id} integration={integration} />
        ),
      }}
      examples={
        component.examples?.map((example) => ({
          id: example.id,
          title: example.title,
          description: example.description,
          source: example.source,
          previewClassName: example.previewClassName,
          previewLayout: example.previewLayout ?? "centered",
          children: <ComponentExamplePreview componentId={component.id} exampleId={example.id} />,
        })) ?? []
      }
      composition={component.composition}
      install={{
        commands: registryInstallCommands(registryKind),
        manifestHref: publicRegistryHref(registryKind),
        children: installDescription,
      }}
      usageCode={usage[integration].code}
      usageControls={usageChangesWithIntegration ? <IntegrationSelect /> : undefined}
      knobs={alternative?.knobs ?? component.knobs}
      dependencies={dependencyDetails(supportFilesFor(component, alternative))}
      libraryDependencies={alternative?.registryDependencies ?? component.registryDependencies}
      source={{ files, title: "Raw code", description: sourceDescription }}
    >
      <AvailableExtensions hostId={component.id} extensions={extensions} />
    </RegistryItemPage>
  );
}
