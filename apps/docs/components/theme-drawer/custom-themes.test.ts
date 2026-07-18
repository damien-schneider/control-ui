import { describe, expect, test } from "bun:test";
import { CUSTOM_THEME_STORAGE_KEY, LEGACY_THEME_EDITOR_STORAGE_KEY, THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import {
  applyThemeArtifactToLibrary,
  artifactFromThemeProfile,
  createThemeProfile,
  deleteThemeFromLibrary,
  duplicateThemeProfile,
  loadCustomThemes,
  profileFromTheme,
  storeCustomThemes,
  themeFromProfile,
  undoThemeApplication,
} from "./custom-themes";
import { DEFAULT_THEME, loadStored, store } from "./presets";
import { parseThemeArtifact, serializeThemeArtifact } from "./theme-artifact";
import type { ControlUiThemeArtifactV1 } from "./types";

const ARTIFACT: ControlUiThemeArtifactV1 = {
  format: "control-ui-theme/v1",
  name: "Local Paper",
  baseSkin: "refined",
  reduceMotion: true,
  tokens: {
    shared: { "--radius-control": "12px" },
    light: { "--background": "oklch(0.98 0.01 90)" },
    dark: { "--background": "oklch(0.18 0.01 90)" },
  },
};

function memoryStorage(initial: Record<string, string> = {}) {
  const entries = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => entries.set(key, value),
    removeItem: (key: string) => entries.delete(key),
    entries,
  };
}

describe("theme editor storage", () => {
  test("migrates v1 state while retaining its built-in skin and edits", () => {
    const storage = memoryStorage({
      [LEGACY_THEME_EDITOR_STORAGE_KEY]: JSON.stringify({
        skin: "xp",
        reduceMotion: true,
        labelMode: "css",
        overrides: { "--radius": "2px" },
        light: { "--background": "white" },
        dark: { "--background": "black" },
      }),
    });
    const restored = loadStored(storage);
    expect(restored).toEqual({
      ...DEFAULT_THEME,
      skin: "xp",
      reduceMotion: true,
      labelMode: "css",
      overrides: { "--radius": "2px" },
      light: { "--background": "white" },
      dark: { "--background": "black" },
    });
    expect(store(restored ?? DEFAULT_THEME, storage)).toBe(true);
    expect(storage.entries.has(THEME_EDITOR_STORAGE_KEY)).toBe(true);
    expect(storage.entries.has(LEGACY_THEME_EDITOR_STORAGE_KEY)).toBe(false);
  });

  test("ignores corrupted data and reports quota failures", () => {
    expect(loadCustomThemes(memoryStorage({ [CUSTOM_THEME_STORAGE_KEY]: "not json" }))).toEqual([]);
    const quotaStorage = {
      setItem: () => {
        throw new Error("quota");
      },
    };
    expect(storeCustomThemes([], quotaStorage)).toBe(false);
  });

  test("writes an explicit v1 custom-theme store envelope", () => {
    const storage = memoryStorage();
    const profile = createThemeProfile(ARTIFACT, [], { id: "stored" });
    expect(storeCustomThemes([profile], storage)).toBe(true);
    expect(JSON.parse(storage.entries.get(CUSTOM_THEME_STORAGE_KEY) ?? "{}")).toEqual({ version: 1, themes: [profile] });
    expect(loadCustomThemes(storage)).toEqual([profile]);
  });
});

describe("custom theme library", () => {
  test("creates new local IDs and resolves name collisions", () => {
    const first = createThemeProfile(ARTIFACT, [], { id: "first", now: "2026-01-01T00:00:00.000Z" });
    const second = createThemeProfile(ARTIFACT, [first], { id: "second", now: "2026-01-02T00:00:00.000Z" });
    const duplicate = duplicateThemeProfile(first, [first, second], { id: "third", now: "2026-01-03T00:00:00.000Z" });
    expect(first.name).toBe("Local Paper");
    expect(second.name).toBe("Local Paper 2");
    expect(second.id).not.toBe(first.id);
    expect(duplicate.name).toBe("Local Paper copy");
  });

  test("auto-saves active manual edits into its profile", () => {
    const profile = createThemeProfile(ARTIFACT, [], { id: "active", now: "2026-01-01T00:00:00.000Z" });
    const activeTheme = themeFromProfile(profile, "friendly");
    const saved = profileFromTheme(
      { ...activeTheme, overrides: { ...activeTheme.overrides, "--radius-panel": "20px" } },
      profile,
      "2026-01-02T00:00:00.000Z",
    );
    expect(saved.overrides["--radius-panel"]).toBe("20px");
    expect(saved.updatedAt).toBe("2026-01-02T00:00:00.000Z");
  });

  test("exports and re-imports a portable artifact", () => {
    const profile = createThemeProfile(ARTIFACT, [], { id: "exported" });
    const exported = artifactFromThemeProfile(profile);
    expect(parseThemeArtifact(serializeThemeArtifact(exported))).toEqual({ ok: true, artifact: exported });
  });

  test("deleting the active custom theme falls back to a clean built-in base", () => {
    const profile = createThemeProfile(ARTIFACT, [], { id: "active" });
    const deleted = deleteThemeFromLibrary(themeFromProfile(profile, "css"), [profile], profile.id);
    expect(deleted.customThemes).toEqual([]);
    expect(deleted.theme).toEqual({ ...DEFAULT_THEME, skin: "refined", labelMode: "css" });
  });

  test("apply creates a theme and undo restores the exact previous active state", () => {
    const previous = { ...DEFAULT_THEME, skin: "flat" as const, overrides: { "--radius": "0px" } };
    const matchingArtifact = { ...ARTIFACT, baseSkin: "flat" as const };
    const applied = applyThemeArtifactToLibrary(previous, [], matchingArtifact, { id: "created", now: "2026-01-01T00:00:00.000Z" });
    expect(applied.theme.customThemeId).toBe("created");
    expect(applied.customThemes).toHaveLength(1);
    const restored = undoThemeApplication(applied.undo.theme, applied.customThemes, applied.undo.createdThemeId);
    expect(restored.theme).toEqual(previous);
    expect(restored.customThemes).toEqual([]);
  });
});
