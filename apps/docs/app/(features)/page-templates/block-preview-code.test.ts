import { describe, expect, test } from "bun:test";
import { blockEntries } from "@/app/(features)/catalog/blocks";
import { blockPreviewCode } from "./block-preview-code";

describe("block preview code", () => {
  test("uses each block's installable recipe instead of its preview wrapper", () => {
    for (const block of blockEntries) {
      const files = block.paths.files.map((file) => ({ ...file, code: file.path }));
      const recipe = files.find((file) => file.slot === "block");

      if (!recipe) throw new Error(`Missing block recipe in test fixture: ${block.id}`);

      expect(blockPreviewCode({ id: block.id, files })).toBe(recipe.path);
      expect(blockPreviewCode({ id: block.id, files })).not.toBe(block.paths.example.path);
    }
  });

  test("fails when a block does not declare an installable recipe", () => {
    expect(() => blockPreviewCode({ id: "missing", files: [] })).toThrow("Block missing is missing its installable recipe source.");
  });
});
