import { describe, expect, test } from "bun:test";
import type { Rgb } from "./color-utils";
import { hexToOklch, oklchToRgb, rgbToHex } from "./color-utils";
import {
  analyzeContrast,
  contrastFromRgb,
  fixTextForeground,
  maxForegroundRatio,
  nextFixLevel,
  offeredFixLevel,
  textFailsAA,
  wcagLevels,
} from "./contrast";
import { buildOverrideDecls } from "./override-decls";
import { DEFAULT_THEME } from "./presets";

// Test helper: assert non-null without an `as` cast (the codebase forbids assertions except as const).
function str(value: string | null): string {
  if (value === null) throw new Error("expected a non-null hex");
  return value;
}

// SPEC: pins accessibility readout to real WCAG numbers so the oklch-mis-parsed-as-rgb regression can't silently return.
// rgb fixtures = sRGB bytes canvas round-trip yields for refined light tokens (what resolveToRgb MUST produce).
// --foreground/--card-foreground [9,9,11], --card [255,255,255], --muted-foreground [113,113,122], --canvas [244,243,241], --primary [24,24,27], --primary-foreground [250,250,250], --destructive [179,54,43], --destructive-foreground [250,250,250].

const REFINED_LIGHT: Record<string, Rgb> = {
  "--foreground": [9, 9, 11],
  "--card-foreground": [9, 9, 11],
  "--card": [255, 255, 255],
  "--muted-foreground": [113, 113, 122],
  "--canvas": [244, 243, 241],
  "--primary": [24, 24, 27],
  "--primary-foreground": [250, 250, 250],
  "--destructive": [179, 54, 43],
  "--destructive-foreground": [250, 250, 250],
};
const readRefined = (name: string): Rgb | null => REFINED_LIGHT[name] ?? null;

const rgbOfHex = (hex: string): Rgb => {
  const { L, C, H } = hexToOklch(hex);
  return oklchToRgb(L, C, H);
};

describe("contrastFromRgb — WCAG 2.x relative luminance", () => {
  const white: Rgb = [255, 255, 255];
  const black: Rgb = [0, 0, 0];

  test("black on white is the 21:1 maximum", () => {
    expect(contrastFromRgb(black, white)).toBeCloseTo(21, 2);
  });

  test("identical colours are 1:1", () => {
    expect(contrastFromRgb(white, white)).toBeCloseTo(1, 5);
  });

  test("order does not matter (ratio is symmetric)", () => {
    expect(contrastFromRgb(black, white)).toBeCloseTo(contrastFromRgb(white, black), 10);
  });

  test("#767676 grey clears AA on white by a hair (canonical WCAG boundary colour)", () => {
    const ratio = contrastFromRgb([118, 118, 118], white);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
    expect(ratio).toBeLessThan(4.7);
  });
});

describe("wcagLevels — AA (4.5) and AAA (7) pass flags", () => {
  test("21:1 passes both", () => {
    expect(wcagLevels(21)).toEqual({ AA: true, AAA: true });
  });

  test("exactly 7 passes AAA (inclusive boundary)", () => {
    expect(wcagLevels(7)).toEqual({ AA: true, AAA: true });
  });

  test("just under 7 passes AA but not AAA", () => {
    expect(wcagLevels(6.99)).toEqual({ AA: true, AAA: false });
  });

  test("exactly 4.5 passes AA (inclusive boundary), not AAA", () => {
    expect(wcagLevels(4.5)).toEqual({ AA: true, AAA: false });
  });

  test("just under 4.5 fails both", () => {
    expect(wcagLevels(4.49)).toEqual({ AA: false, AAA: false });
  });

  test("1:1 fails both", () => {
    expect(wcagLevels(1)).toEqual({ AA: false, AAA: false });
  });
});

