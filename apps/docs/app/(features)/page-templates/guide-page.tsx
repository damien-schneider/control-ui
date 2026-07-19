"use client";

import type { MDXComponents } from "mdx/types";
import { type ComponentType, createContext, use } from "react";
import { CodeBlock } from "@/app/(features)/components/source";
import { guideCode } from "@/app/(features)/model/registry";
import type { GuideId, GuidePage as GuidePageData, IntegrationId } from "@/app/(features)/model/types";
import { ThemeAccessibility } from "@/app/(features)/theme-accessibility/theme-accessibility";
import { ThemeAiBuilder } from "@/app/(features)/theme-ai-builder/theme-ai-builder";
import { cn } from "@/components/control-ui/lib/cn";
import AgentSurfaceContent from "@/content/guides/agent-surface.mdx";
import ArchitectureContent from "@/content/guides/architecture.mdx";
import GetStartedContent from "@/content/guides/get-started.mdx";
import OverviewContent from "@/content/guides/overview.mdx";
import ShadcnCompatibilityContent from "@/content/guides/shadcn-compatibility.mdx";
import { ArchitectureLayers, CustomizationLadder, RegistryPipeline, SkinFileStack, SkinResolutionMap } from "./architecture-visuals";
import { GuideCode, type GuideCodeMdxProps, GuidePoint, GuidePoints, GuideSection } from "./guide-code";
import { AgentSurfaceMap, CompatibilityBridge, CssFirstDecisionMap, GettingStartedMap } from "./guide-maps";

type GuideContent = ComponentType<{ components?: MDXComponents }>;

const guideContent: Partial<Record<GuideId, GuideContent>> = {
  overview: OverviewContent,
  "get-started": GetStartedContent,
  "shadcn-compatibility": ShadcnCompatibilityContent,
  architecture: ArchitectureContent,
  "agent-surface": AgentSurfaceContent,
};

const GuideIntegrationContext = createContext<IntegrationId | undefined>(undefined);

function GuideMdxCode(props: GuideCodeMdxProps) {
  const integration = use(GuideIntegrationContext);
  if (!integration) throw new Error("Guide MDX must render inside GuidePage.");
  return <GuideCode {...props} integration={integration} />;
}

const guideComponents = {
  GuideCode: GuideMdxCode,
  GuidePoint,
  GuidePoints,
  GuideSection,
  ArchitectureLayers,
  SkinFileStack,
  CustomizationLadder,
  SkinResolutionMap,
  RegistryPipeline,
  CssFirstDecisionMap,
  GettingStartedMap,
  CompatibilityBridge,
  AgentSurfaceMap,
} satisfies MDXComponents;

function GuidePageContent({ page, integration, Content }: { page: GuidePageData; integration: IntegrationId; Content?: GuideContent }) {
  if (page.id === "theme-accessibility") return <ThemeAccessibility />;
  if (page.id === "theme-ai-builder") return <ThemeAiBuilder />;
  if (Content) {
    return (
      <GuideIntegrationContext value={integration}>
        <Content components={guideComponents} />
      </GuideIntegrationContext>
    );
  }
  return page.sections.map((section) => {
    const code = guideCode(section, integration);
    return (
      <section key={section.id} id={section.id} className="min-w-0 scroll-mt-20">
        <div className="max-w-2xl">
          <h2 className="text-heading-2 font-display">{section.title}</h2>
          {section.body ? <p className="mt-2 text-body leading-6 text-muted-foreground">{section.body}</p> : null}
        </div>

        {section.points ? (
          <div className="mt-4 grid gap-2">
            {section.points.map((point) => (
              <div key={point} className="rounded-xl border border-border/70 bg-card px-4 py-3 text-body leading-6 shadow-sm">
                {point}
              </div>
            ))}
          </div>
        ) : null}

        {code ? (
          <div className="mt-4 min-w-0">
            <CodeBlock code={code} />
          </div>
        ) : null}
      </section>
    );
  });
}

export function GuidePage({ page, integration }: { page: GuidePageData; integration: IntegrationId }) {
  const Content = guideContent[page.id];

  return (
    <section className={cn("mx-auto min-w-0 w-full px-5 py-12", page.layout === "wide" ? "max-w-[90rem]" : "max-w-4xl")}>
      <div className="mb-8 max-w-2xl">
        <div className="text-caption font-medium text-muted-foreground">Guide</div>
        <h1 className="mt-2 text-display font-display">{page.name}</h1>
        <p className="mt-3 text-body-lg text-muted-foreground">{page.summary}</p>
      </div>

      <div className="grid min-w-0 gap-12">
        <GuidePageContent page={page} integration={integration} Content={Content} />
      </div>
    </section>
  );
}
