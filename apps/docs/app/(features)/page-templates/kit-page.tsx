"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { KitChoicePreview, KitExamplePreview, KitPreview } from "@/app/(features)/components/previews";
import {
  filesFor,
  installedDependencyFiles,
  publicRegistryHref,
  registryInstallCommands,
  supportFilesFor,
} from "@/app/(features)/model/registry";
import type {
  DocsExtension,
  DocsKit,
  DocsKitAlternative,
  DocsKitChoice,
  DocsKitVariant,
  IntegrationId,
  SourceFile,
} from "@/app/(features)/model/types";
import { AvailableExtensions } from "./available-extensions";
import { IntegrationSelect, integrationChangesCode } from "./integration";
import { KitChoicePicker } from "./kit-choice-picker";
import { RegistryItemPage } from "./registry-item-page";

type KitPageProps = {
  kit: DocsKit;
  integration: IntegrationId;
  extensions: DocsExtension[];
};

function dependencyDetails(supportFiles: SourceFile[]) {
  const dependencyFiles = installedDependencyFiles(supportFiles);
  return dependencyFiles.length > 0 ? { files: dependencyFiles } : undefined;
}

function selectedChoice<T extends DocsKitChoice>(choices: T[] | undefined, selectedId?: string | null) {
  return choices?.find((item) => item.id === selectedId) ?? choices?.[0];
}

function kitChoiceCopy(alternative?: DocsKitAlternative, variant?: DocsKitVariant) {
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

export function KitPage(props: KitPageProps) {
  if (!props.kit.alternatives && !props.kit.variants) return <KitPageContent {...props} />;

  return (
    <Suspense fallback={<KitPageContent {...props} />}>
      <SelectedKitPage {...props} />
    </Suspense>
  );
}

function SelectedKitPage(props: KitPageProps) {
  const searchParams = useSearchParams();
  const kind = props.kit.alternatives ? "alternative" : "variant";

  function selectChoice(id: string) {
    const url = new URL(window.location.href);
    if (url.searchParams.get(kind) === id) return;
    url.searchParams.set(kind, id);
    window.history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  return <KitPageContent {...props} selectedId={searchParams.get(kind)} onPick={selectChoice} />;
}

function KitPageContent({
  kit,
  integration,
  extensions,
  selectedId,
  onPick,
}: KitPageProps & { selectedId?: string | null; onPick?: (id: string) => void }) {
  const alternatives = kit.alternatives;
  const variants = kit.variants;
  const alternative = selectedChoice(alternatives, selectedId);
  const variant = selectedChoice(variants, selectedId);
  const choice = alternative ?? variant;
  const kind = alternatives ? "alternative" : "variant";
  const choices = alternatives ?? variants;
  const registryKind = alternative?.registryKind ?? kit.registryKind;
  const files = filesFor(kit, alternative);
  const usage = choice?.usage ?? kit.usage;
  const usageChangesWithIntegration = integrationChangesCode((id) => usage[id].code);

  const { installDescription, sourceDescription } = kitChoiceCopy(alternative, variant);

  return (
    <RegistryItemPage
      label="Kits"
      title={kit.name}
      summary={kit.summary}
      status={kit.status}
      beforePreview={choices && choice ? <KitChoicePicker kind={kind} choices={choices} activeId={choice.id} onPick={onPick} /> : undefined}
      preview={{
        code: choice?.example.code ?? kit.example.code,
        className: kit.previewClassName,
        layout: kit.previewLayout ?? "full",
        description: kit.previewDescription,
        children: choice ? (
          <KitChoicePreview kitId={kit.id} choiceId={choice.id} kind={kind} integration={integration} />
        ) : (
          <KitPreview kitId={kit.id} integration={integration} />
        ),
      }}
      examples={
        kit.examples?.map((example) => ({
          id: example.id,
          title: example.title,
          description: example.description,
          source: example.source,
          previewClassName: example.previewClassName,
          previewLayout: example.previewLayout ?? "centered",
          children: <KitExamplePreview kitId={kit.id} exampleId={example.id} />,
        })) ?? []
      }
      composition={kit.composition}
      install={{
        commands: registryInstallCommands(registryKind),
        manifestHref: publicRegistryHref(registryKind),
        children: installDescription,
      }}
      usageCode={usage[integration].code}
      usageControls={usageChangesWithIntegration ? <IntegrationSelect /> : undefined}
      knobs={alternative?.knobs ?? kit.knobs}
      dependencies={dependencyDetails(supportFilesFor(kit, alternative))}
      libraryDependencies={alternative?.registryDependencies ?? kit.registryDependencies}
      source={{ files, title: "Raw code", description: sourceDescription }}
    >
      <AvailableExtensions hostId={kit.id} extensions={extensions} />
    </RegistryItemPage>
  );
}
