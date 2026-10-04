"use client";

import type { MDXComponents } from "mdx/types";
import { type ComponentType, createContext, use } from "react";
import { AgentSetup } from "@/app/(features)/create/agent-setup";
import { CreateCommand } from "@/app/(features)/create/create-command";
import { ColorFoundations } from "@/app/(features)/foundations/color-foundations";
import { ElevationFoundations } from "@/app/(features)/foundations/elevation-foundations";
import { FocusFoundations } from "@/app/(features)/foundations/focus-foundations";
import { MotionFoundations } from "@/app/(features)/foundations/motion-foundations";
import { RadiusFoundations } from "@/app/(features)/foundations/radius-foundations";
import { SizingFoundations } from "@/app/(features)/foundations/sizing-foundations";
import { SurfaceFoundations } from "@/app/(features)/foundations/surface-foundations";
import { TypographyFoundations } from "@/app/(features)/foundations/typography-foundations";
import type { GuideId, GuidePage as GuidePageData, IntegrationId } from "@/app/(features)/model/types";
import { ThemeAccessibility } from "@/app/(features)/theme-accessibility/theme-accessibility";
import { Card } from "@/components/control-ui/ui/card";
import { MarkdownRoot } from "@/components/control-ui/ui/markdown";
import { Heading, Text } from "@/components/control-ui/ui/typography";
import { SKIN_CATEGORY, type ThemeCategoryId } from "@/components/theme-drawer/theme-categories";
import { ThemeEditor } from "@/components/theme-drawer/theme-editor";
import AgentSkillContent from "@/content/guides/agent-skill.mdx";
import AgentSurfaceContent from "@/content/guides/agent-surface.mdx";
import ArchitectureContent from "@/content/guides/architecture.mdx";
import BestReactComponentLibrariesContent from "@/content/guides/best-react-component-libraries-for-ai-interfaces.mdx";
import BuildAScreenContent from "@/content/guides/build-a-screen.mdx";
import ControlUiVsShadcnUiContent from "@/content/guides/control-ui-vs-shadcn-ui.mdx";
import CreateContent from "@/content/guides/create.mdx";
import CreateASkinContent from "@/content/guides/create-a-skin.mdx";
import FoundationsContent from "@/content/guides/foundations.mdx";
import GetStartedContent from "@/content/guides/get-started.mdx";
import LockInContent from "@/content/guides/lock-in.mdx";
import OverviewContent from "@/content/guides/overview.mdx";
import SetupPromptContent from "@/content/guides/setup-prompt.mdx";
import ShadcnCompatibilityContent from "@/content/guides/shadcn-compatibility.mdx";
import ThemingContent from "@/content/guides/theming.mdx";
import UpdateContent from "@/content/guides/update.mdx";
import { ArchitectureLayers, CustomizationLadder, RegistryPipeline, SkinFileStack, SkinResolutionMap } from "./architecture-visuals";
import { GuideCheck, GuideCode, type GuideCodeMdxProps, GuidePoint, GuidePoints, GuideSection, InstallPaths } from "./guide-code";
import { AgentSurfaceMap, CompatibilityBridge, CssFirstDecisionMap } from "./guide-maps";
import { OpenInAgent } from "./open-in-agent";
import { PageHeader } from "./shared";

type GuideContent = ComponentType<{ components?: MDXComponents }>;

type ContentGuideId = Exclude<GuideId, "theme-editor" | "theme-accessibility">;

const guideContent: Record<ContentGuideId, GuideContent> = {
  create: CreateContent,
  overview: OverviewContent,
  "get-started": GetStartedContent,
  "build-a-screen": BuildAScreenContent,
  theming: ThemingContent,
  update: UpdateContent,
  "setup-prompt": SetupPromptContent,
  "agent-skill": AgentSkillContent,
  "create-a-skin": CreateASkinContent,
  foundations: FoundationsContent,
  "shadcn-compatibility": ShadcnCompatibilityContent,
  architecture: ArchitectureContent,
  "lock-in": LockInContent,
  "agent-surface": AgentSurfaceContent,
  "control-ui-vs-shadcn-ui": ControlUiVsShadcnUiContent,
  "best-react-component-libraries-for-ai-interfaces": BestReactComponentLibrariesContent,
};

