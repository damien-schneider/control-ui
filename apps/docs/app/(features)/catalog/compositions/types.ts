export type CompositionNode = {
  kind: "part" | "content";
  name: string;
  children: readonly CompositionNode[];
};

export type CatalogCompositionExample = {
  title: string;
  description?: string;
  tree: CompositionNode;
};

export type CatalogComposition = readonly [CatalogCompositionExample, ...CatalogCompositionExample[]];

export function part(name: string, ...children: CompositionNode[]): CompositionNode {
  return { kind: "part", name, children };
}

export function content(name: string, ...children: CompositionNode[]): CompositionNode {
  return { kind: "content", name, children };
}

export function example(title: string, tree: CompositionNode, description?: string): CatalogCompositionExample {
  return { title, tree, description };
}
