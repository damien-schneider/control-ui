import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss, { AtRule, type Container, type Document, type Root, type Rule } from "postcss";
import selectorParser from "postcss-selector-parser";
import { knobsByFamily } from "../../../scripts/knob-contracts/collect";
import { type PaintedState, paintedStates } from "../../../scripts/painted-states";
import { readCssRulesWithImports } from "../../../scripts/read-css";

const RECIPES_DIR = fileURLToPath(new URL("../sources/control-ui/recipes/", import.meta.url));
const SKIN_PACKS_DIR = fileURLToPath(new URL("./", import.meta.url));

const recipes = readdirSync(RECIPES_DIR)
  .filter((file) => file.endsWith(".css"))
  .sort()
  .map((file) => ({ file, root: postcss.parse(readFileSync(path.join(RECIPES_DIR, file), "utf8"), { from: file }) }));

const skins = readdirSync(SKIN_PACKS_DIR)
  .filter((entry) => statSync(path.join(SKIN_PACKS_DIR, entry)).isDirectory())
  .sort()
  .map((id) => ({ id, root: postcss.parse(readCssRulesWithImports(path.join(SKIN_PACKS_DIR, id, "skin.css"))) }));

const familyKnobs = knobsByFamily();
const allKnobs = Object.values(familyKnobs).flat();

type Registration = { syntaxes: readonly string[]; initial: string | null };

const COLOR: Registration = { syntaxes: ["<color>"], initial: "transparent" };
const FREE_FORM: Registration = { syntaxes: ["*"], initial: null };
const BOX_LENGTH: Registration = { syntaxes: ["<length-percentage>", "<length-percentage>+"], initial: "0px" };
const LENGTH: Registration = { syntaxes: ["<length>"], initial: "0px" };

const REGISTRATION_BY_SUFFIX: readonly [RegExp, Registration][] = [
  [/-(?:background-image|shadow|backdrop-filter|easing|border-style|font-family)$/, FREE_FORM],
  [
    /-(?:background|foreground|border-color|(?:ring|line|dot|marker|separator|handle|outline)-color|fill|stroke|indicator-(?:start|middle|end))$/,
    COLOR,
  ],
  [/-font-weight$/, { syntaxes: ["<number>"], initial: "400" }],
  [/-line-height$/, { syntaxes: ["<number>"], initial: "1.5" }],
  [/-opacity$/, { syntaxes: ["<number>"], initial: "1" }],
  [/-scale$/, { syntaxes: ["<number>", "<number>+"], initial: "1" }],
  [/-(?:animation-duration|transition-duration|transition-delay)$/, { syntaxes: ["<time>"], initial: "0s" }],
  [/-text-transform$/, { syntaxes: ["none | uppercase | lowercase | capitalize"], initial: "none" }],
  [
    /-(?:radius|padding(?:-(?:inline|block)(?:-start|-end)?)?|inset|height|min-height|max-height|size|inline-size|font-size|gap)$/,
    BOX_LENGTH,
  ],
  [/-(?:border-width|backdrop-blur|letter-spacing|icon)$/, LENGTH],
];

const REGISTRATION_BY_KNOB: Record<string, Registration> = {
  "--cui-page-layout-size": { syntaxes: ["<length-percentage> | none"], initial: "none" },
};

function canonicalRegistration(knob: string): Registration | undefined {
  return REGISTRATION_BY_KNOB[knob] ?? REGISTRATION_BY_SUFFIX.find(([suffix]) => suffix.test(knob))?.[1];
}

