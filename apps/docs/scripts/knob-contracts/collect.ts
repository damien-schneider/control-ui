import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import postcss from "postcss";

export const recipesDir = "src/registry/sources/control-ui/recipes";

export type KnobDoc = { name: string; syntax: string; initialValue: string; defaultValue: string };
export type KnobFamily = { id: string; recipes: string[]; knobs: KnobDoc[] };

type RecipeKnobs = { stem: string; registered: Map<string, Omit<KnobDoc, "defaultValue">>; defaults: Map<string, string> };

function readRecipe(cwd: string, file: string): RecipeKnobs {
  const root = postcss.parse(readFileSync(path.join(cwd, recipesDir, file), "utf8"), { from: file });
  const registered = new Map<string, Omit<KnobDoc, "defaultValue">>();
  const defaults = new Map<string, string>();
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
    if (declaration.prop.startsWith("--") && !defaults.has(declaration.prop)) defaults.set(declaration.prop, declaration.value);
  });
  return { stem: path.basename(file, ".css"), registered, defaults };
}

export function collectKnobFamilies(cwd = process.cwd()): KnobFamily[] {
  const recipes = readdirSync(path.join(cwd, recipesDir))
    .filter((name) => name.endsWith(".css"))
    .sort()
    .map((file) => readRecipe(cwd, file));
  const stems = recipes.map((recipe) => recipe.stem);
  const ownsKnob = (recipe: RecipeKnobs) => [...recipe.registered.keys()].some((knob) => knob.startsWith(`--${recipe.stem}-`));
  const isCompanion = (recipe: RecipeKnobs) =>
    !ownsKnob(recipe) && stems.some((other) => other !== recipe.stem && recipe.stem.startsWith(`${other}-`));
  const familyIds = recipes.filter((recipe) => !isCompanion(recipe)).map((recipe) => recipe.stem);
  const familiesByLength = [...familyIds].sort((left, right) => right.length - left.length);
  const familyOf = (name: string) => {
    const family = familiesByLength.find((candidate) => name.startsWith(`--${candidate}-`));
    if (!family) throw new Error(`${name} matches no recipe family in ${recipesDir}`);
    return family;
  };
  const familyOfRecipe = (stem: string) =>
    familiesByLength.find((candidate) => stem === candidate || stem.startsWith(`${candidate}-`)) ?? stem;

  const families = new Map<string, KnobFamily>(familyIds.map((id) => [id, { id, recipes: [], knobs: [] }]));
  for (const recipe of recipes) families.get(familyOfRecipe(recipe.stem))?.recipes.push(recipe.stem);
  for (const family of families.values()) family.recipes.sort((left, right) => Number(right === family.id) - Number(left === family.id));
  const defaultOf = (family: KnobFamily, name: string) =>
    family.recipes.map((stem) => recipes.find((recipe) => recipe.stem === stem)?.defaults.get(name)).find((value) => value !== undefined) ??
    "";
  for (const recipe of recipes) {
    for (const knob of recipe.registered.values()) {
      const family = families.get(familyOf(knob.name));
      if (family) family.knobs.push({ ...knob, defaultValue: defaultOf(family, knob.name) });
    }
  }
  return [...families.values()].sort((left, right) => left.id.localeCompare(right.id));
}
