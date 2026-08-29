"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { CodeBlock, CommandBlock } from "@/app/(features)/components/source";
import { StatusBadge } from "@/app/(features)/components/status";
import type { CompositionExample, DocsRegistryDependency, DocsStatus, SourceFile } from "@/app/(features)/model/types";

import { CompositionTree } from "./composition-tree";

// Cross-page building blocks: every page module composes these instead of re-deriving header/section/install-panel frame.

export function PageHeader({
  label,
  title,
  summary,
  status,
  wide = false,
}: {
  label: string;
  title: string;
  summary: string;
  status?: DocsStatus;
  wide?: boolean;
}) {
  return (
    <div className="mb-7">
      <div className="text-caption font-medium text-muted-foreground">{label}</div>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-display font-display">{title}</h1>
        {status ? <StatusBadge status={status} /> : null}
      </div>
      <p className={wide ? "mt-3 max-w-2xl text-body-lg text-muted-foreground" : "mt-3 text-body-lg text-muted-foreground"}>{summary}</p>
    </div>
  );
}

export function SectionStack({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className ? `grid min-w-0 gap-24 ${className}` : "grid min-w-0 gap-24"}>{children}</div>;
}

export function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-heading-2 font-display">{title}</h2>
      {description ? <p className="mt-1 text-body text-muted-foreground">{description}</p> : null}
    </div>
  );
}

export function SectionCode({ id, title, description, code }: { id: string; title: string; description?: string; code: string }) {
  return (
    <section id={id} className="min-w-0 scroll-mt-20">
      <SectionTitle title={title} description={description} />
      <CodeBlock code={code} />
    </section>
  );
}

export function CompositionSection({ items }: { items: CompositionExample[] }) {
  if (items.length === 0) return null;

  return (
    <section id="composition" className="min-w-0 scroll-mt-20">
      <SectionTitle title="Composition" />
      <div className="grid min-w-0 gap-12">
        {items.map((item) => (
          <div key={item.title} className="min-w-0">
            <h3 className="text-body font-normal text-muted-foreground">{item.title}</h3>
            <div className="mt-6 min-w-0">
              <CompositionTree code={item.code} ownParts={item.ownParts} />
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
      <div className="min-w-0 divide-y divide-border/60 overflow-hidden rounded-xl border">
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
          <p className="mb-3 text-body leading-6 text-muted-foreground">{usage.description}</p>
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
        <span className="font-medium">{name}</span>
        <code className="min-w-0 truncate text-label text-muted-foreground">{detail}</code>
      </span>
      <span className="shrink-0 text-caption text-muted-foreground">{kind}</span>
    </>
  );
  const className = "flex min-w-0 items-baseline justify-between gap-4 px-4 py-2.5 text-body";

  if (!href) return <div className={className}>{content}</div>;

  return (
    <Link href={href} className={`${className} transition hover:bg-muted/40`}>
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
        <p className="mb-3 text-body leading-6 text-muted-foreground">
          First install and activate one{" "}
          <Link href="/skins" className="font-medium text-foreground underline underline-offset-4">
            skin
          </Link>
          . Core deliberately contains no visual token defaults.
        </p>
      ) : null}
      {children ? <p className="mb-3 text-body leading-6 text-muted-foreground">{children}</p> : null}
      <div className="grid min-w-0 gap-2">
        {commands.map((command) => (
          <CommandBlock key={command.label} label={command.label} command={command.value} />
        ))}
      </div>
      <a
        href={manifestHref}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex h-8 items-center rounded-md border bg-background px-3 text-label font-medium transition hover:bg-muted"
      >
        See registry manifest
      </a>
    </section>
  );
}