function registrationOffenders(root: Root): string[] {
  const offenders: string[] = [];
  root.walkAtRules("property", (atRule: AtRule) => {
    const knob = atRule.params.trim();
    if (!knob.startsWith("--cui-")) return;
    const line = atRule.source?.start?.line ?? "?";
    const canonical = canonicalRegistration(knob);
    if (!canonical) {
      offenders.push(`${line} ${knob} has no canonical registration for its suffix`);
      return;
    }
    let syntax = "";
    let initial: string | null = null;
    atRule.walkDecls((declaration) => {
      if (declaration.prop === "syntax") syntax = declaration.value.replace(/^"|"$/g, "");
      if (declaration.prop === "initial-value") initial = declaration.value.replace(/\s+/g, " ").trim();
    });
    if (!canonical.syntaxes.includes(syntax))
      offenders.push(`${line} ${knob} syntax ${syntax} (expected ${canonical.syntaxes.join(" or ")})`);
    if (initial !== canonical.initial)
      offenders.push(`${line} ${knob} initial-value ${initial ?? "(none)"} (expected ${canonical.initial ?? "(none)"})`);
  });
  return offenders;
}

const STATES = [
  "hover",
  "active",
  "press",
  "pressed",
  "selected",
  "checked",
  "open",
  "focus",
  "disabled",
  "highlighted",
  "dragging",
  "current",
  "visited",
  "invalid",
];
const STATE_STAMP_ALIASES: Record<string, RegExp> = {
  press: /:active|data-pressed|aria-pressed/,
  focus: /:focus|data-focus|--focus-ring/,
  open: /:open|data-(?:popup-)?open|="open"/,
};

function stateStamp(state: string): RegExp {
  return STATE_STAMP_ALIASES[state] ?? new RegExp(`(?::|data-|aria-|=")${state}`);
}

function stateMirrorOffenders(family: string, knobs: readonly string[], recipeCss: string): string[] {
  const prefix = `--cui-${family}-`;
  return knobs.flatMap((knob) =>
    knob
      .slice(prefix.length)
      .split("-")
      .filter((segment) => STATES.includes(segment) && !stateStamp(segment).test(recipeCss))
      .map((segment) => `${knob} names state "${segment}" that no ${family} selector stamps`),
  );
}

function familyCss(family: string): string {
  return recipes
    .map(({ root }) => root.toString())
    .filter((css) => css.includes(`--cui-${family}-`))
    .join("\n");
}

const PAINT_SUFFIX: Record<string, string> = {
  background: "background",
  "background-color": "background",
  color: "foreground",
  "border-color": "border-color",
  "box-shadow": "shadow",
  "border-radius": "radius",
};
const STATE_SEGMENT = `(?:${STATES.join("|")})`;
const RESET_VALUE =
  /^(?:0|0px|none|transparent|inherit|initial|unset|revert|revert-layer|currentcolor|Highlight|HighlightText|Canvas|CanvasText|ButtonFace|ButtonText)$/i;
const ROOT_PARTS = new Set(["root", "wrapper", "surface"]);

type Compound = { nodes: selectorParser.Node[]; preceding: selectorParser.Node[]; pseudoElement: boolean };
type Subject = { family: string; part: string };

function innerSelectors(node: selectorParser.Node): selectorParser.Selector[] {
  return node.type === "pseudo" ? (node.nodes ?? []) : [];
}

function unwrapCompound(nodes: selectorParser.Node[], preceding: selectorParser.Node[], pseudoElement: boolean): Compound[] {
  let start = nodes.length;
  for (let index = nodes.length - 1; index >= 0; index -= 1) {
    if (nodes[index]?.type === "combinator") break;
    start = index;
  }
  const compound = nodes.slice(start);
  const before = [...preceding, ...nodes.slice(0, start)];
  const hasPseudoElement = pseudoElement || compound.some((node) => node.type === "pseudo" && node.value.startsWith("::"));
  const wrapper = compound[0];
  const wrapsSelectorList = wrapper?.type === "pseudo" && /^:(?:where|is)$/.test(wrapper.value) && innerSelectors(wrapper).length > 0;
  if (wrapper && wrapsSelectorList && compound.slice(1).every((node) => node.type === "pseudo")) {
    return innerSelectors(wrapper).flatMap((inner) => unwrapCompound(inner.nodes, before, hasPseudoElement));
  }
  return [{ nodes: compound, preceding: before, pseudoElement: hasPseudoElement }];
}

