import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");

describe("the theme editor shell", () => {
  test("the docs floating toolbar hosts the theme editor content", () => {
    const toolbar = read("../../app/(features)/sidebar/floating-toolbar.tsx");
    expect(toolbar).toContain("<ThemeEditorContent");
  });
});
