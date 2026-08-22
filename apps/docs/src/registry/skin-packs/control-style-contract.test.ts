import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss, { type Root } from "postcss";
import selectorParser from "postcss-selector-parser";
import {
  controlAttribute,
  familyAttribute,
  identityAttribute,
  isFamilyKindAttribute,
  slotAttribute,
} from "../../../scripts/control-anatomy";
import { type Anatomy, createAnatomyResolver, createSubjectAnatomyResolver } from "../../../scripts/knob-ownership";
import { collectSkinContract } from "../../../scripts/skin-contract/collect";
import type { ContractState, SkinContract } from "../../../scripts/skin-contract/model";

const STYLING_ATTRIBUTES: Record<string, true> = {
  "data-padding": true,
  "data-shape": true,
  "data-size": true,
  "data-surface-variant": true,
  "data-tone": true,
  "data-variant": true,
};
const CSS_PAINTED_ATTRIBUTES: Record<string, true> = {
  "data-shape": true,
  "data-tone": true,
  "data-variant": true,
};
const SOURCE_RENDERED_STATES: Record<string, true> = {
  "audio-visualizer:data-variant": true,
  "chat-composer-attachment:data-variant": true,
  "code-block-editor:data-variant": true,
  "rich-tooltip:data-variant": true,
  "table-of-contents:data-variant": true,
};
const REGISTRY_DIR = fileURLToPath(new URL("../", import.meta.url));
const RECIPE_DIR = path.join(REGISTRY_DIR, "sources/control-ui/recipes");
const SKIN_PACKS_DIR = path.join(REGISTRY_DIR, "skin-packs");
const recipePaths = readdirSync(RECIPE_DIR)
  .filter((name) => name.endsWith(".css"))
  .map((name) => path.join(RECIPE_DIR, name))
  .sort();
const skinPaths = readdirSync(SKIN_PACKS_DIR)
  .filter((name) => statSync(path.join(SKIN_PACKS_DIR, name)).isDirectory())
  .map((name) => path.join(SKIN_PACKS_DIR, name, "skin.css"))
  .sort();
const recipeStyles = recipePaths.map((filePath) => postcss.parse(readFileSync(filePath, "utf8"), { from: filePath }));
const styles = [...recipeStyles, ...skinPaths.map((filePath) => postcss.parse(readFileSync(filePath, "utf8"), { from: filePath }))];
const contract = collectSkinContract();
const resolveAnatomy = createSubjectAnatomyResolver(contract);
const resolveSelectorAnatomy = createAnatomyResolver(contract);

type StylingSite = {
  family: string;
  part: string;
  scope: string;
  states: ContractState[];
};

function isInheritancePseudo(node: selectorParser.Node["parent"]): node is selectorParser.Pseudo {
  return node?.type === "pseudo" && [":is", ":not", ":where"].includes(node.value);
}

function compoundContext(node: selectorParser.Node): selectorParser.Node[] {
  const selector = node.parent;
  if (selector?.type !== "selector") return [node];
  const index = selector.nodes.indexOf(node);
  let start = index;
  let end = index + 1;
  while (start > 0 && selector.nodes[start - 1]?.type !== "combinator") start -= 1;
  while (end < selector.nodes.length && selector.nodes[end]?.type !== "combinator") end += 1;
  const compound = selector.nodes.slice(start, end);
  if (selector.nodes.some((candidate) => candidate.type === "combinator") || !isInheritancePseudo(selector.parent)) return compound;
  return [...compoundContext(selector.parent).filter((candidate) => candidate !== selector.parent), ...compound];
}

function contextAttributes(nodes: selectorParser.Node[]): Map<string, Set<string>> {
  const attributes = new Map<string, Set<string>>();
  const collect = (node: selectorParser.Node) => {
    if (node.type === "attribute" && node.value) {
      const values = attributes.get(node.attribute) ?? new Set<string>();
      values.add(node.value);
      attributes.set(node.attribute, values);
      return;
    }
    if (node.type === "pseudo" && !isInheritancePseudo(node)) return;
    if (!("nodes" in node) || !Array.isArray(node.nodes)) return;
    for (const child of node.nodes) collect(child);
  };
  for (const node of nodes) collect(node);
  return attributes;
}

function semanticPartsBySite(skinContract: SkinContract): Map<string, Set<string>> {
  const semanticParts = new Map<string, Set<string>>();
  for (const [semanticPart, references] of Object.entries(skinContract.semanticFamilies.popup)) {
    for (const reference of references) {
      const key = `${reference.scope}/${reference.part}`;
      const parts = semanticParts.get(key) ?? new Set<string>();
      parts.add(semanticPart);
      semanticParts.set(key, parts);
    }
  }
  return semanticParts;
}

function stylingSites(skinContract: SkinContract): StylingSite[] {
  return Object.entries(skinContract.scopes).flatMap(([scope, scopeContract]) =>
    Object.entries(scopeContract.parts).map(([part, partContract]) => ({
      scope,
      part,
      family: partContract.family ?? scope,
      states: partContract.states,
    })),
  );
}

