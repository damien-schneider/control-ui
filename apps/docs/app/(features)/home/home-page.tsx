import Link from "next/link";
import type { ReactNode } from "react";
import { CodeSnippet } from "@/app/(features)/components/source";
import { fullInstallCommand } from "@/app/(features)/model/registry";
import { ButtonLink } from "@/components/control-ui/ui/button";
import { PageBody } from "@/components/control-ui/ui/page-layout";
import { Heading, Text } from "@/components/control-ui/ui/typography";
import { siteConfig } from "@/lib/site-config";
import {
  catalogIndex,
  chatComponents,
  chatGroup,
  missingFromShadcnGuide,
  primitivesMissingFromShadcn,
  shadcnComparisonGuide,
  showcasedTemplates,
  templateKind,
} from "./showcase";
import { CatalogItemShowcaseCard, TemplateShowcaseCard } from "./showcase-cards";
import { SkinShowcaseTiles } from "./skin-showcase";

const inlineLinkClassName = "font-medium text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground";
const homeGridClassName = "grid min-w-0 gap-x-4 gap-y-8 @2xl/home:grid-cols-2 @5xl/home:grid-cols-3";

function HomeSection({ id, title, summary, children }: { id: string; title: string; summary: ReactNode; children: ReactNode }) {
  const titleId = `${id}-title`;

  return (
    <section id={id} aria-labelledby={titleId} className="grid min-w-0 scroll-mt-20 gap-6">
      <div className="grid max-w-2xl gap-1.5">
        <Heading level={2} id={titleId}>
          {title}
        </Heading>
        <Text as="p" tone="muted" className="text-pretty">
          {summary}
        </Text>
      </div>
      {children}
    </section>
  );
}

function Hero() {
  const installCommand = fullInstallCommand("none");

  return (
    <header className="grid max-w-3xl gap-6">
      <Heading level={1} size="display" tone="foreground">
        {siteConfig.tagline}
      </Heading>
      <Text as="p" size="body-lg" tone="muted" className="max-w-2xl text-pretty">
        {siteConfig.description}
      </Text>
      {installCommand ? (
        <div className="min-w-0 max-w-2xl">
          <CodeSnippet code={installCommand} />
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <ButtonLink render={<Link href="/get-started" />} variant="solid" tone="primary" size="md">
          Get started
        </ButtonLink>
        <ButtonLink render={<Link href="/primitives" />} variant="surface" size="md">
          Browse primitives
        </ButtonLink>
      </div>
    </header>
  );
}

function ChatSection() {
  return (
    <HomeSection
      id="chat"
      title={chatGroup.title}
      summary={
        <>
          {chatGroup.summary}{" "}
          <Link href={`/components#${chatGroup.id}`} className={inlineLinkClassName}>
            Browse all {chatGroup.items.length}
          </Link>
          .
        </>
      }
    >
      <div className={homeGridClassName}>
        {chatComponents.map((item) => (
          <CatalogItemShowcaseCard key={item.id} item={item} />
        ))}
      </div>
    </HomeSection>
  );
}

function CatalogSection() {
  return (
    <HomeSection
      id="catalog"
      title="The whole catalog"
      summary={
        <>
          Every item installs with the shadcn CLI as source you own. Coming from shadcn/ui? Read{" "}
          <Link href={`/${shadcnComparisonGuide.id}`} className={inlineLinkClassName}>
            {shadcnComparisonGuide.name}
          </Link>
          .
        </>
      }
    >
      <ul className="grid min-w-0 grid-cols-2 gap-3 @5xl/home:grid-cols-4">
        {catalogIndex.map((entry) => (
          <li key={entry.href} className="grid">
            <Link
              href={entry.href}
              className="grid content-start gap-1 rounded-[var(--radius-panel)] border border-border/70 bg-card px-5 py-4 outline-none transition-[border-color,background-color] duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:border-foreground/20 hover:bg-muted/35 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
            >
              <Text size="heading-2" tone="foreground" className="tabular-nums">
                {entry.count}
              </Text>
              <Text size="label" tone="muted">
                {entry.name}
              </Text>
            </Link>
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}

export function HomePage() {
  return (
    <PageBody className="@container/home" contentClassName="grid gap-24">
      <Hero />
      <HomeSection
        id="missing-from-shadcn-ui"
        title="What shadcn/ui doesn’t ship"
        summary={
          <>
            Installed with the same shadcn CLI, into <code>components/control-ui</code> beside your <code>components/ui</code>.{" "}
            <Link href={`/${missingFromShadcnGuide.id}`} className={inlineLinkClassName}>
              See the full list
            </Link>
            .
          </>
        }
      >
        <div className={homeGridClassName}>
          {primitivesMissingFromShadcn.map((item) => (
            <CatalogItemShowcaseCard key={item.id} item={item} />
          ))}
        </div>
      </HomeSection>
      <HomeSection
        id="skins"
        title="One component source, many skins"
        summary={
          <>
            A skin restyles the same component source through one <code>data-skin</code> attribute.{" "}
            <Link href="/skins" className={inlineLinkClassName}>
              Compare every skin
            </Link>
            .
          </>
        }
      >
        <div className={homeGridClassName}>
          <SkinShowcaseTiles />
        </div>
      </HomeSection>
      <HomeSection id="templates" title={templateKind.label} summary={templateKind.summary}>
        <div className={homeGridClassName}>
          {showcasedTemplates.map((item) => (
            <TemplateShowcaseCard key={item.id} item={item} />
          ))}
        </div>
      </HomeSection>
      <ChatSection />
      <CatalogSection />
    </PageBody>
  );
}
