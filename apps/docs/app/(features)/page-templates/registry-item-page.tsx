"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { PreviewTabs, SourceTabs } from "@/app/(features)/components/source";
import type { CompositionExample, DocsKnobFamily, DocsRegistryDependency, DocsStatus, SourceFile } from "@/app/(features)/model/types";
import { CompositionSection, DependencySection, InstallPanel, PageHeader, SectionCode, SectionStack, SectionTitle } from "./shared";

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
  subtitle?: string;
  children?: ReactNode;
};

const emptyRegistryItemExamples: RegistryItemExample[] = [];
const emptyKnobFamilies: DocsKnobFamily[] = [];

export function RegistryItemPage({
  label,
  title,
  summary,
  status,
  preview,
  examples = emptyRegistryItemExamples,
  composition,
  install,
  usageCode,
  knobs = emptyKnobFamilies,
  dependencies,
  libraryDependencies,
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
  install: RegistryItemInstall;
  usageCode?: string;
  knobs?: DocsKnobFamily[];
  dependencies?: RegistryItemFileSection;
  libraryDependencies?: DocsRegistryDependency[];
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

      <SectionStack>
        <CompositionSection items={composition} />
        <InstallPanel commands={install.commands} manifestHref={install.manifestHref} subtitle={install.subtitle}>
          {install.children}
        </InstallPanel>
        {usageCode ? <SectionCode id="usage" title="Usage" code={usageCode} /> : null}
        <DependencySection {...dependencies} dependencies={libraryDependencies} />
        {source ? <RegistryItemSource {...source} /> : null}
        {children}
        <KnobsSection families={knobs} />
      </SectionStack>
    </section>
  );
}

function RegistryItemExamples({ examples }: { examples: RegistryItemExample[] }) {
  if (examples.length === 0) return null;

  return (
    <section id="examples" className="mb-24 min-w-0 scroll-mt-20">
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

function KnobFamilyName({ id, href }: { id: string; href?: string }) {
  const name = <code className="font-medium text-foreground">--cui-{id}-*</code>;
  if (!href) return name;

  return (
    <Link href={href} className="underline underline-offset-4 hover:text-foreground">
      {name}
    </Link>
  );
}

function KnobsSection({ families }: { families: DocsKnobFamily[] }) {
  if (families.length === 0) return null;

  return (
    <section id="knobs" className="min-w-0 scroll-mt-20">
      <SectionTitle
        title="Knobs"
        description="Typed custom properties the recipe paints with. Set one on the root — style, a utility class, or a skin — and every slot inherits it."
      />
      <div className="grid min-w-0 gap-4">
        {families.map((family) => (
          <div key={family.id} className="min-w-0 overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
            <div className="flex items-baseline justify-between gap-3 border-b border-border/70 bg-muted/30 px-4 py-2 text-caption text-muted-foreground">
              <span>
                <KnobFamilyName id={family.id} href={family.href} /> · {family.knobs.length} knobs
              </span>
              <Link href="/skins#component-knobs" className="shrink-0 underline underline-offset-4 hover:text-foreground">
                How the cascade resolves
              </Link>
            </div>
            <div className="divide-y divide-border/50">
              {family.knobs.map((knob) => (
                <div key={knob.name} className="flex min-w-0 flex-col gap-0.5 px-4 py-2 sm:flex-row sm:items-baseline sm:gap-3">
                  <code className="min-w-0 break-all font-mono text-label text-foreground sm:w-72 sm:shrink-0">{knob.name}</code>
                  <code className="shrink-0 font-mono text-caption text-muted-foreground sm:w-40">{knob.syntax}</code>
                  <code className="min-w-0 break-all font-mono text-caption text-muted-foreground">{knob.defaultValue}</code>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
