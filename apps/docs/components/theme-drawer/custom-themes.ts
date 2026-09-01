import { CUSTOM_THEME_STORAGE_KEY } from "@/components/theme";
import { hexToOklchColor } from "./color-utils";
import { toDtcg } from "./dtcg";
import { isSkinId } from "./presets";
import { themeArtifactCss } from "./theme-artifact";
import type { ControlUiThemeArtifactV1, CustomThemeProfile, LabelMode, ThemeState, TokenValues } from "./types";

type ThemeProfileOptions = {
  id?: string;
  now?: string;
};

function readTokenMap(value: unknown): TokenValues {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
  const tokens: TokenValues = {};
  for (const [name, tokenValue] of Object.entries(value)) {
    if (name.startsWith("--") && typeof tokenValue === "string" && tokenValue.trim()) tokens[name] = tokenValue;
  }
  return tokens;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readCustomTheme(value: unknown): CustomThemeProfile | null {
  if (!isRecord(value)) return null;
  const profile = value;
  if (
    typeof profile.id !== "string" ||
    !profile.id ||
    typeof profile.name !== "string" ||
    !profile.name.trim() ||
    !isSkinId(profile.baseSkin) ||
    typeof profile.createdAt !== "string" ||
    typeof profile.updatedAt !== "string"
  ) {
    return null;
  }
  return {
    id: profile.id,
    name: profile.name.trim(),
    baseSkin: profile.baseSkin,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    reduceMotion: profile.reduceMotion === true,
    overrides: readTokenMap(profile.overrides),
    light: readTokenMap(profile.light),
    dark: readTokenMap(profile.dark),
    textFixes: readTokenMap(profile.textFixes),
  };
}

function newThemeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `theme-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function storedThemeValues(stored: unknown): unknown[] {
  if (Array.isArray(stored)) return stored;
  if (isRecord(stored) && stored.version === 1 && Array.isArray(stored.themes)) return stored.themes;
  return [];
}

export function loadCustomThemes(storage: Pick<Storage, "getItem"> = localStorage): CustomThemeProfile[] {
  try {
    const raw = storage.getItem(CUSTOM_THEME_STORAGE_KEY);
    if (!raw) return [];
    const stored: unknown = JSON.parse(raw);
    const themes = storedThemeValues(stored);
    return themes.flatMap((value) => {
      const profile = readCustomTheme(value);
      return profile ? [profile] : [];
    });
  } catch {
    return [];
  }
}

export function storeCustomThemes(themes: CustomThemeProfile[], storage: Pick<Storage, "setItem"> = localStorage): boolean {
  try {
    storage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify({ version: 1, themes }));
    return true;
  } catch {
    return false;
  }
}

export function uniqueThemeName(name: string, themes: CustomThemeProfile[], ignoredId?: string) {
  const requested = name.trim() || "Custom theme";
  const names = new Set(themes.filter((theme) => theme.id !== ignoredId).map((theme) => theme.name.toLocaleLowerCase()));
  if (!names.has(requested.toLocaleLowerCase())) return requested;
  let suffix = 2;
  while (names.has(`${requested} ${suffix}`.toLocaleLowerCase())) suffix += 1;
  return `${requested} ${suffix}`;
}

export function createThemeProfile(
  artifact: ControlUiThemeArtifactV1,
  themes: CustomThemeProfile[],
  options: ThemeProfileOptions = {},
): CustomThemeProfile {
  const now = options.now ?? new Date().toISOString();
  return {
    id: options.id ?? newThemeId(),
    name: uniqueThemeName(artifact.name, themes),
    baseSkin: artifact.baseSkin,
    createdAt: now,
    updatedAt: now,
    reduceMotion: artifact.reduceMotion,
    overrides: { ...artifact.tokens.shared },
    light: { ...artifact.tokens.light },
    dark: { ...artifact.tokens.dark },
    textFixes: {},
  };
}

export function duplicateThemeProfile(
  profile: CustomThemeProfile,
  themes: CustomThemeProfile[],
  options: ThemeProfileOptions = {},
): CustomThemeProfile {
  const artifact = artifactFromThemeProfile(profile);
  return createThemeProfile({ ...artifact, name: `${profile.name} copy` }, themes, options);
}

export function themeFromProfile(profile: CustomThemeProfile, labelMode: LabelMode): ThemeState {
  return {
    skin: profile.baseSkin,
    customThemeId: profile.id,
    reduceMotion: profile.reduceMotion,
    labelMode,
    overrides: { ...profile.overrides },
    light: { ...profile.light },
    dark: { ...profile.dark },
    textFixes: { ...profile.textFixes },
  };
}

export function profileFromTheme(theme: ThemeState, profile: CustomThemeProfile, now = new Date().toISOString()): CustomThemeProfile {
  return {
    ...profile,
    baseSkin: theme.skin,
    updatedAt: now,
    reduceMotion: theme.reduceMotion,
    overrides: { ...theme.overrides },
    light: { ...theme.light },
    dark: { ...theme.dark },
    textFixes: { ...theme.textFixes },
  };
}

export function applyThemeArtifactToLibrary(
  currentTheme: ThemeState,
  themes: CustomThemeProfile[],
  artifact: ControlUiThemeArtifactV1,
  options: ThemeProfileOptions = {},
) {
  const profile = createThemeProfile(artifact, themes, options);
  return {
    profile,
    theme: themeFromProfile(profile, currentTheme.labelMode),
    customThemes: [...themes, profile],
    undo: { theme: currentTheme, createdThemeId: profile.id },
  };
}

export function undoThemeApplication(theme: ThemeState, themes: CustomThemeProfile[], createdThemeId: string) {
  return {
    theme,
    customThemes: themes.filter((profile) => profile.id !== createdThemeId),
  };
}

export function deleteThemeFromLibrary(theme: ThemeState, themes: CustomThemeProfile[], id: string) {
  const profile = themes.find((candidate) => candidate.id === id);
  if (!profile) return { theme, customThemes: themes };
  const customThemes = themes.filter((candidate) => candidate.id !== id);
  if (theme.customThemeId !== id) return { theme, customThemes };
  return {
    theme: {
      ...theme,
      skin: profile.baseSkin,
      customThemeId: null,
      reduceMotion: false,
      overrides: {},
      light: {},
      dark: {},
      textFixes: {},
    },
    customThemes,
  };
}

export function artifactFromThemeProfile(profile: CustomThemeProfile): ControlUiThemeArtifactV1 {
  const textFixes = Object.fromEntries(Object.entries(profile.textFixes).map(([name, value]) => [name, hexToOklchColor(value)]));
  return {
    format: "control-ui-theme/v1",
    name: profile.name,
    baseSkin: profile.baseSkin,
    reduceMotion: profile.reduceMotion,
    tokens: {
      shared: { ...profile.overrides },
      light: { ...profile.light, ...textFixes },
      dark: { ...profile.dark, ...textFixes },
    },
  };
}

export function themeArtifactFilename(name: string, extension: "json" | "css" | "tokens.json" = "json") {
  const slug = name
    .trim()
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${slug || "control-ui-theme"}.control-ui-theme.${extension}`;
}

export function downloadFile(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadThemeArtifact(artifact: ControlUiThemeArtifactV1) {
  downloadFile(themeArtifactFilename(artifact.name), `${JSON.stringify(artifact, null, 2)}\n`, "application/json");
}

/** The same file the doctor emits, for the reader who has the artifact in the browser rather than on disk. */
export function downloadThemeCss(artifact: ControlUiThemeArtifactV1) {
  downloadFile(themeArtifactFilename(artifact.name, "css"), themeArtifactCss(artifact), "text/css");
}

/** DTCG shape, for importing the theme into Tokens Studio or Figma variables; it imports back here unchanged. */
export function downloadThemeTokens(artifact: ControlUiThemeArtifactV1) {
  downloadFile(themeArtifactFilename(artifact.name, "tokens.json"), `${JSON.stringify(toDtcg(artifact), null, 2)}\n`, "application/json");
}