const sites = stylingSites(contract);
const semanticParts = semanticPartsBySite(contract);
const controlSites = new Set(contract.semanticFamilies.controls.map(({ scope, part }) => `${scope}/${part}`));

function acceptsValue(state: ContractState, value: string): boolean {
  return state.valueKind === "open" || (state.valueKind === "enum" && state.values.includes(value));
}

function outerSelector(node: selectorParser.Node): selectorParser.Selector | undefined {
  let outer: selectorParser.Selector | undefined;
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (selectorParser.isSelector(parent)) outer = parent;
  }
  return outer;
}

function siteMatchesAnatomy(site: StylingSite, anatomy: Anatomy): boolean {
  if (anatomy.family === "*") return controlSites.has(`${site.scope}/${site.part}`);
  if (site.family !== anatomy.family || anatomy.part === undefined) return site.family === anatomy.family;
  return site.part === anatomy.part || semanticParts.get(`${site.scope}/${site.part}`)?.has(anatomy.part) === true;
}

function siteMatchesContext(site: StylingSite, attributes: ReadonlyMap<string, Set<string>>): boolean {
  const scopes = attributes.get(identityAttribute);
  if (scopes && !scopes.has(site.scope)) return false;
  const parts = attributes.get(slotAttribute);
  if (parts && !parts.has(site.part)) return false;
  for (const [attribute, values] of attributes) {
    if (!isFamilyKindAttribute(attribute)) continue;
    const state = site.states.find((candidate) => candidate.attribute === attribute);
    if (!state || ![...values].some((value) => acceptsValue(state, value))) return false;
  }
  return true;
}

function matchingSites(
  nodes: selectorParser.Node[],
  attributes: ReadonlyMap<string, Set<string>>,
  selectorContext: selectorParser.Selector | undefined,
): StylingSite[] {
  const selector = nodes
    .filter((node) => node.type !== "pseudo" || !/^(?:::|:(?:before|after|first-line|first-letter)$)/.test(node.value))
    .map((node) => node.toString().trim())
    .join("");
  let anatomies = resolveAnatomy(selector);
  if (anatomies.length === 0 && selectorContext) {
    const contextualAnatomies = resolveSelectorAnatomy(selectorContext.toString());
    const parts = attributes.get(slotAttribute);
    anatomies = parts ? contextualAnatomies.flatMap((anatomy) => [...parts].map((part) => ({ ...anatomy, part }))) : contextualAnatomies;
  }
  const matches = new Map<string, StylingSite>();
  for (const anatomy of anatomies) {
    for (const site of sites) {
      if (!siteMatchesAnatomy(site, anatomy) || !siteMatchesContext(site, attributes)) continue;
      matches.set(`${site.scope}/${site.part}`, site);
    }
  }
  return [...matches.values()];
}

type StylingTarget = {
  attribute: string;
  file: string;
  line: number | string;
  matchedSites: StylingSite[];
  value: string;
};

function stylingTargets(root: Root, attributes: Record<string, true>): StylingTarget[] {
  const targets: StylingTarget[] = [];
  root.walkRules((rule) => {
    selectorParser((selectors) => {
      selectors.walkAttributes((attribute) => {
        if (!attributes[attribute.attribute] || !attribute.value) return;
        const nodes = compoundContext(attribute);
        targets.push({
          attribute: attribute.attribute,
          value: attribute.value,
          file: rule.source?.input.file ? path.basename(rule.source.input.file) : "style.css",
          line: rule.source?.start?.line ?? "?",
          matchedSites: matchingSites(nodes, contextAttributes(nodes), outerSelector(attribute)),
        });
      });
    }).processSync(rule.selector);
  });
  return targets;
}

function closedStylingStateOffenders(root: Root): string[] {
  const offenders = new Set<string>();
  for (const target of stylingTargets(root, STYLING_ATTRIBUTES)) {
    const accepted = target.matchedSites.some((site) => {
      const state = site.states.find((candidate) => candidate.source === "control-ui" && candidate.attribute === target.attribute);
      return state ? acceptsValue(state, target.value) : false;
    });
    if (accepted) continue;
    const anatomy =
      target.matchedSites.length > 0
        ? target.matchedSites
            .map((site) => `${site.scope}/${site.part}`)
            .sort()
            .join("|")
        : `${familyAttribute}/${controlAttribute}`;
    offenders.add(`${target.file}:${target.line} ${anatomy} ${target.attribute}=${target.value}`);
  }
  return [...offenders];
}

function paintedStylingValues(roots: Root[]): Map<string, Set<string>> {
  const painted = new Map<string, Set<string>>();
  for (const root of roots) {
    for (const target of stylingTargets(root, CSS_PAINTED_ATTRIBUTES)) {
      for (const site of target.matchedSites) {
        const state = site.states.find((candidate) => candidate.source === "control-ui" && candidate.attribute === target.attribute);
        if (!state || !acceptsValue(state, target.value)) continue;
        const key = `${site.scope}:${target.attribute}`;
        const values = painted.get(key) ?? new Set<string>();
        values.add(target.value);
        painted.set(key, values);
      }
    }
  }
  return painted;
}

