"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { CodeBlock, CommandBlock, DocsCollapsible } from "@/app/(features)/components/source";
import { StatusBadge } from "@/app/(features)/components/status";
import type { CompositionExample, DocsStatus, SourceFile } from "@/app/(features)/model/types";
import { Badge } from "@/components/control-ui/ui/badge";

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

export function CompositionSection({
  items,
  description = "Canonical nesting for the installed parts.",
}: {
  items: CompositionExample[];
  description?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section id="composition" className="min-w-0 scroll-mt-20">
      <SectionTitle title="Composition" description={description} />
      <div className="grid min-w-0 gap-8">
        {items.map((item) => (
          <div key={item.title} className="min-w-0">
            <div className="mb-3">
              <h3 className="text-body-lg font-semibold tracking-tight">{item.title}</h3>
              {item.description ? <p className="mt-1 text-body text-muted-foreground">{item.description}</p> : null}
            </div>
            <CodeBlock code={item.code} lang="text" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function SupportFiles({
  files,
  description,
  id = "dependencies",
  title = "Installed dependencies",
  installCommand,
  usage,
}: {
  files: SourceFile[];
  description: string;
  id?: string;
  title?: string;
  installCommand?: string;
  usage?: { description: string; code: string };
}) {
  if (files.length === 0) return null;

  return (
    <section id={id} className="min-w-0 scroll-mt-20">
      <SectionTitle title={title} description={description} />
      <div className="grid gap-2">
        {files.map((file) => (
          <div
            key={file.path}
            className="flex min-w-0 items-center justify-between gap-4 rounded-xl border border-border/70 bg-card px-4 py-3 text-body shadow-sm"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="font-medium">{file.label}</span>
              <code className="min-w-0 truncate text-label text-muted-foreground">{file.path}</code>
            </span>
            <Badge variant="outline" size="sm">
              {supportFileLabel(file)}
            </Badge>
          </div>
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
  subtitle: string;
  children?: ReactNode;
  requiresSkin?: boolean;
}) {
  return (
    <DocsCollapsible id="install" title="Installation" subtitle={subtitle} defaultOpen>
      <div className="p-4">
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
      </div>
    </DocsCollapsible>
  );
}
