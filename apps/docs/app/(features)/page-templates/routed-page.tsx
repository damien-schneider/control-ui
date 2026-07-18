"use client";

import { createContext, type ReactNode, use } from "react";
import type {
  DocsBlock,
  DocsComponent,
  DocsExtension,
  DocsPrimitive,
  GuidePage as GuidePageData,
  IntegrationId,
} from "@/app/(features)/model/types";
import { BlockPage } from "./block-page";
import { ComponentPage } from "./component-page";
import { GuidePage } from "./guide-page";

const DocsIntegrationContext = createContext<IntegrationId | undefined>(undefined);

export function DocsPageIntegrationProvider({ integration, children }: { integration: IntegrationId; children: ReactNode }) {
  return <DocsIntegrationContext value={integration}>{children}</DocsIntegrationContext>;
}

function useDocsIntegration() {
  const integration = use(DocsIntegrationContext);
  if (!integration) throw new Error("Docs route content must render inside DocsPageIntegrationProvider.");
  return integration;
}

export function RoutedGuidePage({ page }: { page: GuidePageData }) {
  return <GuidePage page={page} integration={useDocsIntegration()} />;
}

export function RoutedBlockPage({ block }: { block: DocsBlock }) {
  return <BlockPage block={block} integration={useDocsIntegration()} />;
}

export function RoutedComponentPage({
  component,
  primitives,
  extensions,
}: {
  component: DocsComponent;
  primitives: DocsPrimitive[];
  extensions: DocsExtension[];
}) {
  return <ComponentPage component={component} integration={useDocsIntegration()} primitives={primitives} extensions={extensions} />;
}
