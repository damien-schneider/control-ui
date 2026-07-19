import { describe, expect, test } from "bun:test";
import { DEFAULT_THEME } from "./presets";
import { buildThemePrompt, parseThemeArtifact, serializeThemeArtifact, validateThemeArtifact } from "./theme-artifact";
import type { ControlUiThemeArtifactV1 } from "./types";

const ARTIFACT: ControlUiThemeArtifactV1 = {
  format: "control-ui-theme/v1",
  name: "Field Notes",
  baseSkin: "refined",
  reduceMotion: false,
  tokens: {
    shared: { "--radius-control": "10px" },
    light: { "--background": "oklch(0.98 0.01 95)" },
    dark: { "--background": "oklch(0.2 0.01 95)" },
  },
};

describe("theme AI prompt", () => {
  test("asks a coding agent to discover the direction and references before writing a portable file", () => {
    const prompt = buildThemePrompt({
      origin: "https://control-ui.example/",
      theme: { ...DEFAULT_THEME, overrides: { "--radius": "12px" } },
    });

    expect(prompt).toContain("ask me to describe the visual direction");
    expect(prompt).toContain("Ask one focused question at a time");
    expect(prompt).toContain("attach one or more reference images");
    expect(prompt).toContain('"baseSkin": "refined"');
    expect(prompt).toContain('"--radius": "12px"');
    expect(prompt).toContain("https://control-ui.example/r/theme-contract.json");
    expect(prompt).toContain("Write exactly one file named <short-name>.control-ui-theme.json");
    expect(prompt).toContain("Do not modify application source files");
    expect(prompt).toContain("import it at https://control-ui.example/theme-ai-builder");
    expect(prompt).toContain("Calculate resolved foreground/background contrast after alpha compositing in both light and dark");
    expect(prompt).toContain("normal and small text at 4.5:1 or higher");
    expect(prompt).toContain("focus indicators and control boundaries at 3:1 or higher");
    expect(prompt).toContain("review the active theme at https://control-ui.example/theme-accessibility");
  });

  test("embeds the canonical contract when a coding agent cannot reach the endpoint", () => {
    const prompt = buildThemePrompt({
      origin: "http://127.0.0.1:3000",
      theme: DEFAULT_THEME,
    });

    expect(prompt).toContain("If it is unreachable, use the embedded contract below");
    expect(prompt).toContain("Embedded canonical contract fallback");
    expect(prompt).toContain("--background [light+dark]");
    expect(prompt).toContain("--radius [shared]");
  });
});

describe("theme artifact parsing and validation", () => {
  test("accepts raw JSON, a fence, and a complete reply containing one fence", () => {
    const raw = serializeThemeArtifact(ARTIFACT);
    expect(parseThemeArtifact(raw)).toEqual({ ok: true, artifact: ARTIFACT });
    expect(parseThemeArtifact(`\`\`\`json\n${raw}\`\`\``)).toEqual({ ok: true, artifact: ARTIFACT });
    expect(parseThemeArtifact(`Here is the result.\n\n\`\`\`control-ui-theme\n${raw}\`\`\`\n`)).toEqual({ ok: true, artifact: ARTIFACT });
  });

  test("reports malformed JSON and unsupported versions", () => {
    expect(parseThemeArtifact("not json")).toEqual({ ok: false, errors: ["No valid JSON object was found in the response."] });
    const result = validateThemeArtifact({ ...ARTIFACT, format: "control-ui-theme/v2" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors).toContain('format must be "control-ui-theme/v1".');
  });

  test("keeps a mismatched base unapplied", () => {
    const result = validateThemeArtifact({ ...ARTIFACT, baseSkin: "xp" }, "refined");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors).toContain("baseSkin is xp; select that skin before previewing this theme.");
  });

  test("rejects unknown and misbucketed tokens with token-specific errors", () => {
    const result = validateThemeArtifact({
      ...ARTIFACT,
      tokens: {
        shared: { "--background": "red", "--unknown": "1px" },
        light: { "--radius": "8px" },
        dark: ARTIFACT.tokens.dark,
      },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain("tokens.shared.--background belongs in light and dark.");
      expect(result.errors).toContain("tokens.shared.--unknown is not part of the theme contract.");
      expect(result.errors).toContain("tokens.light.--radius belongs in shared.");
    }
  });

  test("rejects empty, malformed, declaration-breaking, and remote-loading values", () => {
    const result = validateThemeArtifact({
      ...ARTIFACT,
      tokens: {
        shared: {
          "--radius": "oklch(",
          "--radius-control": "8px; color: red",
          "--font-sans": "url(https://example.com/font.woff2)",
          "--duration-fast": "",
        },
        light: ARTIFACT.tokens.light,
        dark: ARTIFACT.tokens.dark,
      },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain("tokens.shared.--radius has unbalanced CSS syntax.");
      expect(result.errors).toContain("tokens.shared.--radius-control contains declaration-breaking characters.");
      expect(result.errors).toContain("tokens.shared.--font-sans contains unsafe CSS syntax.");
      expect(result.errors).toContain("tokens.shared.--duration-fast must not be empty.");
    }
  });
});