describe("analyzeContrast — the live readout, over an injected token reader", () => {
  test("refined light theme: every text row is legible, with the right AA/AAA split", () => {
    const rows = analyzeContrast(readRefined);
    const byLabel = Object.fromEntries(rows.map((r) => [r.label, r]));

    // Body text + text-on-canvas are near-black on light surfaces → AAA.
    expect(byLabel["Body text"].ratio).toBeGreaterThan(7);
    expect(byLabel["Body text"].levels).toEqual({ AA: true, AAA: true });
    expect(byLabel["Text on canvas"].levels).toEqual({ AA: true, AAA: true });

    // Muted text is intentionally lower-contrast: passes AA, not AAA.
    expect(byLabel["Muted text"].ratio).toBeGreaterThanOrEqual(4.5);
    expect(byLabel["Muted text"].ratio).toBeLessThan(7);
    expect(byLabel["Muted text"].levels).toEqual({ AA: true, AAA: false });

    // Brand button (white on near-black primary) → AAA.
    expect(byLabel["Brand button"].levels).toEqual({ AA: true, AAA: true });
    expect(byLabel["Destructive button"].levels.AA).toBe(true);
  });

  test("a token the reader can't resolve yields ratio=null and both levels false (never a false pass)", () => {
    const rows = analyzeContrast(() => null);
    for (const r of rows) {
      expect(r.ratio).toBeNull();
      expect(r.levels).toEqual({ AA: false, AAA: false });
    }
  });

  test("regression guard: mis-reading oklch(L C H) as rgb channels would NOT pass AA", () => {
    // Old bug fed oklch numbers [0.1405,0.0044,285.824] where sRGB bytes expected; proves broken reader fails Body-text, so fixture-pass above genuinely depends on correct sRGB resolution.
    const brokenReader = (name: string): Rgb | null => {
      if (name === "--card-foreground") return [0.1405, 0.0044, 285.824];
      if (name === "--card") return [1, 0, 0];
      return null;
    };
    const rows = analyzeContrast(brokenReader);
    const body = rows.find((r) => r.label === "Body text");
    expect(body?.levels.AA).toBe(false);
  });
});

describe("textFailsAA — true when ANY fixable row fails AA (every row now has a fix)", () => {
  test("no rows failing → false", () => {
    expect(textFailsAA(analyzeContrast(readRefined))).toBe(false);
  });

  test("a foreground row below 4.5 → true", () => {
    const rows = analyzeContrast((name) => {
      if (name === "--card-foreground") return [170, 170, 170];
      if (name === "--card") return [255, 255, 255];
      return readRefined(name);
    });
    expect(rows.find((r) => r.label === "Body text")?.levels.AA).toBe(false);
    expect(textFailsAA(rows)).toBe(true);
  });

  test("the Brand row failing counts (fixable via the Brand knob)", () => {
    const rows = analyzeContrast((name) => {
      if (name === "--primary-foreground") return [130, 130, 130];
      if (name === "--primary") return [140, 140, 140];
      return readRefined(name);
    });
    expect(rows.find((r) => r.label === "Brand button")?.levels.AA).toBe(false);
    expect(textFailsAA(rows)).toBe(true);
  });

  test("the Destructive row failing counts", () => {
    const rows = analyzeContrast((name) => {
      if (name === "--destructive-foreground") return [180, 180, 180];
      if (name === "--destructive") return [190, 190, 190];
      return readRefined(name);
    });
    expect(rows.find((r) => r.label === "Destructive button")?.levels.AA).toBe(false);
    expect(textFailsAA(rows)).toBe(true);
  });

  test("Muted failing counts too (fixable via the accessibility auto-fix)", () => {
    const rows = analyzeContrast((name) => {
      if (name === "--muted-foreground") return [180, 180, 180];
      if (name === "--card") return [255, 255, 255];
      return readRefined(name);
    });
    expect(rows.find((r) => r.label === "Muted text")?.levels.AA).toBe(false);
    expect(textFailsAA(rows)).toBe(true);
  });

  test("null ratios never count as failing (can't fix what we can't read)", () => {
    expect(textFailsAA(analyzeContrast(() => null))).toBe(false);
  });
});

