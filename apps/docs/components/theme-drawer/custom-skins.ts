"use client";

import { createCollection, localStorageCollectionOptions } from "@tanstack/react-db";

import { DEFAULT_THEME } from "./presets";
import type { Generation } from "./theme-generation";
import type { ThemeState } from "./types";

export type CustomSkin = {
  id: string;
  name: string;
  theme: ThemeState;
  generations: Generation[];
  createdAt: number;
};

export const customSkinCollection = createCollection(
  localStorageCollectionOptions<CustomSkin, CustomSkin["id"]>({
    storageKey: "control-ui:custom-skins:v1",
    getKey: (skin) => skin.id,
    // the theme runtime writes through on every edit, including on pages that never render the list
    startSync: true,
    gcTime: 0,
  }),
);

// A screenshot base64s to a few hundred KB and localStorage caps near 5 MB, so a saved turn keeps its text only.
// ponytail: images dropped from history, move them to IndexedDB if past screenshots must stay visible.
function withoutImages(generations: readonly Generation[]): Generation[] {
  return generations.map((generation) => ({ ...generation, image: null }));
}

export function nameCustomSkin(id: string, name: string) {
  if (customSkinCollection.has(id)) {
    customSkinCollection.update(id, (draft) => {
      draft.name = name;
    });
    return;
  }

  // The finished theme lands through writeCustomSkinTheme once the runtime links this id.
  customSkinCollection.insert({ id, name, theme: DEFAULT_THEME, generations: [], createdAt: Date.now() });
}

export function writeCustomSkinTheme(theme: ThemeState) {
  if (!theme.customSkinId || !customSkinCollection.has(theme.customSkinId)) return;
  customSkinCollection.update(theme.customSkinId, (draft) => {
    draft.theme = theme;
  });
}

export function writeCustomSkinConversation(id: string, generations: readonly Generation[]) {
  if (!customSkinCollection.has(id)) return;
  customSkinCollection.update(id, (draft) => {
    draft.generations = withoutImages(generations);
  });
}

export function deleteCustomSkin(id: string) {
  if (customSkinCollection.has(id)) customSkinCollection.delete(id);
}