const GuideIntegrationContext = createContext<IntegrationId | undefined>(undefined);

function GuideMdxCode(props: GuideCodeMdxProps) {
  const integration = use(GuideIntegrationContext);
  if (!integration) throw new Error("Guide MDX must render inside GuidePage.");
  return <GuideCode {...props} integration={integration} />;
}

const guideComponents = {
  AgentSetup,
  CreateCommand,
  InstallPaths,
  GuideCheck,
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
  CompatibilityBridge,
  AgentSurfaceMap,
  ColorFoundations,
  TypographyFoundations,
  SurfaceFoundations,
  ElevationFoundations,
  RadiusFoundations,
  SizingFoundations,
  MotionFoundations,
  FocusFoundations,
} satisfies MDXComponents;

function GuidePageContent({
  page,
  integration,
  themeCategory,
}: {
  page: GuidePageData;
  integration: IntegrationId;
  themeCategory: ThemeCategoryId;
}) {
  if (page.id === "theme-editor") return <ThemeEditor category={themeCategory} />;
  if (page.id === "theme-accessibility") return <ThemeAccessibility />;
  const Content = guideContent[page.id];

  return (
    <GuideIntegrationContext value={integration}>
      <MarkdownRoot className="grid min-w-0 gap-12 text-body">
        <Content components={guideComponents} />
      </MarkdownRoot>
    </GuideIntegrationContext>
  );
}

export function GuidePage({
  page,
  integration,
  themeCategory = SKIN_CATEGORY,
}: {
  page: GuidePageData;
  integration: IntegrationId;
  themeCategory?: ThemeCategoryId;
}) {
  if (page.layout === "workspace") {
    return (
      <section className="flex min-w-0 w-full flex-col px-4 pt-[calc(var(--control-h-sm)+1rem)] pb-6 lg:px-6 lg:pt-12">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <PageHeader
            label="Guide"
            title={page.name}
            summary={page.id === "theme-editor" ? undefined : page.summary}
            focusOnMount
            compact={page.id === "theme-editor"}
          />
          {page.id === "theme-editor" ? null : <OpenInAgent name={page.name} pathname={`/${page.id}`} />}
        </div>
        <GuidePageContent page={page} integration={integration} themeCategory={themeCategory} />
      </section>
    );
  }

  return (
    <section className="docs-article">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="w-full max-w-2xl">
          <Text as="div" size="caption" weight="medium" tone="muted">
            Guide
          </Text>
          <Heading level={1} size="display" className="mt-2">
            {page.name}
          </Heading>
          <Text as="p" size="body-lg" tone="muted" className="mt-3 text-pretty">
            {page.summary}
          </Text>
        </div>
        <OpenInAgent name={page.name} pathname={`/${page.id}`} />
      </div>

      <div className="grid min-w-0 gap-12">
        <GuidePageContent page={page} integration={integration} themeCategory={themeCategory} />
        {page.faqs && page.faqs.length > 0 ? (
          <section id="faq" className="min-w-0 scroll-mt-20">
            <Heading level={2}>Frequently asked questions</Heading>
            <dl className="mt-4 grid gap-3">
              {page.faqs.map((faq) => (
                <Card key={faq.question} className="gap-1.5 px-4 py-3">
                  <Text as="dt" size="label" weight="medium">
                    {faq.question}
                  </Text>
                  <Text as="dd" tone="muted" className="leading-6">
                    {faq.answer}
                  </Text>
                </Card>
              ))}
            </dl>
          </section>
        ) : null}
      </div>
    </section>
  );
}
