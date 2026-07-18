import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/*
 * ThemeDrawer must render INSIDE SkinEpochBoundary.
 * skinSlot() resolves against mutable user-owned skin.config getters, invisible to React Compiler as a dependency — memoized components freeze classes from their last re-render; epoch remount re-resolves every slot after setSkin().
 * Outside boundary: each skin tile in drawer kept look of whichever skin was active when its `active` prop last flipped — patchwork of half-applied skins.
 */

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");

describe("ThemeDrawer sits inside the SkinEpochBoundary", () => {
  test("layout.tsx mounts <ThemeDrawer /> between the boundary tags", () => {
    const layout = read("../../app/layout.tsx");
    const open = layout.indexOf("<SkinEpochBoundary>");
    const close = layout.indexOf("</SkinEpochBoundary>");
    const drawer = layout.indexOf("<ThemeDrawer />");
    expect(open).toBeGreaterThan(-1);
    expect(close).toBeGreaterThan(open);
    expect(drawer).toBeGreaterThan(open);
    expect(drawer).toBeLessThan(close);
  });
});
