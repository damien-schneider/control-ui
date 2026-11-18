import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import postcss, { type Root } from "postcss";
import selectorParser from "postcss-selector-parser";
import { buttonVariants, controlTones } from "../sources/control-ui/control-variants";

const CORE_CSS_PATHS = ["../sources/control-ui/theme.css", "../sources/control-ui/recipes/button.css"].map((source) =>
  fileURLToPath(new URL(source, import.meta.url)),
);

// The base variant/tone IS the recipe root block — it needs no attribute selector of its own.
const BASE_VARIANT = "quiet";
const BASE_TONE = "neutral";

const core = postcss.parse(CORE_CSS_PATHS.map((filePath) => readFileSync(filePath, "utf8")).join("\n"));

function isButtonAnchor(node: selectorParser.Node): boolean {
  return (
    node.type === "attribute" &&
    ((node.attribute === "data-control-family" && node.value === "button") ||
      (node.attribute === "data-control-ui" && (node.value === "button" || node.value === "toggle")))
  );
}

function containsButtonAnchor(node: selectorParser.Node): boolean {
  if (isButtonAnchor(node)) return true;
  if (!("nodes" in node) || !Array.isArray(node.nodes)) return false;
  return node.nodes.some(containsButtonAnchor);
}

function isInheritancePseudo(node: selectorParser.Node["parent"]): node is selectorParser.Pseudo {
  return node?.type === "pseudo" && [":is", ":not", ":where"].includes(node.value);
}

function compoundHasButtonAnchor(node: selectorParser.Node): boolean {
  const selector = node.parent;
  if (selector?.type !== "selector") return false;
  const index = selector.nodes.indexOf(node);
  let start = index;
  let end = index + 1;
  while (start > 0 && selector.nodes[start - 1]?.type !== "combinator") start -= 1;
  while (end < selector.nodes.length && selector.nodes[end]?.type !== "combinator") end += 1;
  if (selector.nodes.slice(start, end).some(containsButtonAnchor)) return true;
  if (selector.nodes.some((candidate) => candidate.type === "combinator")) return false;
  const pseudo = selector.parent;
  if (!isInheritancePseudo(pseudo)) return false;
  return compoundHasButtonAnchor(pseudo);
}

function buttonAttributeValues(root: Root, attribute: string): Set<string> {
  const values = new Set<string>();
  root.walkRules((rule) => {
    selectorParser((selectors) => {
      selectors.walkAttributes((node) => {
        if (node.attribute === attribute && compoundHasButtonAnchor(node)) values.add(node.value ?? "");
      });
    }).processSync(rule.selector);
  });
  return values;
}

describe("button variant contract", () => {
  test("core paints every variant and tone beyond the base", () => {
    const paintedVariants = buttonAttributeValues(core, "data-variant");
    const paintedTones = buttonAttributeValues(core, "data-tone");
    const missing = [
      ...buttonVariants.filter((variant) => variant !== BASE_VARIANT && !paintedVariants.has(variant)).map((v) => `variant ${v}`),
      ...controlTones.filter((tone) => tone !== BASE_TONE && !paintedTones.has(tone)).map((t) => `tone ${t}`),
    ];
    expect(missing).toEqual([]);
  });
});
