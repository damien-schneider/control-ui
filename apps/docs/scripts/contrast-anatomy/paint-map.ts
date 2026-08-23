import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import postcss from "postcss";

export const recipesDir = "src/registry/sources/control-ui/recipes";
const skinContractPath = "public/r/skin-contract.json";

export type PaintRole = "text" | "fill" | "boundary";

const PAINT_PROPERTIES: Record<string, PaintRole> = {
  color: "text",
  background: "fill",
  "background-color": "fill",
  "border-color": "boundary",
  "outline-color": "boundary",
};

/** One recipe rule that paints from a knob: the selector its part matches, and the knob each role reads. */
export type PaintRule = {
  recipe: string;
  selector: string;
  /** Pseudo-classes cannot be reproduced by a query, so the harvest matches on this form and forces the knob instead. */
  queryable: string;
  knobs: Partial<Record<PaintRole, string>>;
};

const knobReference = (value: string) => value.match(/^var\((--cui-[a-z0-9-]+)\)$/)?.[1];

const recipeFiles = (cwd: string) =>
  readdirSync(path.join(cwd, recipesDir))
    .filter((name) => name.endsWith(".css"))
    .sort();

const parseRecipe = (cwd: string, file: string) => postcss.parse(readFileSync(path.join(cwd, recipesDir, file), "utf8"), { from: file });

const PSEUDO_CLASSES = /:(hover|focus|focus-visible|focus-within|active|first-child|last-child|disabled)\b/g;

function queryableForm(selector: string): string {
  return selector.replace(PSEUDO_CLASSES, "").replace(/\s+/g, " ").trim();
}

function paintedKnobs(rule: postcss.Rule): PaintRule["knobs"] {
  const knobs: PaintRule["knobs"] = {};
  for (const node of rule.nodes ?? []) {
    if (node.type !== "decl") continue;
    const role = PAINT_PROPERTIES[node.prop];
    const knob = role ? knobReference(node.value) : undefined;
    if (role && knob) knobs[role] = knob;
  }
  return knobs;
}

export function collectPaintRules(cwd = process.cwd()): PaintRule[] {
  const rules: PaintRule[] = [];
  for (const file of recipeFiles(cwd)) {
    parseRecipe(cwd, file).walkRules((rule) => {
      const knobs = paintedKnobs(rule);
      if (Object.keys(knobs).length === 0) return;
      const selector = rule.selector.replace(/\s+/g, " ").trim();
      rules.push({ recipe: path.basename(file, ".css"), selector, queryable: queryableForm(selector), knobs });
    });
  }
  return rules;
}

/** Where each knob is set, and which knobs that value reads: an ancestor belongs in an anatomy when the leaf reads what it declares. */
export type KnobSources = {
  declaredBy: Record<string, string[]>;
  readsKnobs: Record<string, string[]>;
};

export function collectKnobSources(cwd = process.cwd()): KnobSources {
  const sources: KnobSources = { declaredBy: {}, readsKnobs: {} };
  const append = (index: Record<string, string[]>, knob: string, value: string) => {
    const known = index[knob] ?? [];
    known.push(value);
    index[knob] = known;
  };
  for (const file of recipeFiles(cwd)) {
    parseRecipe(cwd, file).walkRules((rule) => {
      const selector = queryableForm(rule.selector);
      for (const node of rule.nodes ?? []) {
        if (node.type !== "decl" || !node.prop.startsWith("--cui-")) continue;
        append(sources.declaredBy, node.prop, selector);
        for (const match of node.value.matchAll(/var\((--cui-[a-z0-9-]+)/g)) append(sources.readsKnobs, node.prop, match[1]);
      }
    });
  }
  return sources;
}

/** A skin can only repaint what a recipe already paints, so these selectors mark every ancestor that may fill. */
export function collectFillSelectors(cwd = process.cwd()): string[] {
  return [...new Set(collectPaintRules(cwd).flatMap((rule) => (rule.knobs.fill ? [rule.queryable] : [])))].sort();
}

/** Every ancestor whose declarations the leaf's knobs depend on, followed through knob-to-knob references. */
export function knobHostSelectors(knobs: readonly string[], sources: KnobSources): string[] {
  const pending = [...knobs];
  const seen = new Set<string>();
  const selectors = new Set<string>();
  while (pending.length > 0) {
    const knob = pending.pop();
    if (!knob || seen.has(knob)) continue;
    seen.add(knob);
    for (const selector of sources.declaredBy[knob] ?? []) selectors.add(selector);
    pending.push(...(sources.readsKnobs[knob] ?? []));
  }
  return [...selectors].sort();
}

type ContractPart = { states?: { attribute: string }[] };
type SkinContract = { scopes: Record<string, { parts: Record<string, ContractPart> }> };

/** Stamped only while a transition runs, so they describe a frame rather than a paint the eye can read. */
const TRANSIENT_ATTRIBUTES = ["data-starting-style", "data-ending-style"];

/**
 * The attributes an anatomy node carries: the markers and states a skin is allowed to select on, plus
 * whatever core recipes select on. Anything outside that vocabulary cannot change a paint, so it is noise.
 */
export function collectAnatomyAttributes(cwd = process.cwd()): string[] {
  const attributes = new Set(["data-slot", "data-control-family"]);
  for (const selector of [
    ...collectPaintRules(cwd).map((rule) => rule.selector),
    ...Object.values(collectKnobSources(cwd).declaredBy).flat(),
  ]) {
    for (const match of selector.matchAll(/\[([a-z-]+)[=\]]/g)) attributes.add(match[1]);
  }
  const contract: SkinContract = JSON.parse(readFileSync(path.join(cwd, skinContractPath), "utf8"));
  for (const scope of Object.values(contract.scopes)) {
    for (const part of Object.values(scope.parts)) for (const state of part.states ?? []) attributes.add(state.attribute);
  }
  for (const transient of TRANSIENT_ATTRIBUTES) attributes.delete(transient);
  return [...attributes].sort();
}
