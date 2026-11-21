import { expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import selectorParser from "postcss-selector-parser";
import { skinScopeAttribute } from "../../scripts/control-anatomy";
import { flattenCompound } from "../../scripts/selector-bucketing";

type Node = selectorParser.Node;

const DOCS_DIR = fileURLToPath(new URL("../../", import.meta.url));
const GENERATED_ROOT = path.join("components", "control-ui");
const DOCUMENT_SCOPE_ATTRIBUTES: Record<string, true> = {
  [skinScopeAttribute]: true,
  "data-motion": true,
  "data-docs-layout": true,
  class: true,
  dir: true,
  lang: true,
  style: true,
};

const sourcesWith = (fileName: RegExp) =>
  ["src/registry", "app", "components"].flatMap((root) =>
    readdirSync(path.join(DOCS_DIR, root), { encoding: "utf8", recursive: true })
      .map((file) => path.join(root, file))
      .filter((file) => fileName.test(file) && !file.startsWith(GENERATED_ROOT)),
  );

const stylesheets = sourcesWith(/\.css$/);
const classSources = sourcesWith(/(?<!\.test)\.tsx?$/);
const OUTSIDE_SUBJECT_HAS_VARIANT = /\b(?:group|peer)-has-|\[[^\s"'`\]]*:has\([^\s"'`]*_&/;

const isLogical = (node: Node): node is selectorParser.Pseudo =>
  node.type === "pseudo" && (node.value === ":is" || node.value === ":where" || node.value === ":not");

function anchorsOnPart(compound: Node[]): boolean {
  const pinsPart = compound.some(
    (node) => (node.type === "attribute" && !DOCUMENT_SCOPE_ATTRIBUTES[node.attribute]) || node.type === "class" || node.type === "id",
  );
  const reachesDocument = compound.some(
    (node) =>
      (node.type === "pseudo" && node.value === ":root") || (node.type === "tag" && ["html", "body"].includes(node.value.toLowerCase())),
  );
  return pinsPart && !reachesDocument;
}

function compoundsOf(selector: selectorParser.Selector): Node[][] {
  const compounds: Node[][] = [[]];
  for (const node of selector.nodes) {
    if (node.type === "combinator") compounds.push([]);
    else compounds.at(-1)?.push(node);
  }
  return compounds.filter((compound) => compound.length > 0);
}

function compoundOffends(compound: Node[], isSubject: boolean, anchoredFromOutside: boolean): boolean {
  return flattenCompound(compound).some((flat) => {
    const anchored = anchoredFromOutside || anchorsOnPart(flat);
    return flat.some((node) => {
      if (node.type !== "pseudo") return false;
      if (node.value === ":has") return !(isSubject && anchored);
      return node.value === ":not" && node.nodes.some((argument) => compoundsOffend(compoundsOf(argument), isSubject, anchored));
    });
  });
}

function nestedCompoundsOffend(compound: Node[]): boolean {
  return compound
    .filter(isLogical)
    .flatMap((logical) => logical.nodes)
    .some((argument) => {
      const compounds = compoundsOf(argument);
      return compoundsOffend(compounds.slice(0, -1), false) || nestedCompoundsOffend(compounds.at(-1) ?? []);
    });
}

function compoundsOffend(compounds: Node[][], subjectPosition = true, subjectAnchored = false): boolean {
  return compounds.some((compound, index) => {
    const isSubject = subjectPosition && index === compounds.length - 1;
    return compoundOffends(compound, isSubject, isSubject && subjectAnchored) || nestedCompoundsOffend(compound);
  });
}

function costlyHasSelectors(file: string): string[] {
  const offenders: string[] = [];
  postcss.parse(readFileSync(path.join(DOCS_DIR, file), "utf8")).walkRules((rule) => {
    if (rule.parent?.type === "atrule" && rule.parent.name.endsWith("keyframes")) return;
    selectorParser((selectors) => {
      selectors.each((selector) => {
        if (compoundsOffend(compoundsOf(selector)))
          offenders.push(`${file}:${rule.source?.start?.line ?? "?"} ${selector.toString().replace(/\s+/g, " ").trim()}`);
      });
    }).processSync(rule.selector);
  });
  return offenders;
}

test("a :has() only qualifies the component part it styles, so hover and focus restyle that part, not the document or a subtree", () => {
  expect(stylesheets.flatMap(costlyHasSelectors)).toEqual([]);
});

test("Tailwind classes keep :has() on the element they style: no group-has, peer-has, or [ancestor:has(...)_&] variants", () => {
  const offenders = classSources.flatMap((file) =>
    readFileSync(path.join(DOCS_DIR, file), "utf8")
      .split("\n")
      .flatMap((line, index) => (OUTSIDE_SUBJECT_HAS_VARIANT.test(line) ? [`${file}:${index + 1} ${line.trim()}`] : [])),
  );
  expect(offenders).toEqual([]);
});
