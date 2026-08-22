import type { DocsKnobFamily, SourceFile } from "@/app/(features)/model/types";
import { collectKnobFamilies, recipesDir } from "@/scripts/knob-contracts/collect";

const families = collectKnobFamilies();
const familyByRecipe = new Map(families.flatMap((family) => family.recipes.map((recipe) => [recipe, family] as const)));

function familyOf(file: SourceFile) {
  if (!file.path.startsWith(`${recipesDir}/`)) return undefined;
  return familyByRecipe.get(file.path.slice(recipesDir.length + 1).replace(/\.css$/, ""));
}

export function knobFamiliesFor(files: SourceFile[]): DocsKnobFamily[] {
  const matched = new Set(files.map(familyOf).filter((family) => family !== undefined));
  return [...matched]
    .filter((family) => family.knobs.length > 0)
    .map((family) => ({
      id: family.id,
      knobs: family.knobs.map(({ name, syntax, defaultValue }) => ({ name, syntax, defaultValue })),
    }));
}

export function knobFamilyIdOf(file: SourceFile): string | undefined {
  return familyOf(file)?.id;
}
