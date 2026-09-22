import { writeFileSync } from "node:fs";
import path from "node:path";
import { themeFontId } from "../mastra/theme-fonts";

const METADATA_URL = "https://fonts.google.com/metadata/fonts";
const outPath = path.join(process.cwd(), "mastra", "google-fonts.json");

const CSS_CATEGORY_BY_LABEL: Record<string, string> = {
  Serif: "serif",
  "Sans Serif": "sans-serif",
  Display: "display",
  Handwriting: "handwriting",
  Monospace: "monospace",
};

const VARIABLE_ANCHOR_WEIGHTS = [400, 700];

type WeightAxis = { tag: string; min: number; max: number };
type FamilyMetadata = { family: string; category: string; fonts: Record<string, unknown>; axes?: WeightAxis[] };
type CatalogueEntry = { family: string; category: string; weights: number[] };

function staticWeights(fonts: Record<string, unknown>): number[] {
  return Object.keys(fonts ?? {})
    .filter((key) => /^\d+$/.test(key))
    .map(Number);
}

function weightsOf(meta: FamilyMetadata): number[] {
  const statics = staticWeights(meta.fonts);
  if (statics.length > 0) return [...new Set(statics)].sort((left, right) => left - right);
  const weightAxis = meta.axes?.find((axis) => axis.tag === "wght");
  if (!weightAxis) return [400];
  const anchors = VARIABLE_ANCHOR_WEIGHTS.filter((weight) => weight > weightAxis.min && weight < weightAxis.max);
  return [...new Set([weightAxis.min, ...anchors, weightAxis.max])].sort((left, right) => left - right);
}

function serialise(byId: Record<string, CatalogueEntry>): string {
  const entries = Object.keys(byId)
    .sort()
    .map((id) => {
      const { family, category, weights } = byId[id];
      return `  ${JSON.stringify(id)}: {\n    "family": ${JSON.stringify(family)},\n    "category": ${JSON.stringify(category)},\n    "weights": [${weights.join(", ")}]\n  }`;
    });
  return `{\n${entries.join(",\n")}\n}\n`;
}

const response = await fetch(METADATA_URL);
if (!response.ok) {
  console.error(`Google Fonts metadata request failed: ${response.status} ${response.statusText}`);
  process.exit(1);
}

const payload: { familyMetadataList?: FamilyMetadata[] } = await response.json();
const families = payload.familyMetadataList;
if (!families || families.length === 0) {
  console.error("Google Fonts metadata carried no familyMetadataList — refusing to overwrite the catalogue.");
  process.exit(1);
}

const catalogue: Record<string, CatalogueEntry> = {};
for (const meta of families) {
  const category = CSS_CATEGORY_BY_LABEL[meta.category];
  if (!category) continue;
  const id = themeFontId(meta.family);
  if (!id) continue;
  catalogue[id] = { family: meta.family, category, weights: weightsOf(meta) };
}

writeFileSync(outPath, serialise(catalogue));
console.log(`Wrote ${Object.keys(catalogue).length} families to ${path.relative(process.cwd(), outPath)}`);
