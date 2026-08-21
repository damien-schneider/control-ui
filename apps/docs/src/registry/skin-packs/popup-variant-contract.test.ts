import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss, { type Root } from "postcss";
import { popupRecipeFiles } from "../../../app/(features)/catalog/primitives";
import { dropdownMenuTriggerVariants } from "../sources/control-ui/ui/dropdown-menu";
import { navigationMenuLinkVariants } from "../sources/control-ui/ui/navigation-menu";
import { popoverContentPaddings } from "../sources/control-ui/ui/popover";
import { selectTriggerVariants } from "../sources/control-ui/ui/select";

const SKIN_PACKS_DIR = fileURLToPath(new URL("./", import.meta.url));
const POPUP_RECIPE = postcss.root();
for (const recipeFile of popupRecipeFiles) {
  const filePath = path.join(process.cwd(), recipeFile.path);
  POPUP_RECIPE.append(postcss.parse(readFileSync(filePath, "utf8"), { from: filePath }).nodes);
}
const VARIANT_NAMES = new Set<string>([...selectTriggerVariants, ...dropdownMenuTriggerVariants, ...navigationMenuLinkVariants]);
const skins = readdirSync(SKIN_PACKS_DIR)
  .filter((entry) => statSync(path.join(SKIN_PACKS_DIR, entry)).isDirectory())
  .sort()
  .map((id) => postcss.parse(readFileSync(path.join(SKIN_PACKS_DIR, id, "skin.css"), "utf8")));

function popupAttributeValues(root: Root, attribute: string): Set<string> {
  const values = new Set<string>();
  const pattern = new RegExp(`\\[${attribute}="([^"]+)"\\]`, "g");
  root.walkRules((rule) => {
    if (!/\[data-popup-part=/.test(rule.selector)) return;
    for (const match of rule.selector.matchAll(pattern)) values.add(match[1] ?? "");
  });
  return values;
}

describe("popup variant contract", () => {
  test("recipe and skins target only declared variants", () => {
    const offenders = [POPUP_RECIPE, ...skins].flatMap((root) =>
      [...popupAttributeValues(root, "data-variant")].filter((value) => !VARIANT_NAMES.has(value)).map((value) => `variant ${value}`),
    );
    expect(offenders).toEqual([]);
  });

  test("vocabulary values follow the public grammar", () => {
    const grammar = /^[a-z]+(?:-[a-z]+)*$/;
    const vocabulary = [...selectTriggerVariants, ...dropdownMenuTriggerVariants, ...navigationMenuLinkVariants, ...popoverContentPaddings];
    expect(vocabulary.filter((value) => !grammar.test(value))).toEqual([]);
  });
});
