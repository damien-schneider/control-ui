import { describe, expect, test } from "bun:test";
import { createThemeFaviconUrl } from "@/app/(features)/theme/favicon";

describe("theme favicon", () => {
  test("draws the complete site logo with the live sidebar colors", () => {
    const url = createThemeFaviconUrl("oklch(0.2 0.01 60)", "oklch(0.9 0.02 80)");
    const svg = decodeURIComponent(url.slice(url.indexOf(",") + 1));

    expect(url).toStartWith("data:image/svg+xml,");
    expect(svg).toContain('<rect width="512" height="512" fill="oklch(0.2 0.01 60)"/>');
    expect(svg).toContain('<rect x="66" y="85" width="381" height="150" rx="75" fill="oklch(0.9 0.02 80)"/>');
    expect(svg).toContain('<rect x="215" y="104" width="213" height="112" rx="56" fill="oklch(0.2 0.01 60)"/>');
    expect(svg).toContain('<rect x="66" y="278" width="381" height="150" rx="75" fill="oklch(0.9 0.02 80)"/>');
    expect(svg).toContain('<rect x="133" y="312" width="20" height="84" rx="10" fill="oklch(0.9 0.02 80)"/>');
  });
});
