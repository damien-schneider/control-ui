"use client";

import { getUseCaseKind } from "@/app/(features)/catalog/blocks";
import { BlockPreview } from "@/app/(features)/components/previews";
import { PreviewTabs, SourceTabs } from "@/app/(features)/components/source";
import { publicRegistryHref, registryInstallCommands } from "@/app/(features)/model/registry";
import type { DocsBlock, IntegrationId, SourceFile } from "@/app/(features)/model/types";
import { Card } from "@/components/control-ui/ui/card";
import { blockPreviewCode } from "./block-preview-code";
import {
  CompositionSection,
  InstallPanel,
  PageHeader,
  RegistryDependencyReferences,
  SectionCode,
  SectionStack,
  SectionTitle,
} from "./shared";

export function UseCasePage({ block, integration }: { block: DocsBlock; integration: IntegrationId }) {
  const kind = getUseCaseKind(block.useCaseKind);
  const commands = registryInstallCommands(block.registryKind);
  const manifestHref = publicRegistryHref(block.registryKind);
  const files = block.files;
  const previewCode = blockPreviewCode(block);
  const usageCode = block.usage[integration].code;

  return (
    <section className="docs-article">
      <PageHeader label={kind.singularLabel} title={block.name} summary={block.summary} status={block.status} />
      <PreviewTabs code={previewCode} previewClassName="block min-h-0 p-0" previewFramed={false}>
        <BlockPreview blockId={block.id} integration={integration} />
      </PreviewTabs>

      <SectionStack>
        <CompositionSection items={block.composition} />
        <InstallPanel commands={commands} manifestHref={manifestHref} />
        <SectionCode id="usage" title="Usage" code={usageCode} />
        <RegistryDependencyReferences dependencies={block.registryDependencies} />
        <section id="included-source" className="min-w-0 scroll-mt-20">
          <SectionTitle
            title="Owned source"
            description="This block’s recipe and private support files. Public dependencies stay linked above."
          />
          <div className="grid gap-2">
            {files.map((file) => (
              <BlockFile key={file.path} file={file} />
            ))}
          </div>
          <div className="mt-4 min-w-0">
            <SourceTabs files={files} />
          </div>
        </section>
      </SectionStack>
    </section>
  );
}

function BlockFile({ file }: { file: SourceFile }) {
  return (
    <Card className="min-w-0 flex-row items-center justify-between gap-4 px-4 py-3 text-body">
      <span className="font-medium">{file.label}</span>
      <code className="min-w-0 truncate text-label text-muted-foreground">{file.path}</code>
    </Card>
  );
}
