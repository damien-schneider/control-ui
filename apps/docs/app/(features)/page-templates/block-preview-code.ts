import type { SourceFile } from "@/app/(features)/model/types";

export function blockPreviewCode(block: { id: string; files: readonly SourceFile[] }) {
  const recipe = block.files.find((file) => file.slot === "block");

  if (!recipe) throw new Error(`Block ${block.id} is missing its installable recipe source.`);

  return recipe.code;
}
