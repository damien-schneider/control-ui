import type { DocsKnobFamily, SourceFile } from "@/app/(features)/model/types";
import { collectKnobFamilies, recipesDir } from "@/scripts/knob-contracts/collect";

const families = collectKnobFamilies();
const familyByRecipe = new Map(families.flatMap((family) => family.recipes.map((recipe) => [recipe, family] as const)));

export function knobFamiliesFor(files: SourceFile[]): DocsKnobFamily[] {
  const recipes = files
    .map((file) => file.path)
    .filter((filePath) => filePath.startsWith(`${recipesDir}/`))
    .map((filePath) => filePath.slice(recipesDir.length + 1).replace(/\.css$/, ""));
  const matched = new Set(recipes.map((recipe) => familyByRecipe.get(recipe)).filter((family) => family !== undefined));
  return [...matched]
    .filter((family) => family.knobs.length > 0)
    .map((family) => ({
      id: family.id,
      knobs: family.knobs.map(({ name, syntax, defaultValue }) => ({ name, syntax, defaultValue })),
    }));
}
