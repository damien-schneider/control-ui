import { expect, test } from "bun:test";
import { DEFAULT_THEME, loadInitialTheme } from "./presets";
import type { ThemeState } from "./types";

const savedTheme: ThemeState = {
  ...DEFAULT_THEME,
  skin: "refined",
  reduceMotion: true,
  labelMode: "css",
  overrides: { "--radius-control": "13px" },
  light: { "--primary": "oklch(0.65 0.15 40)" },
  dark: { "--background": "oklch(0.2 0.01 50)" },
  textFixes: { "--muted-foreground": "#777777" },
  knobs: [{ selector: "[data-control-family=button]", tokens: { "--cui-button-radius": "13px" } }],
  fontUrl: "https://fonts.googleapis.com/css2?family=Inter",
  customSkinId: "saved-custom-skin",
};
const storage = { getItem: () => JSON.stringify(savedTheme) };

for (const skin of ["rig", "refined", "none"] as const) {
  test(`a shared ${skin} preset overrides saved skin edits and keeps editor preferences`, () => {
    expect(loadInitialTheme(`?other=value&skin=${skin}`, storage)).toEqual({
      ...DEFAULT_THEME,
      skin,
      reduceMotion: true,
      labelMode: "css",
    });
  });
}

for (const search of ["", "?skin=", "?skin=unknown", "?skin=toString", "?skin=custom:saved-custom-skin"]) {
  test(`query ${JSON.stringify(search)} preserves the saved theme`, () => {
    expect(loadInitialTheme(search, storage)).toEqual(savedTheme);
  });
}

test("skin IDs in the query are URL decoded", () => {
  expect(loadInitialTheme("?skin=modern%2Dapple", storage).skin).toBe("modern-apple");
});

test("a shared preset works when storage is unavailable", () => {
  const blockedStorage = {
    getItem() {
      throw new Error("Storage is disabled");
    },
  };
  expect(loadInitialTheme("?skin=sketch", blockedStorage)).toEqual({ ...DEFAULT_THEME, skin: "sketch" });
  expect(loadInitialTheme("?skin=unknown", blockedStorage)).toEqual(DEFAULT_THEME);
});
