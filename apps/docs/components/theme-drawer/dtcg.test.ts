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

  test("types what CSS makes typeable and leaves the rest raw", () => {
    const tokens = toDtcg(artifacts.find((artifact) => artifact.baseSkin === "refined") ?? artifacts[0]);
    expect(tokens.light.background.$type).toBe("color");
    expect(tokens.shared["font-mono"].$type).toBe("fontFamily");
    expect(tokens.shared["font-sans"].$type).toBeUndefined();
    expect(tokens.shared["duration-base"].$type).toBe("duration");
    expect(tokens.shared["ease-standard"].$type).toBeUndefined();
    expect(tokens.shared["ease-standard"].$extensions).toEqual({ "dev.control-ui": { raw: true } });
    expect(tokens.light.background.$description).toBe("Base surface color (panels, bubbles read it via bg-background).");
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
