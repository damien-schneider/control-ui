import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/*
 * theme editor must render INSIDE SkinEpochBoundary — it morphs out of docs floating toolbar, so DocsShell is what has to sit inside.
 * skinSlot() resolves against mutable user-owned skin.config getters, invisible to React Compiler as dependency — memoized components freeze classes from their last re-render; epoch remount re-resolves every slot after setSkin().
 * Outside boundary: each skin tile in editor kept look of whichever skin was active when its `active` prop last flipped — patchwork of half-applied skins.
 */

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");

describe("the theme editor sits inside the SkinEpochBoundary", () => {
  test("layout.tsx mounts <DocsShell> between the boundary tags", () => {
    const layout = read("../../app/layout.tsx");
    const open = layout.indexOf("<SkinEpochBoundary>");
    const close = layout.indexOf("</SkinEpochBoundary>");
    const shell = layout.indexOf("<DocsShell ");
    expect(open).toBeGreaterThan(-1);
    expect(close).toBeGreaterThan(open);
    expect(shell).toBeGreaterThan(open);
    expect(shell).toBeLessThan(close);
  });

  test("the docs floating toolbar hosts the theme editor content", () => {
    const sidebar = read("../../app/(features)/sidebar/sidebar.tsx");
    expect(sidebar).toContain("<ThemeEditorContent");
  });
});
