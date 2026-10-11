import Link from "next/link";
import type { ReactNode } from "react";
import { CodeSnippet } from "@/app/(features)/components/source";
import type { CatalogGalleryItem } from "@/app/(features)/model/catalog-gallery";
import { fullInstallCommand } from "@/app/(features)/model/registry";
import { cn } from "@/components/control-ui/lib/cn";
import { ButtonLink } from "@/components/control-ui/ui/button";
import { Heading, Text } from "@/components/control-ui/ui/typography";
import { HowItWorks } from "./how-it-works";
import landingType from "./landing-type.module.css";
import { SceneStage } from "./scene-stage";
import {
  catalogIndex,
  chatGroup,
  chatKits,
  componentsMissingFromShadcn,
  inlineLinkClassName,
  landingWidthClassName,
  missingFromShadcnGuide,
  shadcnComparisonGuide,
} from "./showcase";
import { CatalogItemShowcaseCard } from "./showcase-cards";

const cardGridClassName = "grid min-w-0 gap-x-4 gap-y-8 @2xl/home:grid-cols-2 @5xl/home:grid-cols-3";

function StartButtons() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <ButtonLink render={<Link href="/get-started" />} variant="solid" tone="primary" size="lg">
        Get started
      </ButtonLink>
      <ButtonLink render={<Link href="/components" />} variant="surface" size="lg">
        Browse components
      </ButtonLink>
    </div>
  );
}

function LandingSection({ id, title, lead, children }: { id: string; title: string; lead: ReactNode; children: ReactNode }) {
  const titleId = `${id}-title`;

  return (
    <section id={id} aria-labelledby={titleId} className={cn(landingWidthClassName, "grid min-w-0 scroll-mt-32 gap-12")}>
      <div className="mx-auto grid max-w-2xl justify-items-center gap-4 text-center">
        <Heading level={2} id={titleId} size="display" tone="foreground" className={landingType.sectionTitle}>
          {title}
        </Heading>
        <Text as="p" size="body-lg" tone="muted" className={cn("text-pretty", landingType.lead)}>
          {lead}
        </Text>
      </div>
      {children}
    </section>
  );
}

function Hero() {
  const installCommand = fullInstallCommand("none");

  return (
    <header className={cn(landingWidthClassName, "grid justify-items-center gap-8 pt-20 text-center @3xl/home:pt-28")}>
      <Heading level={1} size="display" tone="foreground" className={cn("max-w-4xl", landingType.title)}>
        App components for shadcn/ui, in any skin
      </Heading>
      <Text as="p" size="body-lg" tone="muted" className={cn("max-w-2xl text-pretty", landingType.lead)}>
        Pickers, trees, editors, AI chat, and whole app screens, installed with the shadcn CLI as source you own. Switch the skin above and
        everything below repaints.
      </Text>
      <StartButtons />
      {installCommand ? (
        <div className="w-full min-w-0 max-w-xl text-left">
          <CodeSnippet code={installCommand} />
        </div>
      ) : null}
    </header>
  );
}

function ShowcaseCardGrid({ items }: { items: CatalogGalleryItem[] }) {
  return (
    <div className={cardGridClassName}>
      {items.map((item) => (
        <CatalogItemShowcaseCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function CatalogClosing() {
  return (
    <section aria-labelledby="catalog-title" className={cn(landingWidthClassName, "grid justify-items-center gap-12 text-center")}>
      <div className="grid max-w-2xl justify-items-center gap-4">
        <Heading level={2} id="catalog-title" size="display" tone="foreground" className={landingType.sectionTitle}>
          The whole catalog
        </Heading>
        <Text as="p" size="body-lg" tone="muted" className={cn("text-pretty", landingType.lead)}>
          Coming from shadcn/ui? Read{" "}
          <Link href={`/${shadcnComparisonGuide.id}`} className={inlineLinkClassName}>
            {shadcnComparisonGuide.name}
          </Link>
          .
        </Text>
      </div>
      <ul className="grid w-full min-w-0 grid-cols-2 gap-3 @3xl/home:grid-cols-4">
        {catalogIndex.map((entry) => (
          <li key={entry.href} className="grid">
            <Link
              href={entry.href}
              className="grid gap-1 rounded-[var(--radius-panel)] border border-border/70 bg-card px-5 py-6 outline-none transition-[border-color,background-color] duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:border-foreground/20 hover:bg-muted/35 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
            >
              <Text size="display" tone="foreground" className="tabular-nums">
                {entry.count}
              </Text>
              <Text size="label" tone="muted">
                {entry.name}
              </Text>
            </Link>
          </li>
        ))}
      </ul>
      <StartButtons />
    </section>
  );
}

export function HomePage() {
  return (
    <div className={cn("grid gap-32 pb-32", landingType.scale)}>
      <div className="grid gap-16">
        <Hero />
        <SceneStage />
      </div>
      <LandingSection
        id="missing-from-shadcn-ui"
        title="What shadcn/ui doesn’t ship"
        lead={
          <>
            The pickers, trees, and viewers you would otherwise build yourself.{" "}
            <Link href={`/${missingFromShadcnGuide.id}`} className={inlineLinkClassName}>
              See the full list
            </Link>
            .
          </>
        }
      >
        <ShowcaseCardGrid items={componentsMissingFromShadcn} />
      </LandingSection>
      <LandingSection
        id="chat"
        title={chatGroup.title}
        lead={
          <>
            {chatGroup.summary}{" "}
            <Link href={`/kits#${chatGroup.id}`} className={inlineLinkClassName}>
              Browse all {chatGroup.items.length}
            </Link>
            .
          </>
        }
      >
        <ShowcaseCardGrid items={chatKits} />
      </LandingSection>
      <LandingSection
        id="how-it-works"
        title="From install to your own skin"
        lead="Every part is a file in your repository, not a dependency you wait on."
      >
        <HowItWorks />
      </LandingSection>
      <CatalogClosing />
    </div>
  );
}
