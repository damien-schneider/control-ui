"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

import { DEFAULT_THEME, loadStored, store } from "./presets";
import { readContractTokens } from "./read-vars";
import { isColorValuedToken } from "./token-metadata";
import type { SkinId, ThemeState, TokenValues } from "./types";
import { writeVars } from "./write-vars";

type ThemeRuntimeState = {
  theme: ThemeState | null;
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

export function usePersistentTheme() {
  const [runtime, setRuntime] = useState<ThemeRuntimeState>({ theme: null, hydrated: false });
  const [values, setValues] = useState<TokenValues>({});
  const [isDark, setIsDark] = useState(false);
  const storageError = useSyncExternalStore(subscribeToStorageStatus, currentStorageError, () => null);
  const t = runtime.theme ?? DEFAULT_THEME;

  function updateTheme(update: (theme: ThemeState) => ThemeState) {
    setRuntime((current) => ({ ...current, theme: update(current.theme ?? DEFAULT_THEME) }));
  }

  function writeTokens(next: ThemeState, tokenPatch: TokenValues, darkActive: boolean) {
    for (const [name, value] of Object.entries(tokenPatch)) {
      if (isColorValuedToken(name)) (darkActive ? next.dark : next.light)[name] = value;
      else next.overrides[name] = value;
    }
    writeVars(next);
    return next;
  }

  function setTokens(tokenPatch: TokenValues) {
    updateTheme((previous) => {
      const darkActive = document.documentElement.classList.contains("dark");
      return writeTokens(
        { ...previous, overrides: { ...previous.overrides }, light: { ...previous.light }, dark: { ...previous.dark } },
        tokenPatch,
        darkActive,
      );
    });
  }

  // A generation wipes the active mode on its first chunk and repaints as the stream lands, so a stream
  // that dies mid-object leaves a half-written theme the user never chose and cannot undo.
  function snapshotTheme(): ThemeState {
    return structuredClone(t);
  }

  function restoreTheme(snapshot: ThemeState) {
    updateTheme(() => {
      const next = structuredClone(snapshot);
      writeVars(next);
      return next;
    });
  }

  // Clears the generated mode and textFixes, never the other mode: a contrast "Fix" is written last by
  // buildOverrideDecls and would otherwise pin old foregrounds over every future theme, while the
  // untouched mode holds hand-tuned tokens the user never asked to discard. overrides survives for the
  // same reason — every generation rewrites all 33 mode-independent tokens it knows, so nothing there can
  // go stale, and what remains is tuning the generator has no vocabulary for.
  function applyGeneratedTheme(tokenPatch: TokenValues) {
    updateTheme((previous) => {
      const darkActive = document.documentElement.classList.contains("dark");
      return writeTokens(
        {
          ...previous,
          overrides: { ...previous.overrides },
          light: darkActive ? { ...previous.light } : {},
          dark: darkActive ? {} : { ...previous.dark },
          textFixes: {},
        },
        tokenPatch,
        darkActive,
      );
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
        overrides: {},
        light: {},
        dark: {},
        textFixes: {},
      };
      writeVars(next);
      return next;
    });
  }

  useLayoutEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    const theme = loadStored() ?? DEFAULT_THEME;
    writeVars(theme);
    setRuntime({ theme, hydrated: true });
  }, []);

  useEffect(() => {
    if (!runtime.hydrated || !runtime.theme) return;
    publishStorageError(
      store(runtime.theme)
        ? null
        : "This theme is active, but the browser could not save it. Copy the CSS variables before leaving this page.",
    );
  }, [runtime.hydrated, runtime.theme]);

  useEffect(() => {
    if (!runtime.theme) return;
    writeVars(runtime.theme);
    const frame = requestAnimationFrame(() => setValues(readContractTokens()));
    return () => cancelAnimationFrame(frame);
  }, [runtime.theme]);

  const themeRef = useRef(t);
  useEffect(() => {
    themeRef.current = t;
  }, [t]);
  useEffect(() => {
    const observer = new MutationObserver(() => {
      writeVars(themeRef.current);
      setIsDark(document.documentElement.classList.contains("dark"));
      setValues(readContractTokens());
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return {
    t,
    values,
    isDark,
    storageError,
    setTokens,
    applyGeneratedTheme,
    resetToken,
    patch,
    selectSkin,
    snapshotTheme,
    restoreTheme,
  };
}
