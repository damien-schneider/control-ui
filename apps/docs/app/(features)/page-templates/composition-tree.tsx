type CompositionNode = { id: string; name: string; children: CompositionNode[] };

const BRANCH_PREFIX = /^[\s│├└─]+/;
const COMPONENT_TAG = /^([A-Z][A-Za-z0-9]*)(\s+.+)?$/;
const LEVEL_WIDTH = 4;
const TREE_HOVER =
  "[&:has(span[data-tag]:hover)_li:not(:has(>span[data-tag]:hover))>span[data-tag]]:opacity-30 [&_span[data-tag]]:transition-[opacity,background-color] [&_span[data-tag]]:duration-[var(--duration-fast)]";
const ROW_PAIR = "has-[>span[data-tag]:hover]:[&>span[data-tag]]:bg-foreground/10";
const TAG = "-mx-1 w-fit rounded px-1";
const NESTED_ROW =
  "relative grid pl-3 before:absolute before:top-0 before:bottom-0 before:left-0 before:w-px before:bg-border last:before:bottom-auto last:before:h-[0.95rem] after:absolute after:top-[0.95rem] after:left-0 after:w-3 after:border-border after:border-t";

export function parseCompositionTree(code: string): CompositionNode[] {
  const roots: CompositionNode[] = [];
  const levels: CompositionNode[][] = [roots];

  for (const line of code.split("\n")) {
    const name = line.replace(BRANCH_PREFIX, "").trim();
    if (name.length === 0) continue;

    const depth = Math.round((line.length - line.replace(BRANCH_PREFIX, "").length) / LEVEL_WIDTH);
    const siblings = levels[depth] ?? roots;
    const node: CompositionNode = { id: `${depth}-${siblings.length}-${name}`, name, children: [] };
    siblings.push(node);
    levels[depth + 1] = node.children;
  }

  return roots;
}

export function CompositionTree({ code, ownParts }: { code: string; ownParts?: string[] }) {
  const nodes = parseCompositionTree(code);
  const flat = nodes.every((node) => node.children.length === 0);
  const owned = new Set(ownParts ?? []);

  return (
    <div className={`min-w-0 overflow-x-auto rounded-xl border bg-muted/25 px-5 py-4 font-mono text-label leading-7 ${TREE_HOVER}`}>
      {flat && nodes.length > 1 ? <PartList nodes={nodes} /> : <NodeList nodes={nodes} owned={owned} />}
    </div>
  );
}

function PartList({ nodes }: { nodes: CompositionNode[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {nodes.map((node) => (
        <li key={node.id} className="rounded-md border bg-background px-2 py-1 text-caption">
          <span className="text-muted-foreground/60">&lt;</span>
          {node.name}
          <span className="text-muted-foreground/60">&gt;</span>
        </li>
      ))}
    </ul>
  );
}

function NodeList({ nodes, owned, nested = false }: { nodes: CompositionNode[]; owned: Set<string>; nested?: boolean }) {
  return (
    <ul className={nested ? "grid min-w-max pl-5" : "grid min-w-max"}>
      {nodes.map((node) => (
        <li key={node.id} className={nested ? `${NESTED_ROW} ${ROW_PAIR}` : `grid ${ROW_PAIR}`}>
          <NodeTag node={node} owned={owned} />
          {node.children.length > 0 ? (
            <>
              <NodeList nodes={node.children} owned={owned} nested />
              <ClosingTag node={node} owned={owned} />
            </>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function isOwned(name: string, owned: Set<string>) {
  return owned.size === 0 || owned.has(name);
}

function NodeTag({ node, owned }: { node: CompositionNode; owned: Set<string> }) {
  const tag = COMPONENT_TAG.exec(node.name);
  if (!tag) return <span className={`${TAG} text-muted-foreground`}>{node.name}</span>;

  return (
    <span data-tag="open" className={isOwned(tag[1], owned) ? TAG : `${TAG} opacity-55`}>
      <span className="text-muted-foreground/60">&lt;</span>
      <span className="text-foreground">{tag[1]}</span>
      {tag[2] ? <span className="text-primary-text">{tag[2]}</span> : null}
      <span className="text-muted-foreground/60">{node.children.length > 0 ? ">" : " />"}</span>
    </span>
  );
}

function ClosingTag({ node, owned }: { node: CompositionNode; owned: Set<string> }) {
  const tag = COMPONENT_TAG.exec(node.name);
  if (!tag) return null;

  return (
    <span
      data-tag="close"
      className={`${TAG} text-muted-foreground/45 ${isOwned(tag[1], owned) ? "" : "opacity-55"}`}
    >{`</${tag[1]}>`}</span>
  );
}