describe("offeredFixLevel — next unmet level, gated by what the fix can actually reach", () => {
  test("default reach (Infinity) offers the next unmet level", () => {
    // Text on a near-black/near-white surface reaches ~21:1, so no reach arg → the next level shows.
    expect(offeredFixLevel({ AA: false, AAA: false })).toBe("AA");
    expect(offeredFixLevel({ AA: true, AAA: false })).toBe("AAA");
  });

  test("a reachable ratio below the target withholds the chip (no dead button)", () => {
    // A pairing that tops out ~6.2:1 → its AAA upgrade is NOT offered…
    expect(offeredFixLevel({ AA: true, AAA: false }, 6.2)).toBeNull();
    // …but AA (4.5) is reachable, so the → AA fix still shows.
    expect(offeredFixLevel({ AA: false, AAA: false }, 6.2)).toBe("AA");
  });

  test("when the target IS reachable (e.g. Muted on a dark-surface skin), the AAA chip appears", () => {
    // Darkening/lightening the text token can clear 7:1 on a dark surface → the → AAA upgrade shows.
    expect(offeredFixLevel({ AA: true, AAA: false }, 9)).toBe("AAA");
  });

  test("nothing offered once a row passes AAA", () => {
    expect(offeredFixLevel({ AA: true, AAA: true })).toBeNull();
    expect(offeredFixLevel({ AA: true, AAA: true }, 9)).toBeNull();
  });
});

describe("maxForegroundRatio — best ratio a text fix can reach on the given surfaces", () => {
  test("against near-white it reaches the ~21:1 black-text extreme", () => {
    expect(maxForegroundRatio("#000000", [[255, 255, 255]])).toBeGreaterThan(20);
  });

  test("against a mid-tone surface neither black nor white text clears AAA", () => {
    const max = maxForegroundRatio("#000000", [[119, 119, 119]]);
    expect(max).toBeGreaterThanOrEqual(4.5); // AA still reachable
    expect(max).toBeLessThan(7); // AAA is not
  });

  test("takes the WORSE surface (min across backgrounds) so both text rows stay valid", () => {
    const both = maxForegroundRatio("#000000", [
      [255, 255, 255],
      [119, 119, 119],
    ]);
    expect(both).toBeLessThan(7); // pulled down to the mid-tone surface's ceiling
  });

  test("no backgrounds → 0 (nothing reachable)", () => {
    expect(maxForegroundRatio("#000000", [])).toBe(0);
  });
});

describe("rgbToHex", () => {
  test("formats channels as #rrggbb and clamps out-of-range", () => {
    expect(rgbToHex([255, 255, 255])).toBe("#ffffff");
    expect(rgbToHex([0, 0, 0])).toBe("#000000");
    expect(rgbToHex([9, 9, 11])).toBe("#09090b");
    expect(rgbToHex([300, -5, 128])).toBe("#ff0080");
  });
});

describe("nextFixLevel — the level a per-row fix should target", () => {
  test("failing AA → aim for AA first", () => {
    expect(nextFixLevel({ AA: false, AAA: false })).toBe("AA");
  });

  test("clears AA but not AAA → offer the AAA upgrade", () => {
    expect(nextFixLevel({ AA: true, AAA: false })).toBe("AAA");
  });

  test("already AAA → nothing left to fix", () => {
    expect(nextFixLevel({ AA: true, AAA: true })).toBeNull();
  });
});

