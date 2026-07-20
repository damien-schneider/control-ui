"use client";

import Link from "next/link";
import { getUseCaseKind } from "@/app/(features)/catalog/blocks";
import { BlockPreview } from "@/app/(features)/components/previews";
import { PreviewTabs } from "@/app/(features)/components/source";
import { componentHrefForFile, publicRegistryHref, registryInstallCommands } from "@/app/(features)/model/registry";
import type { DocsBlock, IntegrationId, SourceFile } from "@/app/(features)/model/types";
import { cn } from "@/components/control-ui/lib/cn";
import { blockPreviewCode } from "./block-preview-code";
import { CompositionSection, InstallPanel, PageHeader, SectionCode, SectionTitle } from "./shared";

export function UseCasePage({ block, integration }: { block: DocsBlock; integration: IntegrationId }) {
  const kind = getUseCaseKind(block.useCaseKind);
  const commands = registryInstallCommands(block.registryKind);
  const manifestHref = publicRegistryHref(block.registryKind);
  const files = block.files;
  const previewCode = blockPreviewCode(block);
  const usageCode = block.usage[integration].code;
  const composition = block.composition ?? [];

  return (
    <section className="mx-auto min-w-0 w-full max-w-4xl px-5 py-12">
      <PageHeader label={kind.singularLabel} title={block.name} summary={block.summary} status={block.status} wide />
      <PreviewTabs code={previewCode} codeTitle={`${kind.singularLabel} source`} previewClassName="">
        <BlockPreview blockId={block.id} integration={integration} />
      </PreviewTabs>

      <div className="grid min-w-0 gap-10">
        <CompositionSection
          items={composition}
          description={`How this ${kind.singularLabel.toLowerCase()} nests its exported parts and installed Control UI sources.`}
        />
        <InstallPanel commands={commands} manifestHref={manifestHref} subtitle="registry" />
        <SectionCode id="usage" title="Usage" code={usageCode} />
        <section id="included-source" className="min-w-0 scroll-mt-20">
          <SectionTitle
            title="Included source"
            description="The registry command installs this recipe and every listed dependency in one pass."
          />
          <div className="grid gap-2">
            {files.map((file) => (
              <BlockFile key={file.path} file={file} />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function BlockFile({ file }: { file: SourceFile }) {
  const href = componentHrefForFile(file);
  const content = (
    <>
      <span className="font-medium">{file.label}</span>
      <code className="min-w-0 truncate text-label text-muted-foreground">{file.path}</code>
    </>
  );
  const className =
    "flex min-w-0 items-center justify-between gap-4 rounded-xl border border-border/70 bg-card px-4 py-3 text-body shadow-sm";

  return href ? (
    <Link href={href} className={cn(className, "transition hover:border-foreground/20 hover:bg-muted/30")}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}
