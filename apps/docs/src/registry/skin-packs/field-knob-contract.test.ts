import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss, { type Root } from "postcss";
import { fieldKnobs } from "../knob-contracts";

const SKIN_PACKS_DIR = fileURLToPath(new URL("./", import.meta.url));
const RECIPE_PATHS = ["../sources/control-ui/recipes/field.css", "../sources/control-ui/recipes/field-parts.css"].map((source) =>
  fileURLToPath(new URL(source, import.meta.url)),
);
const FIELD_SOURCES = [
  "input.tsx",
  "input-group.tsx",
  "native-select.tsx",
  "textarea.tsx",
  "input-otp.tsx",
  "combobox.tsx",
  "autocomplete.tsx",
  "number-field.tsx",
].map((name) => fileURLToPath(new URL(`../sources/control-ui/ui/${name}`, import.meta.url)));

function parseCss(filePath: string): Root {
  return postcss.parse(readFileSync(filePath, "utf8"), { from: filePath });
}

const recipe = postcss.root();
for (const recipePath of RECIPE_PATHS) {
  recipe.append(parseCss(recipePath).nodes);
}
const skins = readdirSync(SKIN_PACKS_DIR)
  .filter((entry) => statSync(path.join(SKIN_PACKS_DIR, entry)).isDirectory())
  .sort()
  .map((id) => ({ id, root: parseCss(path.join(SKIN_PACKS_DIR, id, "skin.css")) }));
const knobNames = new Set<string>(fieldKnobs);

function unknownKnobOffenders(root: Root, label: string): string[] {
  const offenders: string[] = [];
  const check = (name: string, line: number | undefined) => {
    if (!knobNames.has(name)) offenders.push(`${label}:${line ?? "?"} ${name}`);
  };
  root.walkDecls((declaration) => {
    const line = declaration.source?.start?.line;
    if (declaration.prop.startsWith("--field-")) check(declaration.prop, line);
    for (const match of declaration.value.matchAll(/var\(\s*(--field-[\w-]+)/g)) check(match[1] ?? "", line);
  });
  root.walkAtRules("property", (atRule) => {
    const name = atRule.params.trim();
    if (name.startsWith("--field-")) check(name, atRule.source?.start?.line);
  });
  return offenders;
}

describe("field paint contract", () => {
  test("every field surface stamps the shared family", () => {
    const missing = FIELD_SOURCES.filter((filePath) => {
      const source = readFileSync(filePath, "utf8");
      return !source.includes('data-control-family="field"') && !source.includes('"data-control-family": "field"');
    }).map((filePath) => path.basename(filePath));
    expect(missing).toEqual([]);
  });

  test("every knob ships a default and @property registration", () => {
    const declared = new Set<string>();
    const registered = new Set<string>();
    recipe.walkDecls((declaration) => {
      if (declaration.prop.startsWith("--field-")) declared.add(declaration.prop);
    });
    recipe.walkAtRules("property", (atRule) => {
      registered.add(atRule.params.trim());
    });
    expect(fieldKnobs.filter((knob) => !declared.has(knob))).toEqual([]);
    expect(fieldKnobs.filter((knob) => !registered.has(knob))).toEqual([]);
  });

  test("core and skins reference only contract knobs", () => {
    const offenders = [...unknownKnobOffenders(recipe, "core"), ...skins.flatMap(({ id, root }) => unknownKnobOffenders(root, id))];
    expect(offenders).toEqual([]);
  });

  test("contract names follow the public knob grammar", () => {
    expect(fieldKnobs.filter((knob) => !/^--field-[a-z]+(?:-[a-z]+)*$/.test(knob))).toEqual([]);
  });

  test("motion rides the shared duration and easing tokens", () => {
    const offenders: string[] = [];
    recipe.walkDecls(/^(transition|animation)/, (declaration) => {
      if (/(^|[\s,(])\d+(\.\d+)?m?s\b|cubic-bezier\(|steps\(|linear\(/.test(declaration.value)) {
        offenders.push(`${declaration.source?.start?.line ?? "?"} ${declaration.prop}: ${declaration.value}`);
      }
    });
    expect(offenders).toEqual([]);
  });

  test("advanced skins re-value field knobs in CSS", () => {
    for (const id of ["cuicui", "linear", "modern-apple", "xp"]) {
      const root = skins.find((skin) => skin.id === id)?.root;
      const declarations = new Set<string>();
      root?.walkDecls((declaration) => {
        if (declaration.prop.startsWith("--field-")) declarations.add(declaration.prop);
      });
      expect(declarations.size).toBeGreaterThan(0);
    }
  });
});
