"use client";

import type { MDXComponents } from "mdx/types";
import { type ComponentType, createContext, use } from "react";
import { CodeBlock } from "@/app/(features)/components/source";
import { AgentSetup } from "@/app/(features)/create/agent-setup";
import { CreateCommand } from "@/app/(features)/create/create-command";
import { guideCode } from "@/app/(features)/model/registry";
import type { GuideId, GuidePage as GuidePageData, IntegrationId } from "@/app/(features)/model/types";
import { ThemeAccessibility } from "@/app/(features)/theme-accessibility/theme-accessibility";
import { Card } from "@/components/control-ui/ui/card";
import { MarkdownRoot } from "@/components/control-ui/ui/markdown";
import { SKIN_CATEGORY, type ThemeCategoryId } from "@/components/theme-drawer/theme-categories";
import { ThemeEditor } from "@/components/theme-drawer/theme-editor";
import AgentSkillContent from "@/content/guides/agent-skill.mdx";
import AgentSurfaceContent from "@/content/guides/agent-surface.mdx";
import ArchitectureContent from "@/content/guides/architecture.mdx";
import BestReactComponentLibrariesContent from "@/content/guides/best-react-component-libraries-for-ai-interfaces.mdx";
import BuildAScreenContent from "@/content/guides/build-a-screen.mdx";
import ContractVersionsContent from "@/content/guides/contract-versions.mdx";
import ControlUiVsShadcnUiContent from "@/content/guides/control-ui-vs-shadcn-ui.mdx";
import CreateContent from "@/content/guides/create.mdx";
import CreateASkinContent from "@/content/guides/create-a-skin.mdx";
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

type GuideContent = ComponentType<{ components?: MDXComponents }>;

const guideContent: Partial<Record<GuideId, GuideContent>> = {
  create: CreateContent,
  overview: OverviewContent,
  "get-started": GetStartedContent,
  "build-a-screen": BuildAScreenContent,
  theming: ThemingContent,
  update: UpdateContent,
  "contract-versions": ContractVersionsContent,
  "setup-prompt": SetupPromptContent,
  "agent-skill": AgentSkillContent,
  "create-a-skin": CreateASkinContent,
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
} satisfies MDXComponents;

function GuidePageContent({
  page,
  integration,
  themeCategory,
  Content,
}: {
  page: GuidePageData;
  integration: IntegrationId;
  themeCategory: ThemeCategoryId;
  Content?: GuideContent;
}) {
  if (page.id === "theme-editor") return <ThemeEditor category={themeCategory} />;
  if (page.id === "theme-accessibility") return <ThemeAccessibility />;
  if (Content) {
    return (
      <GuideIntegrationContext value={integration}>
        <MarkdownRoot className="grid min-w-0 gap-12 text-body">
          <Content components={guideComponents} />
        </MarkdownRoot>
      </GuideIntegrationContext>
    );
  }
  return page.sections.map((section) => {
    const code = guideCode(section, integration);
    return (
      <section key={section.id} id={section.id} className="min-w-0 scroll-mt-20">
        <h2 className="text-heading-2 font-display text-balance">{section.title}</h2>
        {section.body ? <p className="mt-2 text-body leading-6 text-pretty text-muted-foreground">{section.body}</p> : null}

        {section.points ? (
          <div className="mt-4 grid gap-2">
            {section.points.map((point) => (
              <Card key={point} className="px-4 py-3 text-body leading-6">
                {point}
              </Card>
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

function focusWorkspaceHeading(heading: HTMLHeadingElement | null) {
  heading?.focus();
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
  const Content = guideContent[page.id];

  if (page.layout === "workspace") {
    return (
      <section className="flex min-w-0 w-full flex-col gap-4 px-4 pt-[calc(var(--control-h-sm)+1rem)] pb-6 lg:px-6 lg:pt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0 max-w-2xl">
            <div className="text-caption font-medium text-muted-foreground">Guide</div>
            <h1 ref={focusWorkspaceHeading} tabIndex={-1} className="mt-1 text-heading-2 font-display text-balance">
              {page.name}
            </h1>
            <p className="mt-1 text-body text-pretty text-muted-foreground">{page.summary}</p>
          </div>
          <OpenInAgent name={page.name} pathname={`/${page.id}`} />
        </div>
        <GuidePageContent page={page} integration={integration} themeCategory={themeCategory} Content={Content} />
      </section>
    );
  }

  return (
    <section className="docs-article">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="w-full max-w-2xl">
          <div className="text-caption font-medium text-muted-foreground">Guide</div>
          <h1 className="mt-2 text-display font-display text-balance">{page.name}</h1>
          <p className="mt-3 text-body-lg text-pretty text-muted-foreground">{page.summary}</p>
        </div>
        <OpenInAgent name={page.name} pathname={`/${page.id}`} />
      </div>

      <div className="grid min-w-0 gap-12">
        <GuidePageContent page={page} integration={integration} themeCategory={themeCategory} Content={Content} />
        {page.faqs && page.faqs.length > 0 ? (
          <section id="faq" className="min-w-0 scroll-mt-20">
            <h2 className="text-heading-2 font-display text-balance">Frequently asked questions</h2>
            <dl className="mt-4 grid gap-3">
              {page.faqs.map((faq) => (
                <Card key={faq.question} className="gap-1.5 px-4 py-3">
                  <dt className="font-medium text-label">{faq.question}</dt>
                  <dd className="text-body leading-6 text-muted-foreground">{faq.answer}</dd>
                </Card>
              ))}
            </dl>
          </section>
        ) : null}
      </div>
    </section>
  );
}
