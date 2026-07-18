"use client";

import type { ReactNode } from "react";

import { PreviewTabs, SourceTabs } from "@/app/(features)/components/source";
import type { CompositionExample, DocsStatus, SourceFile } from "@/app/(features)/model/types";
import { CompositionSection, InstallPanel, PageHeader, SectionCode, SectionTitle, SupportFiles } from "./shared";

type RegistryItemPreview = {
  code: string;
  children: ReactNode;
  controls?: ReactNode;
  className?: string;
};

export type RegistryItemExample = {
  id: string;
  title: string;
  description?: string;
  source: SourceFile;
  previewClassName?: string;
  children: ReactNode;
};

type RegistryItemFileSection = {
  files: SourceFile[];
  description: string;
  id?: string;
  title?: string;
  installCommand?: string;
  usage?: { description: string; code: string };
};

type RegistryItemSourceSection = {
  files: SourceFile[];
  title?: string;
  description?: string;
};

type RegistryItemInstall = {
  commands: Array<{ label: string; value: string }>;
  manifestHref: string;
  subtitle: string;
  children?: ReactNode;
};

const emptyRegistryItemExamples: RegistryItemExample[] = [];

export function RegistryItemPage({
  label,
  title,
  summary,
  status,
  preview,
  examples = emptyRegistryItemExamples,
  composition,
  compositionDescription,
  install,
  usageCode,
  dependencies,
  source,
  children,
}: {
  label: string;
  title: string;
  summary: string;
  status?: DocsStatus;
  preview: RegistryItemPreview;
  examples?: RegistryItemExample[];
  composition: CompositionExample[];
  compositionDescription: string;
  install: RegistryItemInstall;
  usageCode?: string;
  dependencies?: RegistryItemFileSection;
  source?: RegistryItemSourceSection;
  children?: ReactNode;
}) {
  return (
    <section className="mx-auto min-w-0 w-full max-w-3xl px-5 py-12">
      <PageHeader label={label} title={title} summary={summary} status={status} />
      <PreviewTabs code={preview.code} controls={preview.controls} previewClassName={preview.className}>
        {preview.children}
      </PreviewTabs>

      <RegistryItemExamples examples={examples} />

      <div className="grid min-w-0 gap-10">
        <CompositionSection items={composition} description={compositionDescription} />
        <InstallPanel commands={install.commands} manifestHref={install.manifestHref} subtitle={install.subtitle}>
          {install.children}
        </InstallPanel>
        {usageCode ? <SectionCode id="usage" title="Usage" code={usageCode} /> : null}
        {dependencies ? <SupportFiles {...dependencies} /> : null}
        {source ? <RegistryItemSource {...source} /> : null}
        {children}
      </div>
    </section>
  );
}

function RegistryItemExamples({ examples }: { examples: RegistryItemExample[] }) {
  if (examples.length === 0) return null;

  return (
    <section id="examples" className="mb-10 min-w-0 scroll-mt-20">
      <SectionTitle title="Examples" />
      <div className="grid min-w-0 gap-8">
        {examples.map((example) => (
          <section key={example.id} id={`example-${example.id}`} className="min-w-0 scroll-mt-20">
            <SectionTitle title={example.title} description={example.description} />
            <PreviewTabs anchorId={null} code={example.source.code} previewClassName={example.previewClassName}>
              {example.children}
            </PreviewTabs>
          </section>
        ))}
      </div>
    </section>
  );
}

function RegistryItemSource({ files, title = "Raw code", description = "Primary installed source" }: RegistryItemSourceSection) {
  if (files.length === 0) return null;

  return (
    <section id="source" className="min-w-0 scroll-mt-20">
      <SectionTitle title={title} description={description} />
      <SourceTabs files={files} />
    </section>
  );
}
