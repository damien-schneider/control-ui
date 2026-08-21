import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import postcss from "postcss";
import { collectKnobFamilies, knobPrefix, recipesDir } from "./knob-contracts/collect";
import { anatomySeparator, collectKnobOwnership, createSubjectAnatomyResolver } from "./knob-ownership";
import { collectSkinContract } from "./skin-contract/collect";

/** Distinctive enough that no initial value collides, small enough that the page stays interactive. */
const SENTINELS: Record<string, string> = {
  "<color>": "rgb(1, 2, 3)",
  "<length>": "7.5px",
  "<length-percentage>": "7.5px",
  "<length-percentage>+": "7.5px",
  "<number>": "1.75",
  "<time>": "0.001s",
  "*": "control-ui-sentinel",
};

export type KnobReachabilityProbe = {
  css: string;
  expected: Record<string, string>;
  knobsByFamily: Record<string, Record<string, string[]>>;
  undeclared: string[];
};

/**
 * Re-values every knob a recipe declares, at the anatomy the recipe declares it on — the same move a skin makes.
 * A part that still resolves its `@property` initial value is a part no skin can reach.
 */
export function buildKnobReachabilityProbe(): KnobReachabilityProbe {
  const expected: Record<string, string> = {};
  for (const family of collectKnobFamilies()) {
    for (const knob of family.knobs) {
      const sentinel = SENTINELS[knob.syntax];
      if (!sentinel) throw new Error(`${knob.name} registers an unhandled syntax: ${knob.syntax}`);
      if (sentinel === knob.initialValue) throw new Error(`${knob.name} initialises to the ${knob.syntax} sentinel`);
      expected[knob.name] = sentinel;
    }
  }

  const declared = new Set<string>();
  const rules: string[] = [];
  const recipeRoot = path.resolve(recipesDir);
  for (const file of readdirSync(recipeRoot).filter((name) => name.endsWith(".css"))) {
    const root = postcss.parse(readFileSync(path.join(recipeRoot, file), "utf8"), { from: file });
    const bySelector = new Map<string, string[]>();
    root.walkDecls((declaration) => {
      if (!declaration.prop.startsWith(knobPrefix) || declaration.parent?.type !== "rule") return;
      const sentinel = expected[declaration.prop];
      if (!sentinel) return;
      declared.add(declaration.prop);
      const selector = declaration.parent.selector.replace(/\s+/g, " ");
      bySelector.set(selector, [...(bySelector.get(selector) ?? []), `${declaration.prop}: ${sentinel};`]);
    });
    for (const [selector, declarations] of bySelector) rules.push(`${selector} { ${declarations.join(" ")} }`);
  }

  const knobsByFamily: Record<string, Record<string, string[]>> = {};
  const contract = collectSkinContract();
  for (const [anatomy, byProperty] of collectKnobOwnership(contract, createSubjectAnatomyResolver(contract))) {
    const knobs = [...new Set([...byProperty.values()].flatMap((set) => [...set]))].filter((knob) => declared.has(knob));
    if (knobs.length === 0) continue;
    const [family, part] = anatomy.split(anatomySeparator);
    knobsByFamily[family] = { ...knobsByFamily[family], [part]: knobs.sort() };
  }

  return {
    css: rules.join("\n"),
    expected,
    knobsByFamily,
    undeclared: Object.keys(expected)
      .filter((knob) => !declared.has(knob))
      .sort(),
  };
}
