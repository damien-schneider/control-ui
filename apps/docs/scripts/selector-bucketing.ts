import type selectorParser from "postcss-selector-parser";

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
