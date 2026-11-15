"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { PreviewLayout } from "@/app/(features)/catalog/shared";

import { PreviewTabs, SourceTabs } from "@/app/(features)/components/source";
import type { Composition, DocsKnobFamily, DocsRegistryDependency, DocsStatus, SourceFile } from "@/app/(features)/model/types";
import { ButtonLink } from "@/components/control-ui/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/control-ui/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/control-ui/ui/table";
import { Text, TextLink } from "@/components/control-ui/ui/typography";
import { AgentActions } from "./agent-actions";
import { CompositionSection, DependencySection, InstallPanel, PageHeader, SectionCode, SectionStack, SectionTitle } from "./shared";

type RegistryItemPreview = {
  code: string;
  children: ReactNode;
  controls?: ReactNode;
  className?: string;
  layout?: PreviewLayout;
  description?: string;
};

export type RegistryItemExample = {
  id: string;
  title: string;
  description?: string;
  source: SourceFile;
  previewClassName?: string;
  previewLayout?: PreviewLayout;
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
  beforePreview,
  examples = emptyRegistryItemExamples,
  composition,
  install,
  usageCode,
  usageControls,
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
  beforePreview?: ReactNode;
  examples?: RegistryItemExample[];
  composition: Composition;
  install: RegistryItemInstall;
  usageCode?: string;
  usageControls?: ReactNode;
  knobs?: DocsKnobFamily[];
  dependencies?: RegistryItemFileSection;
  libraryDependencies?: DocsRegistryDependency[];
  source?: RegistryItemSourceSection;
  children?: ReactNode;
}) {
  return (
    <section className="docs-article">
      <PageHeader
        label={label}
        title={title}
        summary={summary}
        status={status}
        actions={<AgentActions name={title} installCommand={install.commands[0]?.value} />}
      />
      {beforePreview}
      <PreviewTabs
        code={preview.code}
        controls={preview.controls}
        previewClassName={preview.className}
        previewLayout={preview.layout}
        previewDescription={preview.description}
      >
        {preview.children}
      </PreviewTabs>

      <RegistryItemExamples examples={examples} />

      <SectionStack>
        <CompositionSection items={composition} />
        <InstallPanel commands={install.commands} manifestHref={install.manifestHref} subtitle={install.subtitle}>
          {install.children}
        </InstallPanel>
        {usageCode ? <SectionCode id="usage" title="Usage" code={usageCode} controls={usageControls} /> : null}
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
            <PreviewTabs
              anchorId={null}
              code={example.source.code}
              previewClassName={example.previewClassName}
              previewLayout={example.previewLayout}
            >
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
  const name = (
    <Text as="code" mono>
      --cui-{id}-*
    </Text>
  );
  if (!href) return name;

  return <TextLink render={<Link href={href} />}>{name}</TextLink>;
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
          <Card key={family.id} size="sm" className="min-w-0">
            <CardHeader>
              <CardTitle>
                <KnobFamilyName id={family.id} href={family.href} />
              </CardTitle>
              <CardDescription>
                <Text numeric>{family.knobs.length}</Text> knobs
              </CardDescription>
              <CardAction>
                <ButtonLink render={<Link href="/skins#component-knobs" />} variant="link" size="xs">
                  How the cascade resolves
                </ButtonLink>
              </CardAction>
            </CardHeader>
            <CardContent>
              <Table aria-label={`--cui-${family.id}-* knobs`}>
                <TableHeader>
                  <TableRow>
                    <TableHead>Knob</TableHead>
                    <TableHead>Syntax</TableHead>
                    <TableHead>Default</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {family.knobs.map((knob) => (
                    <TableRow key={knob.name}>
                      <TableCell>
                        <Text as="code" size="label" mono>
                          {knob.name}
                        </Text>
                      </TableCell>
                      <TableCell>
                        <Text as="code" size="caption" tone="muted" mono>
                          {knob.syntax}
                        </Text>
                      </TableCell>
                      <TableCell>
                        <Text as="code" size="caption" tone="muted" mono>
                          {knob.defaultValue}
                        </Text>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
