"use client";

import { useLiveQuery } from "@tanstack/react-db";

import { customSkinCollection, deleteCustomSkin } from "./custom-skins";
import { resetConversation, useGenerationState } from "./generation-store";
import { useThemeRuntime } from "./theme-runtime-context";

export function useThemeConversation() {
  const { t, selectSkin } = useThemeRuntime();
  const { data: customSkins } = useLiveQuery(customSkinCollection);
  const conversation = useGenerationState();
  const activeCustomSkin = customSkins.find((skin) => skin.id === t.customSkinId) ?? null;
  const generations = conversation.skinId === t.customSkinId ? conversation.generations : (activeCustomSkin?.generations ?? []);

  // Leaving a saved skin unlinks it so the next generation cannot write through to it; it stays saved.
  // A built-in skin keeps its hand edits, since the generation only repaints what it streams.
  function startNewTheme() {
    if (t.customSkinId) selectSkin(t.skin);
    resetConversation();
  }

  function deleteActiveCustomSkin() {
    if (!t.customSkinId) return;
    deleteCustomSkin(t.customSkinId);
    selectSkin(t.skin);
    resetConversation();
  }

  return {
    customSkins,
    activeCustomSkin,
    generations,
    isOpen: conversation.isOpen,
    isRunning: conversation.isRunning,
    startNewTheme,
    deleteActiveCustomSkin,
  };
}
