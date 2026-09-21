"use client";

import { createContext, type ReactNode, use } from "react";
import { integrationIds, isCatalogIntegrationId } from "@/app/(features)/catalog/shared";
import type { IntegrationId } from "@/app/(features)/model/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/control-ui/ui/select";

type DocsIntegrationSetting = {
  integration: IntegrationId;
  selectIntegration: (integration: IntegrationId) => void;
};

const DocsIntegrationContext = createContext<DocsIntegrationSetting | undefined>(undefined);

export function DocsPageIntegrationProvider({
  integration,
  selectIntegration,
  children,
}: DocsIntegrationSetting & { children: ReactNode }) {
  return <DocsIntegrationContext value={{ integration, selectIntegration }}>{children}</DocsIntegrationContext>;
}

function useDocsIntegrationSetting() {
  const setting = use(DocsIntegrationContext);
  if (!setting) throw new Error("Docs route content must render inside DocsPageIntegrationProvider.");
  return setting;
}

export function useDocsIntegration() {
  return useDocsIntegrationSetting().integration;
}

export function integrationChangesCode(codeForIntegration: (integration: IntegrationId) => string | undefined) {
  const [baseline, ...others] = integrationIds;
  const baselineCode = codeForIntegration(baseline);
  return others.some((integration) => codeForIntegration(integration) !== baselineCode);
}

function MastraLogo({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 34 21" fill="none" className={className}>
      <path
        d="M4.5 11.7C7 11.7 9 13.7 9 16.2S7 20.7 4.5 20.7 0 18.7 0 16.2s2-4.5 4.5-4.5ZM10.4 0c2.5 0 4.5 2 4.5 4.5 0 .3 0 .7-.1 1-.3 1.4-.6 3 .2 4.2l1.3 1.9c.1.1.2.2.4.2.1 0 .2-.1.3-.2l1.3-1.9c.8-1.2.5-2.7.2-4.1-.1-.3-.1-.6-.1-1 0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5c0 .4 0 .7-.1 1.1-.3 1.3-.6 2.7.1 3.9l1.2 2.1c0 .1.1.1.1.1 2.5 0 4.5 2 4.5 4.5s-2 4.5-4.5 4.5-4.5-2-4.5-4.5c0-.4 0-.8.1-1.1.3-1.3.6-2.7-.1-3.9L23 9.2c0-.1-.1-.1-.2-.1l-1.3 1.9c-.8 1.2-.5 2.8-.2 4.2.1.3.1.7.1 1 0 2.5-2 4.5-4.5 4.5s-4.5-2-4.5-4.5c0-.3 0-.5.1-.8.2-1.3.4-2.7-.3-3.8l-.9-1.3c-.6-.8-1.5-1.3-2.5-1.6-1.7-.7-2.9-2.3-2.9-4.2C5.9 2 7.9 0 10.4 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

function VercelLogo({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      <path d="M12 4 22 20H2L12 4Z" fill="currentColor" />
    </svg>
  );
}

// Logo + label, self-contained flex so it renders identically in SelectItem and SelectValue (trigger) — picked integration shows its logo too.
function IntegrationOption({ id }: { id: IntegrationId }) {
  return (
    <span className="flex items-center gap-2">
      {id === "mastra" ? <MastraLogo className="h-3.5 w-[22px]" /> : <VercelLogo className="size-3.5" />}
      {id === "mastra" ? "Mastra" : "AI SDK"}
    </span>
  );
}

export function IntegrationSelect() {
  const { integration, selectIntegration } = useDocsIntegrationSetting();

  return (
    <Select
      value={integration}
      onValueChange={(value) => {
        if (isCatalogIntegrationId(value)) selectIntegration(value);
      }}
    >
      <SelectTrigger size="sm" aria-label="Integration" data-testid="integration-select">
        <SelectValue>{(value: string) => (isCatalogIntegrationId(value) ? <IntegrationOption id={value} /> : null)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="mastra">
          <IntegrationOption id="mastra" />
        </SelectItem>
        <SelectItem value="ai-sdk">
          <IntegrationOption id="ai-sdk" />
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
