"use client";

import { PrimitiveExamplePreview, PrimitivePreview } from "@/app/(features)/components/previews";
import { primitiveComposition, publicRegistryHref, registryInstallCommand } from "@/app/(features)/model/registry";
import type { DocsExtension, DocsPrimitive, DocsPrimitiveExample } from "@/app/(features)/model/types";
import { AvailableExtensions } from "./available-extensions";
import { type RegistryItemExample, RegistryItemPage } from "./registry-item-page";

export function PrimitivePage({ primitive, extensions }: { primitive: DocsPrimitive; extensions: DocsExtension[] }) {
  const registryKind = primitive.registry.registryKind;
  const installCommand = registryInstallCommand(registryKind);
  const manifestHref = publicRegistryHref(registryKind);
  const exampleCode = primitive.registry.example.code;
  const supportFiles = primitive.registry.supportFiles ?? [];
  const composition = primitiveComposition(primitive);

  return (
    <RegistryItemPage
      label="Primitives"
      title={primitive.name}
      summary={primitive.summary}
      status={primitive.status}
      preview={{
        code: exampleCode,
        children: (
          <div className="flex w-full justify-center">
            <PrimitivePreview primitiveId={primitive.id} />
          </div>
        ),
      }}
      examples={examplesForPrimitive(primitive.id, primitive.registry.examples)}
      composition={composition}
      compositionDescription="The preferred shape for composing the installed primitive from its exported parts."
      install={{
        commands: [{ label: "Registry command", value: installCommand }],
        manifestHref,
        subtitle: "Control UI",
        children: (
          <>
            The Control UI source installs this primitive from <code>{primitive.registry.source.path}</code>. Install it on its own with the
            command above, or inspect the source below.
          </>
        ),
      }}
      dependencies={
        supportFiles.length > 0
          ? {
              files: supportFiles,
              description:
                "Installed with this primitive because the slot depends on them; they are support files, not standalone sidebar items.",
            }
          : undefined
      }
      source={{
        files: [primitive.registry.source],
        title: "Raw code",
        description: "Primary installed primitive source",
      }}
    >
      <AvailableExtensions hostId={primitive.id} extensions={extensions} />
    </RegistryItemPage>
  );
}

function examplesForPrimitive(primitiveId: DocsPrimitive["id"], examples?: DocsPrimitiveExample[]): RegistryItemExample[] {
  return (
    examples?.map((example) => ({
      id: example.id,
      title: example.title,
      description: example.description,
      source: example.source,
      previewClassName: example.previewClassName,
      children: (
        <div className="flex w-full justify-center">
          <PrimitiveExamplePreview primitiveId={primitiveId} exampleId={example.id} />
        </div>
      ),
    })) ?? []
  );
}
