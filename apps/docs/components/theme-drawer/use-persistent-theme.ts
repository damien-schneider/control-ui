"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { skin as activeSkinConfig, setSkin } from "@/components/control-ui/skin.config";
import { SKIN_CONFIGS } from "@/components/skin-registry";
import { useThemeDrawer } from "@/components/theme-drawer-context";
import {
  applyThemeArtifactToLibrary,
  artifactFromThemeProfile,
  deleteThemeFromLibrary,
  duplicateThemeProfile,
  loadCustomThemes,
  profileFromTheme,
  storeCustomThemes,
  themeFromProfile,
  undoThemeApplication,
  uniqueThemeName,
} from "./custom-themes";
import { DEFAULT_THEME, loadStored, store } from "./presets";
import { readContractTokens } from "./read-vars";
import { isColorValuedToken } from "./token-metadata";
import type { ControlUiThemeArtifactV1, CustomThemeProfile, SkinId, ThemeState, TokenValues } from "./types";
import { writeVars } from "./write-vars";

type UndoState = {
  theme: ThemeState;
  createdThemeId: string;
};

type ThemeRuntimeState = {
  theme: ThemeState | null;
  customThemes: CustomThemeProfile[];
  undo: UndoState | null;
  hydrated: boolean;
};

const storageStatusSubscribers = new Set<() => void>();
let storageErrorSnapshot: string | null = null;

function subscribeToStorageStatus(onStoreChange: () => void) {
  storageStatusSubscribers.add(onStoreChange);
  return () => {
    storageStatusSubscribers.delete(onStoreChange);
  };
}

function currentStorageError() {
  return storageErrorSnapshot;
}

function publishStorageError(error: string | null) {
  if (storageErrorSnapshot === error) return;
  storageErrorSnapshot = error;
  for (const subscriber of storageStatusSubscribers) subscriber();
}

function synchronizeActiveProfile(theme: ThemeState, customThemes: CustomThemeProfile[]) {
  if (!theme.customThemeId) return customThemes;
  return customThemes.map((profile) => (profile.id === theme.customThemeId ? profileFromTheme(theme, profile) : profile));
}

