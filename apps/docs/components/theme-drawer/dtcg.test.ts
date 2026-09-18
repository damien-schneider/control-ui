import { describe, expect, test } from "bun:test";
import { packThemeArtifacts } from "@/scripts/pack-theme-artifacts";
import { artifactFromDtcg, isDtcg, toDtcg } from "./dtcg";
import { parseThemeArtifact, validateThemeArtifact } from "./theme-artifact";

const artifacts = packThemeArtifacts();

describe("DTCG theme tokens", () => {
  for (const artifact of artifacts) {
    test(`round-trips the ${artifact.baseSkin} pack artifact unchanged`, () => {
      const result = validateThemeArtifact(artifactFromDtcg(toDtcg(artifact)));
      if (!result.ok) throw new Error(result.errors.join("; "));
      expect(result.artifact).toEqual(artifact);
    });
  }

  test("exports literal fonts and durations as typed tokens while preserving CSS expressions", () => {
    const tokens = toDtcg({
      ...artifacts[0],
      tokens: {
        shared: {
          "--font-mono": '"Test Mono", monospace',
          "--font-sans": "var(--app-font), sans-serif",
          "--duration-base": "200ms",
          "--ease-standard": "cubic-bezier(0.2, 0, 0, 1)",
        },
        light: { "--background": "oklch(0.95 0.01 40)" },
        dark: {},
      },
    });
    expect(tokens.light.background.$type).toBe("color");
    expect(tokens.shared["font-mono"].$type).toBe("fontFamily");
    expect(tokens.shared["font-sans"].$type).toBeUndefined();
    expect(tokens.shared["font-sans"].$value).toBe("var(--app-font), sans-serif");
    expect(tokens.shared["duration-base"].$type).toBe("duration");
    expect(tokens.shared["ease-standard"].$extensions).toEqual({ "dev.control-ui": { raw: true } });
  });

  test("accepts the object value forms a design tool hands back", () => {
    const tokens = toDtcg(artifacts[0]);
    const rebuilt = artifactFromDtcg({
      ...tokens,
      shared: { radius: { $value: { value: 12, unit: "px" } } },
      light: { background: { $value: { colorSpace: "srgb", components: [1, 0.5, 0], alpha: 0.5 } } },
      dark: {},
    });
    const result = validateThemeArtifact(rebuilt);
    if (!result.ok) throw new Error(result.errors.join("; "));
    expect(result.artifact.tokens.shared["--radius"]).toBe("12px");
    expect(result.artifact.tokens.light["--background"]).toBe("rgb(255 128 0 / 0.5)");
  });

  test("a pasted DTCG file parses as a theme, and a plain artifact still does", () => {
    const artifact = artifacts[0];
    const fromTokens = parseThemeArtifact(JSON.stringify(toDtcg(artifact)));
    if (!fromTokens.ok) throw new Error(fromTokens.errors.join("; "));
    expect(fromTokens.artifact).toEqual(artifact);
    expect(isDtcg(artifact)).toBe(false);
    const fromArtifact = parseThemeArtifact(JSON.stringify(artifact));
    expect(fromArtifact.ok).toBe(true);
  });
});