describe("fixTextForeground — nudge lightness until it clears AA on the hardest surface", () => {
  const bgs: Rgb[] = [
    [255, 255, 255],
    [244, 243, 241],
  ];
  const worst = (hex: string) => Math.min(...bgs.map((b) => contrastFromRgb(rgbOfHex(hex), b)));

  test("already-passing text returns null (no needless edit)", () => {
    expect(fixTextForeground("#000000", bgs)).toBeNull();
  });

  test("light-grey text is darkened until it clears 4.5 on BOTH surfaces", () => {
    const fixed = fixTextForeground("#aaaaaa", bgs);
    expect(fixed).not.toBeNull();
    expect(worst(str(fixed))).toBeGreaterThanOrEqual(4.5);
  });

  test("a saturated failing brand text is fixed while staying a valid colour", () => {
    const fixed = fixTextForeground("#00ff00", bgs);
    expect(fixed).not.toBeNull();
    expect(worst(str(fixed))).toBeGreaterThanOrEqual(4.5);
    expect(fixed).toMatch(/^#[0-9a-f]{6}$/);
  });

  test("returns a darker colour (lower luminance) for text failing on a light surface", () => {
    const fixed = str(fixTextForeground("#999999", bgs));
    expect(contrastFromRgb(rgbOfHex(fixed), [255, 255, 255])).toBeGreaterThan(contrastFromRgb(rgbOfHex("#999999"), [255, 255, 255]));
  });

  test("with an AAA target (7), text that already clears AA is pushed to clear 7 on both surfaces", () => {
    // #555 clears AA on white but not AAA — the upgrade must reach ≥7.
    expect(worst("#555555")).toBeGreaterThanOrEqual(4.5);
    expect(worst("#555555")).toBeLessThan(7);
    const upgraded = fixTextForeground("#555555", bgs, 7);
    expect(upgraded).not.toBeNull();
    expect(worst(str(upgraded))).toBeGreaterThanOrEqual(7);
  });

  test("AAA target returns null when text already clears 7", () => {
    expect(fixTextForeground("#000000", bgs, 7)).toBeNull();
  });
});

describe("textFixes → buildOverrideDecls: the abstract per-token fix lands in ANY theme/mode", () => {
  const declsFor = (textFixes: Record<string, string>, isDark: boolean) => buildOverrideDecls({ ...DEFAULT_THEME, textFixes }, isDark);
  const find = (decls: [string, string][], name: string) => decls.filter(([n]) => n === name).at(-1);

  test("no fixes → no extra declarations (zero behaviour change when unused)", () => {
    expect(buildOverrideDecls(DEFAULT_THEME, false)).toEqual([]);
  });

  test("a fix authors its exact token as an oklch() value, in light AND dark", () => {
    for (const isDark of [false, true]) {
      const decls = declsFor({ "--muted-foreground": "#3a3a3a" }, isDark);
      const decl = find(decls, "--muted-foreground");
      expect(decl).toBeDefined();
      expect(str(decl?.[1] ?? null)).toMatch(/^oklch\(/);
    }
  });

  test("the fix is authored LAST, so it wins over the user's own edit of the same token", () => {
    // With a light-mode edit of --card-foreground in play, textFix for same token must shadow it (fixes land last in inline slate + portal sheet).
    const decls = buildOverrideDecls(
      { ...DEFAULT_THEME, light: { "--card-foreground": "oklch(0.9 0 0)" }, textFixes: { "--card-foreground": "#777777" } },
      false,
    );
    const decl = find(decls, "--card-foreground");
    expect(str(decl?.[1] ?? null)).toMatch(/^oklch\(/);
    expect(decl?.[1]).not.toBe("oklch(0.9 0 0)"); // the fix, not the edit
  });

  test("each fixable text token can be overridden independently", () => {
    const tokens = ["--card-foreground", "--muted-foreground", "--foreground", "--primary-foreground", "--destructive-foreground"];
    for (const token of tokens) {
      const decls = declsFor({ [token]: "#123456" }, false);
      expect(find(decls, token)).toBeDefined();
    }
  });
});

describe("the default theme carries empty override maps (schema stays in sync)", () => {
  test("DEFAULT_THEME ships no overrides and textFixes: {}", () => {
    expect(DEFAULT_THEME.overrides).toEqual({});
    expect(DEFAULT_THEME.light).toEqual({});
    expect(DEFAULT_THEME.dark).toEqual({});
    expect(DEFAULT_THEME.textFixes).toEqual({});
  });
});
