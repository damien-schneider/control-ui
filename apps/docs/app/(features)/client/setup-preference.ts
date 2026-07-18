"use client";

import { createCollection, localStorageCollectionOptions } from "@tanstack/react-db";
import { useSyncExternalStore } from "react";
import type { IntegrationId, SetupPreferenceUpdate } from "@/app/(features)/model/types";

// Older payloads carried a component-source axis (`source`, before that `skin`/`adapter`); source switch is gone (one library ships), migration keeps only integration.
export type LegacyDocsSetupPreference = DocsSetupPreference & { skin?: string; source?: string };

export type DocsSetupPreference = {
  id: "active";
  integration: IntegrationId;
  adapter?: IntegrationId;
  version?: typeof docsSetupPreferenceVersion;
};

export const docsSetupPreferenceVersion = 5;

export const defaultSetupPreference: DocsSetupPreference = {
  id: "active",
  integration: "mastra",
  version: docsSetupPreferenceVersion,
};

export const docsSetupCollection = createCollection(
  localStorageCollectionOptions<DocsSetupPreference, DocsSetupPreference["id"]>({
    storageKey: "control-ui-docs-setup",
    getKey: (preference) => preference.id,
  }),
);

const subscribeToHydration = () => () => {};
const getHydratedClientSnapshot = () => true;
const getHydratedServerSnapshot = () => false;

export function normalizeSetupPreference(preference?: LegacyDocsSetupPreference) {
  if (!preference) return defaultSetupPreference;
  if (preference.version === docsSetupPreferenceVersion && preference.integration) return preference;

  return {
    ...defaultSetupPreference,
    integration: preference.integration ?? preference.adapter ?? defaultSetupPreference.integration,
  };
}

export function updateDocsSetupPreference(nextPreference: SetupPreferenceUpdate) {
  const currentPreference = docsSetupCollection.get(defaultSetupPreference.id);

  if (currentPreference) {
    docsSetupCollection.update(defaultSetupPreference.id, (draft) => {
      if (nextPreference.integration) draft.integration = nextPreference.integration;
      draft.version = docsSetupPreferenceVersion;
    });
    return;
  }

  docsSetupCollection.insert({
    ...defaultSetupPreference,
    ...nextPreference,
  });
}

export function useIsHydrated() {
  return useSyncExternalStore(subscribeToHydration, getHydratedClientSnapshot, getHydratedServerSnapshot);
}