export function usePersistentTheme() {
  const { bumpSkinEpoch } = useThemeDrawer();
  const [runtime, setRuntime] = useState<ThemeRuntimeState>({ theme: null, customThemes: [], undo: null, hydrated: false });
  const [values, setValues] = useState<TokenValues>({});
  const storageError = useSyncExternalStore(subscribeToStorageStatus, currentStorageError, () => null);
  const t = runtime.theme ?? DEFAULT_THEME;

  function updateTheme(update: (theme: ThemeState) => ThemeState, autoSave = true) {
    setRuntime((current) => {
      const nextTheme = update(current.theme ?? DEFAULT_THEME);
      return {
        ...current,
        theme: nextTheme,
        customThemes: autoSave ? synchronizeActiveProfile(nextTheme, current.customThemes) : current.customThemes,
      };
    });
  }

  function setTokens(tokenPatch: TokenValues) {
    updateTheme((previous) => {
      const isDark = document.documentElement.classList.contains("dark");
      const next: ThemeState = {
        ...previous,
        overrides: { ...previous.overrides },
        light: { ...previous.light },
        dark: { ...previous.dark },
      };
      for (const [name, value] of Object.entries(tokenPatch)) {
        if (isColorValuedToken(name)) (isDark ? next.dark : next.light)[name] = value;
        else next.overrides[name] = value;
      }
      writeVars(next);
      return next;
    });
  }

  function resetToken(name: string) {
    updateTheme((previous) => {
      const next: ThemeState = {
        ...previous,
        overrides: { ...previous.overrides },
        light: { ...previous.light },
        dark: { ...previous.dark },
      };
      delete next.overrides[name];
      delete next.light[name];
      delete next.dark[name];
      writeVars(next);
      return next;
    });
  }

  function patch(fields: Partial<Pick<ThemeState, "reduceMotion" | "labelMode" | "textFixes">>) {
    updateTheme((previous) => {
      const next = { ...previous, ...fields };
      writeVars(next);
      return next;
    });
  }

  function selectSkin(skin: SkinId) {
    updateTheme((previous) => {
      const next: ThemeState = {
        ...previous,
        skin,
        customThemeId: null,
        overrides: {},
        light: {},
        dark: {},
        textFixes: {},
      };
      writeVars(next);
      return next;
    }, false);
  }

  function selectCustomTheme(id: string) {
    setRuntime((current) => {
      const profile = current.customThemes.find((theme) => theme.id === id);
      if (!profile) return current;
      const nextTheme = themeFromProfile(profile, (current.theme ?? DEFAULT_THEME).labelMode);
      writeVars(nextTheme);
      return { ...current, theme: nextTheme, undo: null };
    });
  }

  function applyArtifact(artifact: ControlUiThemeArtifactV1) {
    if (artifact.baseSkin !== t.skin) return null;
    const applied = applyThemeArtifactToLibrary(t, runtime.customThemes, artifact);
    setRuntime((current) => {
      writeVars(applied.theme);
      return {
        ...current,
        theme: applied.theme,
        customThemes: applied.customThemes,
        undo: applied.undo,
      };
    });
    return applied.profile;
  }

  function undoLastApply() {
    setRuntime((current) => {
      if (!current.undo) return current;
      const restored = undoThemeApplication(current.undo.theme, current.customThemes, current.undo.createdThemeId);
      writeVars(restored.theme);
      return {
        ...current,
        theme: restored.theme,
        customThemes: restored.customThemes,
        undo: null,
      };
    });
  }

  function renameCustomTheme(id: string, name: string) {
    setRuntime((current) => ({
      ...current,
      customThemes: current.customThemes.map((profile) =>
        profile.id === id
          ? { ...profile, name: uniqueThemeName(name, current.customThemes, id), updatedAt: new Date().toISOString() }
          : profile,
      ),
    }));
  }

  function duplicateCustomTheme(id: string) {
    setRuntime((current) => {
      const profile = current.customThemes.find((theme) => theme.id === id);
      if (!profile) return current;
      const duplicate = duplicateThemeProfile(profile, current.customThemes);
      const nextTheme = themeFromProfile(duplicate, (current.theme ?? DEFAULT_THEME).labelMode);
      writeVars(nextTheme);
      return { ...current, theme: nextTheme, customThemes: [...current.customThemes, duplicate], undo: null };
    });
  }

  function deleteCustomTheme(id: string) {
    setRuntime((current) => {
      const deleted = deleteThemeFromLibrary(current.theme ?? DEFAULT_THEME, current.customThemes, id);
      writeVars(deleted.theme);
      return { ...current, theme: deleted.theme, customThemes: deleted.customThemes, undo: null };
    });
  }

  function exportCustomTheme(id: string) {
    const profile = runtime.customThemes.find((theme) => theme.id === id);
    return profile ? artifactFromThemeProfile(profile) : null;
  }

  useEffect(() => {
    queueMicrotask(() => {
      const customThemes = loadCustomThemes();
      const restored = loadStored() ?? DEFAULT_THEME;
      const activeProfileExists = customThemes.some((profile) => profile.id === restored.customThemeId);
      const theme = restored.customThemeId && !activeProfileExists ? { ...restored, customThemeId: null } : restored;
      setRuntime({ theme, customThemes, undo: null, hydrated: true });
    });
  }, []);

  useEffect(() => {
    if (!runtime.hydrated || !runtime.theme) return;
    const activeStateStored = store(runtime.theme);
    const libraryStored = storeCustomThemes(runtime.customThemes);
    publishStorageError(
      activeStateStored && libraryStored
        ? null
        : "This theme is active, but the browser could not save it. Export the theme before leaving this page.",
    );
  }, [runtime.customThemes, runtime.hydrated, runtime.theme]);

  useEffect(() => {
    if (!runtime.theme) return;
    writeVars(runtime.theme);
    const frame = requestAnimationFrame(() => setValues(readContractTokens()));
    return () => cancelAnimationFrame(frame);
  }, [runtime.theme]);

  useEffect(() => {
    if (!runtime.theme || activeSkinConfig.id === runtime.theme.skin) return;
    setSkin(SKIN_CONFIGS[runtime.theme.skin]);
    bumpSkinEpoch();
  }, [runtime.theme, bumpSkinEpoch]);

  const themeRef = useRef(t);
  useEffect(() => {
    themeRef.current = t;
  }, [t]);
  useEffect(() => {
    const observer = new MutationObserver(() => {
      writeVars(themeRef.current);
      setValues(readContractTokens());
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return {
    t,
    values,
    customThemes: runtime.customThemes,
    storageError,
    canUndo: runtime.undo !== null,
    setTokens,
    resetToken,
    patch,
    selectSkin,
    selectCustomTheme,
    applyArtifact,
    undoLastApply,
    renameCustomTheme,
    duplicateCustomTheme,
    deleteCustomTheme,
    exportCustomTheme,
  };
}
