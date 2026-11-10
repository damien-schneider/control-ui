import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import postcss, { type Rule } from "postcss";

const root = postcss.parse(readFileSync(new URL("./recipes/kbd.css", import.meta.url), "utf8"));

const rules: Rule[] = [];
root.walkRules((rule) => {
  rules.push(rule);
});

function normalized(selector: string) {
  return selector.replace(/\s+/g, " ");
}

function declarations(rule: Rule): Record<string, string> {
  const values: Record<string, string> = {};
  rule.walkDecls((declaration) => {
    values[declaration.prop] = declaration.value;
  });
  return values;
}

const baseIndex = rules.findIndex((rule) => normalized(rule.selector) === ':where([data-control-family="kbd"][data-slot="root"])');
const nestedIndex = rules.findIndex((rule) =>
  /\[data-control-family="button"\]:is\(([^)]*)\) \[data-control-family="kbd"\]\[data-slot="root"\]/.test(normalized(rule.selector)),
);

describe("Kbd inside a filled Button", () => {
  test("covers the solid and scrim fills at zero specificity, after the family defaults", () => {
    expect(baseIndex).toBeGreaterThanOrEqual(0);
    expect(nestedIndex).toBeGreaterThan(baseIndex);

    const selector = normalized(rules[nestedIndex].selector);
    expect(selector.startsWith(":where(")).toBe(true);
    expect(selector.endsWith(")")).toBe(true);
    expect(selector).toContain('[data-variant="solid"]');
    expect(selector).toContain('[data-variant="scrim"]');
    expect(selector).not.toContain("data-tone");
  });

  test("derives every paint knob from the button ink instead of page tokens", () => {
    const values = declarations(rules[nestedIndex]);

    expect(values["--cui-kbd-foreground"]).toBe("currentColor");
    expect(values["--cui-kbd-background"]).toContain("from currentColor");
    expect(values["--cui-kbd-border-color"]).toContain("from currentColor");
    expect(Object.values(values).filter((value) => value.includes("var(--"))).toEqual([]);
  });

  test("drops the raised shadow with a value that stays valid inside the box-shadow list", () => {
    const values = declarations(rules[nestedIndex]);
    const base = declarations(rules[baseIndex]);

    expect(base["box-shadow"]).toContain("var(--cui-kbd-shadow)");
    expect(values["--cui-kbd-shadow"]).toBe("0 0 transparent");
  });
});
