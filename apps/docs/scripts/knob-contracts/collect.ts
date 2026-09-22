import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import postcss from "postcss";

export const recipesDir = "src/registry/sources/control-ui/recipes";
export const knobContractsDir = "src/registry/knob-contracts";
export const knobPrefix = "--cui-";

export type KnobDoc = { name: string; syntax: string; initialValue: string; defaultValue: string; selector: string };
export type KnobFamily = { id: string; recipes: string[]; knobs: KnobDoc[] };

type RecipeKnobs = {
  stem: string;
  registered: Map<string, Omit<KnobDoc, "defaultValue" | "selector">>;
  defaults: Map<string, string>;
  selectors: Map<string, string>;
};

function readRecipe(cwd: string, file: string): RecipeKnobs {
  const root = postcss.parse(readFileSync(path.join(cwd, recipesDir, file), "utf8"), { from: file });
  const registered = new Map<string, Omit<KnobDoc, "defaultValue" | "selector">>();
  const defaults = new Map<string, string>();
  const selectors = new Map<string, string>();
  root.walkAtRules("property", (atRule) => {
    const name = atRule.params.trim();
    if (name.startsWith("--_")) return;
    let syntax = "*";
    let initialValue = "";
    atRule.walkDecls((declaration) => {
      if (declaration.prop === "syntax") syntax = declaration.value.replace(/^["']|["']$/g, "");
      if (declaration.prop === "initial-value") initialValue = declaration.value;
    });
    registered.set(name, { name, syntax, initialValue });
  });
  root.walkDecls((declaration) => {
    if (!declaration.prop.startsWith("--")) return;
    if (!defaults.has(declaration.prop)) defaults.set(declaration.prop, declaration.value);
    const parent = declaration.parent;
    if (parent instanceof postcss.Rule && !selectors.has(declaration.prop)) selectors.set(declaration.prop, parent.selector);
  });
  return { stem: path.basename(file, ".css"), registered, defaults, selectors };
}

export function collectKnobFamilies(cwd = process.cwd()): KnobFamily[] {
  const recipes = readdirSync(path.join(cwd, recipesDir))
    .filter((name) => name.endsWith(".css"))
    .sort()
    .map((file) => readRecipe(cwd, file));
  const stems = recipes.map((recipe) => recipe.stem);
  const ownsKnob = (recipe: RecipeKnobs) => [...recipe.registered.keys()].some((knob) => knob.startsWith(`${knobPrefix}${recipe.stem}-`));
  const isCompanion = (recipe: RecipeKnobs) =>
    !ownsKnob(recipe) && stems.some((other) => other !== recipe.stem && recipe.stem.startsWith(`${other}-`));
  const familyIds = recipes.filter((recipe) => !isCompanion(recipe)).map((recipe) => recipe.stem);
  const familiesByLength = [...familyIds].sort((left, right) => right.length - left.length);
  const familyOf = (name: string) => {
    const family = familiesByLength.find((candidate) => name.startsWith(`${knobPrefix}${candidate}-`));
    if (!family) throw new Error(`${name} matches no recipe family in ${recipesDir}`);
    return family;
  };
  const familyOfRecipe = (stem: string) =>
    familiesByLength.find((candidate) => stem === candidate || stem.startsWith(`${candidate}-`)) ?? stem;

  const families = new Map<string, KnobFamily>(familyIds.map((id) => [id, { id, recipes: [], knobs: [] }]));
  for (const recipe of recipes) families.get(familyOfRecipe(recipe.stem))?.recipes.push(recipe.stem);
  for (const family of families.values()) family.recipes.sort((left, right) => Number(right === family.id) - Number(left === family.id));
  // Other recipes re-declare a foreign knob to restyle one instance of that component — audio-recorder sets
  // --cui-button-shadow on its own record trigger — so only the owning family may answer for a knob.
  const firstInOwnRecipes = (family: KnobFamily, read: (recipe: RecipeKnobs) => string | undefined) => {
    for (const stem of family.recipes) {
      const recipe = recipes.find((candidate) => candidate.stem === stem);
      const value = recipe && read(recipe);
      if (value !== undefined) return value;
    }
    return "";
  };

  for (const recipe of recipes) {
    for (const knob of recipe.registered.values()) {
      const family = families.get(familyOf(knob.name));
      if (!family) continue;
      family.knobs.push({
        ...knob,
        defaultValue: firstInOwnRecipes(family, (owner) => owner.defaults.get(knob.name)),
        selector: firstInOwnRecipes(family, (owner) => owner.selectors.get(knob.name)),
      });
    }
  }
  return [...families.values()].sort((left, right) => left.id.localeCompare(right.id));
}

export function knobsByFamily(): Record<string, string[]> {
  return Object.fromEntries(collectKnobFamilies().map((family) => [family.id, family.knobs.map((knob) => knob.name)]));
}
