import { describe, expect, test } from "bun:test";
import { DEFAULT_SKIN_ID } from "@/components/theme";
import { DEFAULT_THEME } from "./presets";
import { themeArtifactBrief } from "./theme-artifact";
import { toCss } from "./write-vars";

describe("theme artifact brief", () => {
  test("asks a coding agent to discover the direction and references before writing a portable file", () => {
    const prompt = themeArtifactBrief({
      origin: "https://control-ui.example/",
      baseSkin: DEFAULT_SKIN_ID,
      discoveryMode: "new-direction",
    });

    expect(prompt).toContain("ask me to describe the visual direction");
    expect(prompt).toContain("Ask one focused question at a time");
    expect(prompt).toContain("If I have attached no reference images yet, ask for them");
    expect(prompt).toContain(`"baseSkin": "${DEFAULT_SKIN_ID}"`);
    expect(prompt).toContain("https://control-ui.example/r/theme-contract.json");
    expect(prompt).toContain("Write exactly one file named <short-name>.control-ui-theme.json");
    expect(prompt).toContain("Do not modify application source files");
    expect(prompt).toContain("Calculate resolved foreground/background contrast after alpha compositing in both light and dark");
    expect(prompt).toContain("normal and small text at 4.5:1 or higher");
    expect(prompt).toContain("focus indicators and control boundaries at 3:1 or higher");
    expect(prompt).toContain("point me at https://control-ui.example/theme-accessibility to review the active theme");
  });

  test("embeds the canonical contract when a coding agent cannot reach the endpoint", () => {
    const prompt = themeArtifactBrief({ origin: "http://127.0.0.1:3000", baseSkin: DEFAULT_SKIN_ID, discoveryMode: "new-direction" });

    expect(prompt).toContain("If it is unreachable, use the embedded contract below");
    expect(prompt).toContain("Embedded canonical contract fallback");
    expect(prompt).toContain("--background [light+dark]");
    expect(prompt).toContain("--radius [shared]");
  });
});

test("the drawer copies a none-skin theme as root CSS without a skin dependency", () => {
  const copied = toCss({ ...DEFAULT_THEME, skin: "none", overrides: { "--radius": "4px" } });
  expect(copied).toContain(":root {");
  expect(copied).not.toContain("[data-skin");
});
