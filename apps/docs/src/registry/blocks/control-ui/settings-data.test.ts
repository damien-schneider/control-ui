import { describe, expect, test } from "bun:test";
import type { SettingsPageDefinition } from "./settings-data";
import { normalizeSettingsSearchText, searchSettings } from "./settings-data";

const control = () => null;
const pages = [
  {
    id: "general",
    title: "General",
    sections: [
      {
        id: "preferences",
        title: "Preferences",
        settings: [
          { id: "language", title: "Language", description: "Language for the app UI", renderControl: control },
          {
            id: "menu-bar",
            title: "Show in menu bar",
            description: "Keep the app available when its window is closed",
            keywords: ["menub", "tray", "macOS"],
            renderControl: control,
          },
        ],
      },
    ],
  },
  {
    id: "personalization",
    title: "Personalization",
    sections: [
      {
        id: "responses",
        title: "Responses",
        settings: [{ id: "tone", title: "Réponse tone", description: "Choose a writing voice", renderControl: control }],
      },
    ],
  },
] satisfies readonly SettingsPageDefinition[];

describe("settings search", () => {
  test("normalizes case, whitespace, and diacritics", () => {
    expect(normalizeSettingsSearchText("  RÉPONSE   Tone ")).toBe("reponse tone");
  });

  test("searches titles, descriptions, keywords, pages, and sections", () => {
    expect(searchSettings(pages, "menub")[0]?.setting.id).toBe("menu-bar");
    expect(searchSettings(pages, "closed")[0]?.setting.id).toBe("menu-bar");
    expect(searchSettings(pages, "personalization")[0]?.setting.id).toBe("tone");
    expect(searchSettings(pages, "responses")[0]?.setting.id).toBe("tone");
    expect(searchSettings(pages, "reponse")[0]?.setting.id).toBe("tone");
  });

  test("ranks direct title matches before metadata and preserves source order for ties", () => {
    expect(searchSettings(pages, "language").map((result) => result.setting.id)).toEqual(["language"]);
    expect(searchSettings(pages, "app").map((result) => result.setting.id)).toEqual(["language", "menu-bar"]);
  });

  test("returns no results for an empty or unmatched query", () => {
    expect(searchSettings(pages, "   ")).toEqual([]);
    expect(searchSettings(pages, "billing")).toEqual([]);
  });
});
