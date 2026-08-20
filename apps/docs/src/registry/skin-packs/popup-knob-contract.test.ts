import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss, { type Root } from "postcss";
import { popupRecipeFiles } from "../../../app/(features)/catalog/primitives";
import { dropdownMenuTriggerVariants, navigationMenuLinkVariants, popoverContentPaddings, selectTriggerVariants } from "../contracts";
import { popupKnobs } from "../knob-contracts";

const SKIN_PACKS_DIR = fileURLToPath(new URL("./", import.meta.url));
const POPUP_RECIPE = postcss.root();
for (const recipeFile of popupRecipeFiles) {
  const filePath = path.join(process.cwd(), recipeFile.path);
  POPUP_RECIPE.append(postcss.parse(readFileSync(filePath, "utf8"), { from: filePath }).nodes);
}
const KNOB_NAMES = new Set<string>(popupKnobs);
const VARIANT_NAMES = new Set<string>([...selectTriggerVariants, ...dropdownMenuTriggerVariants, ...navigationMenuLinkVariants]);
const skins = readdirSync(SKIN_PACKS_DIR)
  .filter((entry) => statSync(path.join(SKIN_PACKS_DIR, entry)).isDirectory())
  .sort()
  .map((id) => ({ id, root: postcss.parse(readFileSync(path.join(SKIN_PACKS_DIR, id, "skin.css"), "utf8")) }));

function popupAttributeValues(root: Root, attribute: string): Set<string> {
  const values = new Set<string>();
  const pattern = new RegExp(`\\[${attribute}="([^"]+)"\\]`, "g");
  root.walkRules((rule) => {
    if (!/\[data-popup-part=/.test(rule.selector)) return;
    for (const match of rule.selector.matchAll(pattern)) values.add(match[1] ?? "");
  });
  return values;
}

function unknownKnobOffenders(root: Root, label: string): string[] {
  const offenders: string[] = [];
  const check = (name: string, line: number | undefined) => {
    if (!KNOB_NAMES.has(name)) offenders.push(`${label}:${line ?? "?"} ${name}`);
  };
  root.walkDecls((declaration) => {
    const line = declaration.source?.start?.line;
    if (declaration.prop.startsWith("--popup-")) check(declaration.prop, line);
    for (const match of declaration.value.matchAll(/var\(\s*(--popup-[\w-]+)/g)) check(match[1] ?? "", line);
  });
  root.walkAtRules("property", (atRule) => {
    const name = atRule.params.trim();
    if (name.startsWith("--popup-")) check(name, atRule.source?.start?.line);
  });
  return offenders;
}

describe("popup paint contract", () => {
  test("every knob ships a default in the popup recipe", () => {
    const declared = new Set<string>();
    POPUP_RECIPE.walkDecls((declaration) => {
      if (declaration.prop.startsWith("--popup-")) declared.add(declaration.prop);
    });
    expect(popupKnobs.filter((knob) => !declared.has(knob))).toEqual([]);
  });

  test("every knob is registered via @property", () => {
    const registered = new Set<string>();
    POPUP_RECIPE.walkAtRules("property", (atRule) => {
      registered.add(atRule.params.trim());
    });
    expect(popupKnobs.filter((knob) => !registered.has(knob))).toEqual([]);
  });

  test("recipe and skins reference only contract knobs", () => {
    const offenders = [
      ...unknownKnobOffenders(POPUP_RECIPE, "popup.css"),
      ...skins.flatMap(({ id, root }) => unknownKnobOffenders(root, id)),
    ];
    expect(offenders).toEqual([]);
  });

  test("popup selectors target only declared variants", () => {
    const offenders = [POPUP_RECIPE, ...skins.map(({ root }) => root)].flatMap((root) =>
      [...popupAttributeValues(root, "data-variant")].filter((value) => !VARIANT_NAMES.has(value)).map((value) => `variant ${value}`),
    );
    expect(offenders).toEqual([]);
  });

  test("contract names follow the semver grammar", () => {
    const knobGrammar = /^--popup-[a-z]+(?:-[a-z]+)*$/;
    const valueGrammar = /^[a-z]+(?:-[a-z]+)*$/;
    const privateGrammar = /^--_[a-z]+(?:-[a-z]+)*$/;
    const offenders = [
      ...popupKnobs.filter((knob) => !knobGrammar.test(knob)).map((knob) => `knob ${knob}`),
      ...[...selectTriggerVariants, ...dropdownMenuTriggerVariants, ...navigationMenuLinkVariants, ...popoverContentPaddings]
        .filter((value) => !valueGrammar.test(value))
        .map((value) => `value ${value}`),
    ];
    POPUP_RECIPE.walkDecls((declaration) => {
      if (declaration.prop.startsWith("--_") && !privateGrammar.test(declaration.prop)) {
        offenders.push(`private ${declaration.prop}`);
      }
    });
    expect(offenders).toEqual([]);
  });
});
