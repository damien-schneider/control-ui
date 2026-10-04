"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { CodeBlock, CommandBlock } from "@/app/(features)/components/source";
import { StatusBadge } from "@/app/(features)/components/status";
import type { Composition, DocsRegistryDependency, DocsStatus, SourceFile } from "@/app/(features)/model/types";
import { cn } from "@/components/control-ui/lib/cn";
import { ButtonLink } from "@/components/control-ui/ui/button";
import { Heading, Text } from "@/components/control-ui/ui/typography";

import { CompositionTree } from "./composition-tree";

export function PageHeader({
  label,
  title,
  summary,
  status,
  focusOnMount,
  compact = false,
}: {
  label: string;
  title: string;
  summary?: string;
  status?: DocsStatus;
  focusOnMount?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "mb-5" : "mb-7"}>
      {compact ? null : (
        <Text as="div" size="caption" weight="medium" tone="muted">
          {label}
        </Text>
      )}
      <div className={cn("flex flex-wrap items-center gap-3", !compact && "mt-2")}>
        <Heading
          level={1}
          size={compact ? "heading-1" : "display"}
          ref={focusOnMount ? focusHeading : undefined}
          tabIndex={focusOnMount ? -1 : undefined}
          className="outline-none"
        >
          {title}
        </Heading>
        {status ? <StatusBadge status={status} /> : null}
      </div>
      {summary ? (
        <Text as="p" size={compact ? "body" : "body-lg"} tone="muted" className={cn("max-w-2xl text-pretty", compact ? "mt-1" : "mt-3")}>
          {summary}
        </Text>
      ) : null}
    </div>
  );
}

function focusHeading(heading: HTMLHeadingElement | null) {
  heading?.focus();
}

export function SectionStack({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={className ? `grid min-w-0 gap-[var(--docs-section-gap)] ${className}` : "grid min-w-0 gap-[var(--docs-section-gap)]"}>
      {children}
    </div>
  );
}

export function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-3">
      <Heading level={2}>{title}</Heading>
      {description ? (
        <Text as="p" tone="muted" className="mt-1 text-pretty">
          {description}
        </Text>
      ) : null}
    </div>
  );
}

export function SectionCode({
  id,
  title,
  description,
  code,
  controls,
}: {
  id: string;
  title: string;
  description?: string;
  code: string;
  controls?: ReactNode;
}) {
  return (
    <section id={id} className="min-w-0 scroll-mt-20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionTitle title={title} description={description} />
        {controls ? <div className="mb-3">{controls}</div> : null}
      </div>
      <CodeBlock code={code} />
    </section>
  );
}

export function CompositionSection({ items }: { items: Composition }) {
  return (
    <section id="composition" className="min-w-0 scroll-mt-20">
      <SectionTitle title="Composition" />
      <div className="grid min-w-0 gap-12">
        {items.map((item) => (
          <div key={item.title} className="min-w-0">
            <Heading level={3} size="body" tone="muted">
              {item.title}
            </Heading>
            {item.description ? (
              <Text as="p" size="label" tone="muted" className="mt-2 text-pretty">
                {item.description}
              </Text>
            ) : null}
            <div className="mt-6 min-w-0">
              <CompositionTree tree={item.tree} ownParts={item.ownParts} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DependencySection({
  files = [],
  dependencies = [],
  id = "dependencies",
  title = "Dependencies",
  description,
  installCommand,
  usage,
}: {
  files?: SourceFile[];
  dependencies?: DocsRegistryDependency[];
  id?: string;
  title?: string;
  description?: string;
  installCommand?: string;
  usage?: { description: string; code: string };
}) {
  if (files.length === 0 && dependencies.length === 0) return null;

  return (
    <section id={id} className="min-w-0 scroll-mt-20">
      <SectionTitle title={title} description={description} />
      <div className="docs-panel divide-y divide-border overflow-hidden">
        {files.map((file) => (
          <DependencyRow key={file.path} name={file.label} detail={file.path} kind={supportFileLabel(file)} />
        ))}
        {dependencies.map((dependency) => (
          <DependencyRow
            key={dependency.registryKind}
            name={dependency.name}
            detail={dependency.registryKind}
            kind={dependency.kind}
            href={dependency.href}
          />
        ))}
      </div>
      {installCommand ? (
        <div className="mt-3 grid min-w-0 gap-2">
          <CommandBlock label="Registry command" command={installCommand} />
        </div>
      ) : null}
      {usage ? (
        <div className="mt-4 min-w-0">
          <Text as="p" tone="muted" className="mb-3 leading-6">
            {usage.description}
          </Text>
          <CodeBlock code={usage.code} />
        </div>
      ) : null}
    </section>
  );
}

export function RegistryDependencyReferences({ dependencies }: { dependencies: DocsRegistryDependency[] }) {
  return <DependencySection id="library-dependencies" title="Library dependencies" dependencies={dependencies} />;
}

function DependencyRow({ name, detail, kind, href }: { name: string; detail: string; kind: string; href?: string }) {
  const content = (
    <>
      <span className="flex min-w-0 items-baseline gap-2">
        <Text weight="medium">{name}</Text>
        <Text as="code" size="label" tone="muted" className="min-w-0 truncate">
          {detail}
        </Text>
      </span>
      <Text size="caption" tone="muted" className="shrink-0">
        {kind}
      </Text>
    </>
  );
  const className = "flex min-w-0 items-baseline justify-between gap-4 px-4 py-2.5 text-body";

  if (!href) return <div className={className}>{content}</div>;

  return (
    <Link href={href} className={`${className} hover:bg-muted/40`}>
      {content}
    </Link>
  );
}

function supportFileLabel(file: SourceFile) {
  if (file.slot === "hook") return "Hook";
  if (file.slot === "util") return "Util";
  if (file.slot === "skin-control") return "Skin";
  if (file.slot === "skin-plugin") return "Extension";
  if (file.slot === "effect-helper" || file.slot === "effect-css") return "Effect";
  if (file.slot === "shiki-helper") return "Helper";
  return "Support";
}

export function InstallPanel({
  commands,
  manifestHref,
  subtitle,
  children,
  requiresSkin = true,
}: {
  commands: Array<{ label: string; value: string }>;
  manifestHref: string;
  subtitle?: string;
  children?: ReactNode;
  requiresSkin?: boolean;
}) {
  return (
    <section id="install" className="min-w-0 scroll-mt-20">
      <SectionTitle title="Installation" description={subtitle} />
      {requiresSkin ? (
        <Text as="p" tone="muted" className="mb-3 leading-6">
          First install and activate one{" "}
          <Link href="/skins" className="font-medium text-foreground underline underline-offset-4">
            skin
          </Link>
          . Core deliberately contains no visual token defaults.
        </Text>
      ) : null}
      {children ? (
        <Text as="p" tone="muted" className="mb-3 leading-6">
          {children}
        </Text>
      ) : null}
      <div className="grid min-w-0 gap-2">
        {commands.map((command) => (
          <CommandBlock key={command.label} label={command.label} command={command.value} />
        ))}
      </div>
      <ButtonLink href={manifestHref} target="_blank" rel="noreferrer" variant="surface" size="sm" className="mt-3">
        See registry manifest
      </ButtonLink>
    </section>
  );
}
