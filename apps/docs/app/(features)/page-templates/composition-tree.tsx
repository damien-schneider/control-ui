import type { CompositionNode } from "@/app/(features)/catalog/compositions/types";
import { Card, CardContent } from "@/components/control-ui/ui/card";
import { Text } from "@/components/control-ui/ui/typography";

const TAG = "w-fit leading-7";
const NESTED_ROW =
  "relative grid pl-3 before:absolute before:top-0 before:bottom-0 before:left-0 before:w-px before:bg-border last:before:bottom-auto last:before:h-[0.95rem] after:absolute after:top-[0.95rem] after:left-0 after:w-3 after:border-border after:border-t";

export function CompositionTree({ tree, ownParts }: { tree: CompositionNode; ownParts?: readonly string[] }) {
  const owned = new Set(ownParts ?? []);

  return (
    <Card size="sm" className="min-w-0">
      <CardContent>
        <section
          aria-label="Composition tree"
          // biome-ignore lint/a11y/noNoninteractiveTabindex: Overflowing trees must support keyboard scrolling.
          tabIndex={0}
          className="overflow-x-auto"
        >
          <ul className="grid min-w-max">
            <TreeNode node={tree} owned={owned} />
          </ul>
        </section>
      </CardContent>
    </Card>
  );
}

function TreeNode({ node, owned, nested = false }: { node: CompositionNode; owned: Set<string>; nested?: boolean }) {
  const hasChildren = node.children.length > 0;
  const isOwned = owned.size === 0 || owned.has(node.name);

  return (
    <li className={nested ? NESTED_ROW : "grid"}>
      {node.kind === "part" ? (
        <span data-tag="open" className={TAG}>
          <Text size="label" tone="muted" mono>
            &lt;
            <Text size="label" tone={isOwned ? "foreground" : "muted"} mono>
              {node.name}
            </Text>
            {hasChildren ? ">" : " />"}
          </Text>
        </span>
      ) : (
        <span className={TAG}>
          <Text size="label" tone="muted" mono>
            {node.name}
          </Text>
        </span>
      )}
      {hasChildren ? (
        <>
          <ul className="grid min-w-max pl-5">
            {node.children.map((child) => (
              <TreeNode key={child.name} node={child} owned={owned} nested />
            ))}
          </ul>
          {node.kind === "part" ? (
            <span data-tag="close" className={TAG}>
              <Text size="label" tone="muted" mono>{`</${node.name}>`}</Text>
            </span>
          ) : null}
        </>
      ) : null}
    </li>
  );
}