function compoundsOf(selector: string): Compound[] {
  const compounds: Compound[] = [];
  selectorParser((selectors) => {
    selectors.each((candidate) => {
      compounds.push(...unwrapCompound(candidate.nodes, [], false));
    });
  }).processSync(selector);
  return compounds;
}

function attributeValue(nodes: selectorParser.Node[], name: string, deep: boolean): string | undefined {
  let value: string | undefined;
  for (const node of nodes) {
    if (node.type === "attribute" && node.attribute === name && node.value) value = node.value;
    if (deep) for (const inner of innerSelectors(node)) value = attributeValue(inner.nodes, name, true) ?? value;
  }
  return value;
}

function partsInsideSelectorLists(nodes: selectorParser.Node[]): string[] {
  return nodes
    .filter((node) => node.type === "pseudo" && /^:(?:is|where)$/.test(node.value))
    .flatMap((node) => innerSelectors(node))
    .flatMap((inner) => {
      const part = attributeValue(inner.nodes, "data-slot", false) ?? attributeValue(inner.nodes, "data-popup-part", false);
      return part ? [part] : [];
    });
}

function subjectsOf(compound: Compound): Subject[] {
  if (compound.pseudoElement || compound.nodes.some((node) => node.type === "tag" || node.type === "class")) return [];
  const ownFamily = attributeValue(compound.nodes, "data-control-family", false);
  const directPart = attributeValue(compound.nodes, "data-slot", false) ?? attributeValue(compound.nodes, "data-popup-part", false);
  const parts = directPart ? [directPart] : partsInsideSelectorLists(compound.nodes);
  const family = ownFamily ?? (parts.length > 0 ? attributeValue(compound.preceding, "data-control-family", true) : undefined);
  if (!family) return [];
  return (parts.length > 0 ? parts : ["root"]).map((part) => ({ family, part }));
}

function knobsForPaint(subject: Subject, suffix: string, knobs: readonly string[]): string[] {
  const base = ROOT_PARTS.has(subject.part) ? `--cui-${subject.family}` : `--cui-${subject.family}-${subject.part}`;
  const pattern = new RegExp(`^${base}-(?:${STATE_SEGMENT}-)?${suffix}$`);
  return knobs.filter((knob) => pattern.test(knob));
}

function insideKeyframesOrForcedColors(rule: Rule): boolean {
  let ancestor: Container | Document | undefined = rule.parent;
  while (ancestor) {
    if (ancestor instanceof AtRule && /keyframes|forced-colors/.test(`${ancestor.name} ${ancestor.params}`)) return true;
    ancestor = ancestor.parent;
  }
  return false;
}

function paintBypassOffenders(root: Root, knobs: readonly string[]): string[] {
  const offenders: string[] = [];
  root.walkDecls((declaration) => {
    const suffix = PAINT_SUFFIX[declaration.prop];
    const value = declaration.value.trim();
    if (!suffix || value.includes("var(--cui-") || value.includes("var(--_") || RESET_VALUE.test(value)) return;
    const rule = declaration.parent;
    if (rule?.type !== "rule" || insideKeyframesOrForcedColors(rule)) return;
    const bypassed = compoundsOf(rule.selector)
      .flatMap(subjectsOf)
      .flatMap((subject) => knobsForPaint(subject, suffix, knobs));
    if (bypassed.length > 0) offenders.push(`${declaration.source?.start?.line ?? "?"} ${declaration.prop} bypasses ${bypassed[0]}`);
  });
  return offenders;
}

type StateRoutes = Map<string, PaintedState[]>;

type RecipePaint = { states: PaintedState[]; keys: string[]; value: string };

/** A bare attribute paints for every value of it. */
function sameState(left: PaintedState, right: PaintedState): boolean {
  return left.name === right.name && (left.value === undefined || right.value === undefined || left.value === right.value);
}

