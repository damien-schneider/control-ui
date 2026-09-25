import { describe, expect, test } from "bun:test";
import { COLOR_RAMPS, THEME_CONTRACT } from "@/src/registry/lib/theme-contract";
import { THEME_AUDIT_PAIRS } from "./audit-contract";

const AUDIT_EXEMPTION_BY_TOKEN: Record<string, string> = {
  "--ring-opacity": "Scalar alpha input already reflected by --border and --ring paints.",
  ...Object.fromEntries(COLOR_RAMPS.map((ramp) => [`--scale-${ramp}-seed`, "Ramp seed, audited through the roles its steps feed."])),
};

describe("theme accessibility contract", () => {
  test("every canonical color paint is audited or explicitly exempt", () => {
    const auditedTokens = new Set(
      THEME_AUDIT_PAIRS.flatMap((pair) => [
        pair.foreground,
        pair.background,
        pair.surface,
        ...(pair.underlays ?? []),
        ...(pair.dependencies ?? []),
      ]),
    );
    const colorTokens = THEME_CONTRACT.filter((token) => token.group === "color").map((token) => token.name);
    const missingTokens = colorTokens.filter((token) => !auditedTokens.has(token) && !AUDIT_EXEMPTION_BY_TOKEN[token]);
    const staleExemptions = Object.keys(AUDIT_EXEMPTION_BY_TOKEN).filter((token) => !colorTokens.includes(token));

    expect(missingTokens).toEqual([]);
    expect(staleExemptions).toEqual([]);
  });
});
