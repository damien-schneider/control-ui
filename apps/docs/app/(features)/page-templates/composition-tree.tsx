import type { CompositionNode } from "@/app/(features)/catalog/compositions/types";

const TREE_HOVER =
  "[&:has(span[data-tag]:hover)_li:not(:has(>span[data-tag]:hover))>span[data-tag]]:opacity-30 [&_span[data-tag]]:transition-[opacity,background-color] [&_span[data-tag]]:duration-[var(--duration-fast)]";
const ROW_PAIR = "has-[>span[data-tag]:hover]:[&>span[data-tag]]:bg-foreground/10";
const TAG = "-mx-1 w-fit rounded px-1";
const NESTED_ROW =
  "relative grid pl-3 before:absolute before:top-0 before:bottom-0 before:left-0 before:w-px before:bg-border last:before:bottom-auto last:before:h-[0.95rem] after:absolute after:top-[0.95rem] after:left-0 after:w-3 after:border-border after:border-t";

export function CompositionTree({ tree, ownParts }: { tree: CompositionNode; ownParts?: readonly string[] }) {
  const owned = new Set(ownParts ?? []);

  return (
    <section
      aria-label="Composition tree"
      // biome-ignore lint/a11y/noNoninteractiveTabindex: Overflowing trees must support keyboard scrolling.
      tabIndex={0}
      className={`docs-panel overflow-x-auto px-5 py-4 font-mono text-label leading-7 ${TREE_HOVER}`}
    >
      <ul className="grid min-w-max">
        <TreeNode node={tree} owned={owned} />
      </ul>
    </section>
  );
}

function TreeNode({ node, owned, nested = false }: { node: CompositionNode; owned: Set<string>; nested?: boolean }) {
  const hasChildren = node.children.length > 0;
  const isOwned = owned.size === 0 || owned.has(node.name);

  return (
    <li className={nested ? `${NESTED_ROW} ${ROW_PAIR}` : `grid ${ROW_PAIR}`}>
      {node.kind === "part" ? (
        <span data-tag="open" className={isOwned ? TAG : `${TAG} opacity-55`}>
          <span className="text-muted-foreground/60">&lt;</span>
          <span className="text-foreground">{node.name}</span>
          <span className="text-muted-foreground/60">{hasChildren ? ">" : " />"}</span>
        </span>
      ) : (
        <span className={`${TAG} text-muted-foreground`}>{node.name}</span>
      )}
      {hasChildren ? (
        <>
          <ul className="grid min-w-max pl-5">
            {node.children.map((child) => (
              <TreeNode key={child.name} node={child} owned={owned} nested />
            ))}
          </ul>
          {node.kind === "part" ? (
            <span data-tag="close" className={`${TAG} text-muted-foreground/45 ${isOwned ? "" : "opacity-55"}`}>
              {`</${node.name}>`}
            </span>
          ) : null}
        </>
      ) : null}
    </li>
  );
}