function unpaintedClosedStateOffenders(
  roots: Root[],
  contractSites: StylingSite[] = sites,
  sourceRenderedStates: Record<string, true> = SOURCE_RENDERED_STATES,
): string[] {
  const painted = paintedStylingValues(roots);
  const declared = new Map<string, Set<string>>();
  for (const site of contractSites) {
    for (const state of site.states) {
      if (
        state.source !== "control-ui" ||
        state.valueKind !== "enum" ||
        !CSS_PAINTED_ATTRIBUTES[state.attribute] ||
        state.values.length <= 1
      ) {
        continue;
      }
      const key = `${site.scope}:${state.attribute}`;
      const values = declared.get(key) ?? new Set<string>();
      for (const value of state.values) values.add(value);
      declared.set(key, values);
    }
  }
  return [...declared].flatMap(([key, values]) => {
    if (sourceRenderedStates[key]) return [];
    const missing = [...values].filter((value) => !painted.get(key)?.has(value));
    return missing.length > 1 ? [`${key} leaves ${missing.join(", ")} unpainted`] : [];
  });
}

describe("Control UI styling state contract", () => {
  test("recipes and skins target only styling values declared by their anatomy", () => {
    expect(styles.flatMap(closedStylingStateOffenders)).toEqual([]);
  });

  test("recipes paint every closed value beyond one derived base", () => {
    expect(unpaintedClosedStateOffenders(recipeStyles)).toEqual([]);
  });

  test("mobile Dockable drawer receives defaults and paint from one rule", () => {
    const dockableRecipe = recipeStyles[recipePaths.findIndex((filePath) => path.basename(filePath) === "dockable-panel.css")];
    const sharedRules: postcss.Rule[] = [];
    dockableRecipe?.walkRules((rule) => {
      if (
        rule.selector.includes('[data-control-family="dockable-panel"][data-slot="root"]') &&
        rule.selector.includes("[data-dockable-panel-root]")
      ) {
        sharedRules.push(rule);
      }
    });
    const sharedRule = sharedRules[0];
    if (!sharedRule) throw new Error("Dockable desktop/mobile rule missing");
    const properties = sharedRule.nodes.filter((node) => node.type === "decl").map((declaration) => declaration.prop);
    const required = [
      "--cui-dockable-panel-radius",
      "--cui-dockable-panel-background",
      "--cui-dockable-panel-foreground",
      "--cui-dockable-panel-border-color",
      "--cui-dockable-panel-shadow",
      "border",
      "border-radius",
      "background-color",
      "color",
      "box-shadow",
    ];
    expect(required.filter((property) => !properties.includes(property))).toEqual([]);
  });

  test("rejects a closed tone emitted without paint", () => {
    const deadTone: StylingSite = {
      scope: "chat-message",
      part: "root",
      family: "chat-message",
      states: [
        {
          attribute: "data-tone",
          source: "control-ui",
          valueKind: "enum",
          values: ["neutral", "warning"],
        },
      ],
    };
    expect(unpaintedClosedStateOffenders([], [deadTone], {})).toEqual(["chat-message:data-tone leaves neutral, warning unpainted"]);
  });

  test("does not borrow a state value from another part in the family", () => {
    const invalid = postcss.parse(':where([data-control-family="sidebar"][data-slot="root"][data-variant="outline"]) {}', {
      from: "invalid.css",
    });
    expect(closedStylingStateOffenders(invalid)).toEqual(["invalid.css:1 sidebar/root data-variant=outline"]);
  });

  test("resolves identity-only selectors", () => {
    const invalid = postcss.parse(':where([data-control-ui="audio-recorder"][data-slot="status"][data-tone="typo"]) {}', {
      from: "invalid.css",
    });
    expect(closedStylingStateOffenders(invalid)).toEqual(["invalid.css:1 audio-recorder/status data-tone=typo"]);
  });

  test("keeps popup kinds on their own variant contracts", () => {
    const invalid = postcss.parse(
      ':where([data-control-family="popup"][data-popup-kind="drawer"][data-slot="content"][data-variant="compact"]) {}',
      { from: "invalid.css" },
    );
    expect(closedStylingStateOffenders(invalid)).toEqual(["invalid.css:1 drawer/content data-variant=compact"]);
  });

  test("leaves explicitly open state values extensible", () => {
    const openState: ContractState = { attribute: "data-variant", source: "control-ui", valueKind: "open", values: [] };
    expect(acceptsValue(openState, "custom")).toBe(true);
  });

  test("declared styling values follow the public grammar", () => {
    const grammar = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    const offenders = sites.flatMap((site) =>
      site.states
        .filter((state) => state.source === "control-ui" && STYLING_ATTRIBUTES[state.attribute])
        .flatMap((state) =>
          state.values.filter((value) => !grammar.test(value)).map((value) => `${site.scope}/${site.part}:${state.attribute}=${value}`),
        ),
    );
    expect(offenders).toEqual([]);
  });
});
