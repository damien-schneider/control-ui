import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import postcss from "postcss";

const CODE_CSS = postcss.parse(readFileSync(fileURLToPath(new URL("./code.css", import.meta.url)), "utf8"));

function declarationsFor(selector: string): Map<string, string> {
  const declarations = new Map<string, string>();
  CODE_CSS.walkRules(selector, (rule) => {
    rule.walkDecls(/^--(?:code|diff)-/, (declaration) => {
      declarations.set(declaration.prop, declaration.value);
    });
  });
  return declarations;
}

describe("code theme defaults", () => {
  test("provides the complete code and diff palette in both root color modes", () => {
    const light = declarationsFor(":where(:root)");
    const dark = declarationsFor(":where(.dark)");

    expect(light.size).toBeGreaterThan(0);
    expect([...dark.keys()].sort()).toEqual([...light.keys()].sort());
    expect(dark.get("--diff-add-line")).toBe("oklch(0.5 0.11 150 / 0.22)");
    expect(dark.get("--diff-del-line")).toBe("oklch(0.55 0.16 22 / 0.24)");
  });
});
