"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { CodeBlock } from "@/app/(features)/components/source";
import { guideCodeForKind, languageForGuideCode } from "@/app/(features)/model/registry";
import type { GuideSection as GuideSectionData, IntegrationId } from "@/app/(features)/model/types";
import { ButtonLink } from "@/components/control-ui/ui/button";
import { Card, CardContent } from "@/components/control-ui/ui/card";
import { Item, ItemContent, ItemGroup } from "@/components/control-ui/ui/item";
import { MarkdownFlow } from "@/components/control-ui/ui/markdown-elements";
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
      <div className="mt-2">
        <MarkdownFlow>{children}</MarkdownFlow>
      </div>
    </section>
  );
}

const installPaths = {
  create: {
    label: "New app",
    href: "/create",
    description:
      "Start from nothing: one command scaffolds a Next.js app with every component, kit, and template already installed as source you own.",
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
      <div className="flex flex-wrap gap-2">
        {Object.entries(installPaths).map(([id, path]) => {
          const isCurrent = id === current;
          return (
            <ButtonLink
              key={id}
              variant="quiet"
              size="sm"
              active={isCurrent}
              aria-current={isCurrent ? "page" : undefined}
              render={<Link href={path.href} />}
            >
              {path.label}
            </ButtonLink>
          );
        })}
      </div>
      <Text as="p" tone="muted" className="mt-3">
        {installPaths[current].description}
      </Text>
    </nav>
  );
}

export function GuideCheck({ children }: { children: ReactNode }) {
  return (
    <Card size="sm">
      <CardContent className="grid gap-1">
        <Text size="caption" weight="medium" tone="primary">
          What you should see now
        </Text>
        <Text as="div" tone="foreground" className="text-pretty">
          {children}
        </Text>
      </CardContent>
    </Card>
  );
}

export function GuidePoints({ children }: { children: ReactNode }) {
  return <ItemGroup>{children}</ItemGroup>;
}

export function GuidePoint({ children }: { children: ReactNode }) {
  return (
    <Item>
      <ItemContent>
        <Text as="div">{children}</Text>
      </ItemContent>
    </Item>
  );
}
