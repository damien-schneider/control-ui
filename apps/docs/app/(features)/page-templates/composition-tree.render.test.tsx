import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { catalogCompositions } from "@/app/(features)/catalog/compositions";
import type { CompositionNode } from "@/app/(features)/catalog/compositions/types";
import { CompositionSection } from "./shared";

function flattenTree(node: CompositionNode): CompositionNode[] {
  return [node, ...node.children.flatMap(flattenTree)];
}

function countMatches(html: string, pattern: RegExp) {
  return html.match(pattern)?.length ?? 0;
}

for (const [entryId, examples] of Object.entries(catalogCompositions)) {
  test(`${entryId} renders every authored composition node as a nested tree`, () => {
    const html = renderToStaticMarkup(<CompositionSection items={[...examples]} />);
    const nodes = examples.flatMap((example) => flattenTree(example.tree));
    const parts = nodes.filter((node) => node.kind === "part");
    const nestingParts = parts.filter((node) => node.children.length > 0);

    expect(countMatches(html, /aria-label="Composition tree"/g)).toBe(examples.length);
    expect(countMatches(html, /<li\b/g)).toBe(nodes.length);
    expect(countMatches(html, /data-tag="open"/g)).toBe(parts.length);
    expect(countMatches(html, /data-tag="close"/g)).toBe(nestingParts.length);
    expect(countMatches(html, /<ul\b/g)).toBe(examples.length + nodes.filter((node) => node.children.length > 0).length);
    for (const node of nestingParts) expect(html).toContain(`&lt;/${node.name}&gt;`);
  });
}
