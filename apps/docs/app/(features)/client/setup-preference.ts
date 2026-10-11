"use client";

import { createCollection, localStorageCollectionOptions } from "@tanstack/react-db";
import { useSyncExternalStore } from "react";
import { isCatalogIntegrationId } from "@/app/(features)/catalog/shared";
import type { IntegrationId, SetupPreferenceUpdate } from "@/app/(features)/model/types";

export type DocsSetupPreference = {
  id: "active";
  integration: IntegrationId;
};

export const defaultSetupPreference: DocsSetupPreference = {
  id: "active",
  integration: "mastra",
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

export function normalizeSetupPreference(preference?: DocsSetupPreference): DocsSetupPreference {
  if (preference && isCatalogIntegrationId(preference.integration)) return preference;
  return defaultSetupPreference;
}

export function updateDocsSetupPreference(nextPreference: SetupPreferenceUpdate) {
  const currentPreference = docsSetupCollection.get(defaultSetupPreference.id);

  if (currentPreference) {
    docsSetupCollection.update(defaultSetupPreference.id, (draft) => {
      if (nextPreference.integration) draft.integration = nextPreference.integration;
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
