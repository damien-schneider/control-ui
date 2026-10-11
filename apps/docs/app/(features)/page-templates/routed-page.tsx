"use client";

import type { DocsBlock, DocsExtension, DocsKit, GuidePage as GuidePageData } from "@/app/(features)/model/types";
import type { ThemeCategoryId } from "@/components/theme-drawer/theme-categories";
import { GuidePage } from "./guide-page";
import { useDocsIntegration } from "./integration";
import { KitPage } from "./kit-page";
import { TemplatePage } from "./template-page";

export function RoutedGuidePage({ page, themeCategory }: { page: GuidePageData; themeCategory?: ThemeCategoryId }) {
  return <GuidePage page={page} integration={useDocsIntegration()} themeCategory={themeCategory} />;
}

export function RoutedTemplatePage({ block }: { block: DocsBlock }) {
  return <TemplatePage block={block} integration={useDocsIntegration()} />;
}

export function RoutedKitPage({ kit, extensions }: { kit: DocsKit; extensions: DocsExtension[] }) {
  return <KitPage kit={kit} integration={useDocsIntegration()} extensions={extensions} />;
}
