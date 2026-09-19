"use client";

import type { DocsBlock, DocsComponent, DocsExtension, GuidePage as GuidePageData } from "@/app/(features)/model/types";
import type { ThemeCategoryId } from "@/components/theme-drawer/theme-categories";
import { ComponentPage } from "./component-page";
import { GuidePage } from "./guide-page";
import { useDocsIntegration } from "./integration";
import { UseCasePage } from "./use-case-page";

export function RoutedGuidePage({ page, themeCategory }: { page: GuidePageData; themeCategory?: ThemeCategoryId }) {
  return <GuidePage page={page} integration={useDocsIntegration()} themeCategory={themeCategory} />;
}

export function RoutedUseCasePage({ block }: { block: DocsBlock }) {
  return <UseCasePage block={block} integration={useDocsIntegration()} />;
}

export function RoutedComponentPage({ component, extensions }: { component: DocsComponent; extensions: DocsExtension[] }) {
  return <ComponentPage component={component} integration={useDocsIntegration()} extensions={extensions} />;
}
