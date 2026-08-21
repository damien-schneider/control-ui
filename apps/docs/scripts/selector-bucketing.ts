import selectorParser from "postcss-selector-parser";
import { familyAttribute } from "./control-anatomy";

type Selector = selectorParser.Selector;
type Node = selectorParser.Node;

const isFlattenable = (node: Node): node is selectorParser.Pseudo =>
  node.type === "pseudo" && (node.value === ":where" || node.value === ":is");

export function subjectCompound(selector: Selector): Node[] {
  const compound: Node[] = [];
  for (const node of selector.nodes) {
    if (node.type === "combinator") compound.length = 0;
    else compound.push(node);
  }
  return compound;
}

export function flattenCompound(compound: Node[]): Node[][] {
  let flattened: Node[][] = [[]];
  for (const node of compound) {
    if (!isFlattenable(node)) {
      flattened = flattened.map((nodes) => [...nodes, node]);
      continue;
    }
    const tails = node.nodes.flatMap((argument) => flattenCompound(subjectCompound(argument)));
    flattened = flattened.flatMap((nodes) => tails.map((tail) => [...nodes, ...tail]));
  }
  return flattened;
}

export const splitsTheBucket = (compound: Node[]): boolean =>
  compound.some((node) => node.type === "pseudo" && node.value === ":where" && node.nodes.length > 1);

export function familyIsMisplaced(compound: Node[]): boolean {
  return flattenCompound(compound).some((nodes) => {
    const attributes = nodes.filter((node): node is selectorParser.Attribute => node.type === "attribute");
    const index = attributes.findIndex((attribute) => attribute.attribute === familyAttribute);
    return index !== -1 && index !== attributes.length - 1;
  });
}

/** Blink buckets a rule by the last attribute of its subject compound; a selector list inside `:where()` buckets nowhere. */
export function bucketingOffenders(selector: string): string[] {
  const offenders: string[] = [];
  selectorParser((selectors) => {
    selectors.each((current) => {
      const compound = subjectCompound(current);
      const text = current.toString().trim();
      if (splitsTheBucket(compound)) offenders.push(`${text} — split the subject's :where() into one selector per argument`);
      else if (familyIsMisplaced(compound)) offenders.push(`${text} — ${familyAttribute} must be the subject's last attribute`);
    });
  }).processSync(selector);
  return offenders;
}
