"use client";

import { isCatalogIntegrationId } from "@/app/(features)/catalog/shared";
import type { IntegrationId, SetupPreferenceUpdate } from "@/app/(features)/model/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/control-ui/ui/select";
import { IntegrationOption } from "./logos";
import { SidebarControlSection } from "./mode-selector";

export type SidebarSetupControlsScope = "ai" | "none";

export function SidebarSetupControls({
  integration,
  scope,
  updateSetupPreference,
}: {
  integration: IntegrationId;
  scope: SidebarSetupControlsScope;
  updateSetupPreference: (nextPreference: SetupPreferenceUpdate) => void;
}) {
  if (scope === "none") return null;

  return (
    <div className="grid gap-3">
      <SidebarControlSection title="Integration">
        <Select
          value={integration}
          onValueChange={(value) => {
            if (isCatalogIntegrationId(value)) updateSetupPreference({ integration: value });
          }}
        >
          <SelectTrigger size="sm" className="w-full" aria-label="Integration" data-testid="integration-select">
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
      </SidebarControlSection>
    </div>
  );
}