function recipePaints(roots: readonly Root[]): RecipePaint[] {
  const paints: RecipePaint[] = [];
  for (const root of roots) {
    root.walkDecls((declaration) => {
      const rule = declaration.parent;
      if (declaration.prop.startsWith("--cui-") || rule?.type !== "rule" || insideKeyframesOrForcedColors(rule)) return;
      const keys = compoundsOf(rule.selector)
        .flatMap(subjectsOf)
        .map(({ family, part }) => `${family} ${part} ${declaration.prop}`);
      paints.push({ states: paintedStates(rule.selector), keys, value: declaration.value });
    });
  }
  return paints;
}

function knobsReadByBaseRules(paints: readonly RecipePaint[]): Map<string, Set<string>> {
  const knobsRead = new Map<string, Set<string>>();
  for (const { keys, value } of paints.filter(({ states }) => states.length === 0)) {
    for (const key of keys) {
      for (const [, knob] of value.matchAll(/var\(\s*(--cui-[\w-]+)/g)) knobsRead.set(key, (knobsRead.get(key) ?? new Set()).add(knob));
    }
  }
  return knobsRead;
}

/**
 * A base rule paints a property from a knob; a state rule on the same part replaces that property without reading the
 * knob. In that state the knob no longer feeds the paint, so a skin that writes it there changes nothing. A state where
 * another rule on the part still reads the knob is not routed away.
 */
function stateRoutes(roots: readonly Root[]): StateRoutes {
  const paints = recipePaints(roots);
  const knobsRead = knobsReadByBaseRules(paints);
  const replacedIn: StateRoutes = new Map();
  const stillReadIn: StateRoutes = new Map();
  for (const { states, keys, value } of paints.filter((paint) => paint.states.length > 0)) {
    for (const key of keys) {
      for (const knob of knobsRead.get(key) ?? []) {
        const target = new RegExp(`${knob}(?![\\w-])`).test(value) ? stillReadIn : replacedIn;
        target.set(knob, [...(target.get(knob) ?? []), ...states]);
      }
    }
  }
  const routes: StateRoutes = new Map();
  for (const [knob, states] of replacedIn) {
    const stillRead = stillReadIn.get(knob) ?? [];
    routes.set(
      knob,
      states.filter((state) => !stillRead.some((read) => sameState(read, state))),
    );
  }
  return routes;
}

function maskedStateWriteOffenders(skin: Root, routes: StateRoutes): string[] {
  const offenders = new Set<string>();
  skin.walkDecls(/^--cui-/, (declaration) => {
    const rule = declaration.parent;
    const routed = routes.get(declaration.prop);
    if (!routed || rule?.type !== "rule" || insideKeyframesOrForcedColors(rule)) return;
    for (const compound of compoundsOf(rule.selector)) {
      if (!subjectsOf(compound).some(({ family }) => declaration.prop.startsWith(`--cui-${family}-`))) continue;
      const masked = paintedStates(compound.nodes.map(String).join("")).find((painted) =>
        routed.some((route) => sameState(route, painted)),
      );
      if (!masked) continue;
      const state = masked.value === undefined ? masked.name : `${masked.name}="${masked.value}"`;
      offenders.add(
        `${declaration.source?.start?.line ?? "?"} ${declaration.prop} is not read in ${state}; set the knob the recipe reads there`,
      );
    }
  });
  return [...offenders];
}

describe("knob registration", () => {
  for (const { file, root } of recipes) {
    test(`${file} registers each knob with the canonical syntax and initial value for its suffix`, () => {
      expect(registrationOffenders(root)).toEqual([]);
    });
  }

  test("rejects a registration that drifts from its suffix", () => {
    const drifting = postcss.parse('@property --cui-example-radius { syntax: "<length>"; inherits: true; initial-value: 4px; }');
    expect(registrationOffenders(drifting)).toEqual([
      "1 --cui-example-radius syntax <length> (expected <length-percentage> or <length-percentage>+)",
      "1 --cui-example-radius initial-value 4px (expected 0px)",
    ]);
    const canonical = postcss.parse('@property --cui-example-shadow { syntax: "*"; inherits: true; }');
    expect(registrationOffenders(canonical)).toEqual([]);
  });
});

describe("knob state vocabulary", () => {
  for (const [family, knobs] of Object.entries(familyKnobs)) {
    test(`${family} state knobs mirror a stamped state`, () => {
      expect(stateMirrorOffenders(family, knobs, familyCss(family))).toEqual([]);
    });
  }

  test("rejects a state name the recipe never stamps", () => {
    const knobs = ["--cui-example-selected-background"];
    expect(stateMirrorOffenders("example", knobs, "a { color: red; }")).toEqual([
      '--cui-example-selected-background names state "selected" that no example selector stamps',
    ]);
    expect(stateMirrorOffenders("example", knobs, ":where([data-selected]) { color: red; }")).toEqual([]);
  });
});

describe("paint goes through knobs", () => {
  for (const { file, root } of recipes) {
    test(`${file} paints knob-covered properties through the knob`, () => {
      expect(paintBypassOffenders(root, allKnobs)).toEqual([]);
    });
  }

  for (const { id, root } of skins) {
    test(`${id} re-values knobs instead of painting over them`, () => {
      expect(paintBypassOffenders(root, allKnobs)).toEqual([]);
    });
  }

  test("rejects a direct paint on a part that owns a knob for it", () => {
    const knobs = ["--cui-example-background", "--cui-example-row-hover-background"];
    const direct = postcss.parse(
      ':where([data-control-family="example"][data-slot="root"][data-variant="solid"]) { background: var(--card); }',
    );
    expect(paintBypassOffenders(direct, knobs)).toEqual(["1 background bypasses --cui-example-background"]);
    const skinned = postcss.parse(
      '[data-skin="x"] :where([data-control-family="example"][data-slot="row"]):hover { background-color: red; }',
    );
    expect(paintBypassOffenders(skinned, knobs)).toEqual(["1 background-color bypasses --cui-example-row-hover-background"]);
    const throughKnob = postcss.parse(
      ':where([data-control-family="example"][data-slot="root"][data-variant="solid"]) { --cui-example-background: var(--card); }',
    );
    expect(paintBypassOffenders(throughKnob, knobs)).toEqual([]);
    const reset = postcss.parse(
      ':where([data-control-family="example"][data-slot="root"][data-chrome="embedded"]) { background: transparent; }',
    );
    expect(paintBypassOffenders(reset, knobs)).toEqual([]);
    const pseudoElement = postcss.parse(':where([data-control-family="example"][data-slot="root"])::before { background: red; }');
    expect(paintBypassOffenders(pseudoElement, knobs)).toEqual([]);
  });
});

describe("state routing", () => {
  const routes = stateRoutes(recipes.map(({ root }) => root));

  for (const { id, root } of skins) {
    test(`${id} writes the knob the recipe reads in each state`, () => {
      expect(maskedStateWriteOffenders(root, routes)).toEqual([]);
    });
  }

  test("rejects a base knob written in a state the recipe routes to another knob", () => {
    const recipe = postcss.parse(
      ':where([data-control-family="example"][data-slot="root"]) { --_example-background: var(--cui-example-background); background: var(--_example-background); }\n:where([data-control-family="example"][data-slot="root"][data-checked]) { --_example-background: var(--cui-example-checked-background); }',
    );
    const skin = postcss.parse(
      '[data-skin="x"] :where([data-control-family="example"][data-slot="root"][data-checked]) { --cui-example-background: red; }\n[data-skin="x"] :where([data-control-family="example"][data-slot="root"]:hover) { --cui-example-background: blue; }\n[data-skin="x"] :where([data-control-family="example"][data-slot="root"][data-checked]) { --cui-example-checked-background: green; }',
    );
    expect(maskedStateWriteOffenders(skin, stateRoutes([recipe]))).toEqual([
      "1 --cui-example-background is not read in data-checked; set the knob the recipe reads there",
    ]);
  });
});
