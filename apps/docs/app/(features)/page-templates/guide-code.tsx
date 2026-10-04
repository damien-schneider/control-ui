"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { CodeBlock } from "@/app/(features)/components/source";
import { guideCodeForKind, languageForGuideCode } from "@/app/(features)/model/registry";
import type { GuideSection as GuideSectionData, IntegrationId } from "@/app/(features)/model/types";
import { cn } from "@/components/control-ui/lib/cn";
import { Card } from "@/components/control-ui/ui/card";
import { MarkdownFlow } from "@/components/control-ui/ui/markdown";
import { Heading, Text } from "@/components/control-ui/ui/typography";
import { IntegrationSelect, integrationChangesCode } from "./integration";

type GuideCodeKind = NonNullable<GuideSectionData["code"]>;
export type GuideCodeMdxProps = { kind: GuideCodeKind; lang?: string };

export function GuideCode({ kind, lang, integration }: GuideCodeMdxProps & { integration: IntegrationId }) {
  const code = guideCodeForKind(kind, integration);
  if (!code) return null;
  const codeChangesWithIntegration = integrationChangesCode((id) => guideCodeForKind(kind, id));

  return (
    <div className="min-w-0">
      {codeChangesWithIntegration ? (
        <div className="mb-3">
          <IntegrationSelect />
        </div>
      ) : null}
      <CodeBlock code={code} lang={lang ?? languageForGuideCode(kind)} />
    </div>
  );
}

export function GuideSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="min-w-0 scroll-mt-20">
      <Heading level={2}>{title}</Heading>
      <MarkdownFlow className="mt-2 text-body leading-6 text-muted-foreground">{children}</MarkdownFlow>
    </section>
  );
}

const installPaths = {
  create: {
    label: "New app",
    href: "/create",
    description:
      "Start from nothing: one command scaffolds a Next.js app with every component, block, and primitive already installed as source you own.",
  },
  agent: {
    label: "With an agent",
    href: "/setup-prompt",
    description:
      "Hand the install to the coding agent already open in your project. One prompt reads the repository, installs from the registry, wires the CSS, runs the doctor, and designs the theme with you.",
  },
  manual: {
    label: "By hand",
    href: "/get-started",
    description: "Run the install yourself: one command copies the source, then you wire the CSS entry and verify the result.",
  },
} as const;

export type InstallPathId = keyof typeof installPaths;

export function InstallPaths({ current }: { current: InstallPathId }) {
  return (
    <nav aria-label="Install path">
      <ul className="flex flex-wrap items-end gap-6 border-border/70 border-b">
        {Object.entries(installPaths).map(([id, path]) => (
          <li key={id}>
            <Link
              href={path.href}
              aria-current={id === current ? "page" : undefined}
              className="-mb-px block border-transparent border-b-2 pb-2 text-heading-3 text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:border-primary aria-[current=page]:text-foreground"
            >
              {path.label}
            </Link>
          </li>
        ))}
      </ul>
      <Text as="p" tone="muted" className="mt-3 leading-6">
        {installPaths[current].description}
      </Text>
    </nav>
  );
}

export function GuideCheck({ children }: { children: ReactNode }) {
  return (
    <Card className="gap-1 px-4 py-3">
      <Text size="caption" weight="medium" tone="primary">
        What you should see now
      </Text>
      <Text as="div" tone="foreground" className="leading-6 [&>p]:text-pretty">
        {children}
      </Text>
    </Card>
  );
}

export function GuidePoints({ children }: { children: ReactNode }) {
  return <div className="grid divide-y divide-border/60 border-border/70 border-y">{children}</div>;
}

export function GuidePoint({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative py-3 pr-2 pl-5 text-body leading-6 before:absolute before:top-[1.35rem] before:left-0 before:size-1.5 before:rounded-full before:bg-primary/70",
        className,
      )}
      {...props}
    />
  );
}
