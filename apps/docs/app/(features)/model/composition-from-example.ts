type TagNode = { name: string; children: TagNode[] };

const BRANCH_LAST = "└── ";
const BRANCH_MID = "├── ";
const INDENT_LAST = "    ";
const INDENT_MID = "│   ";
const TAG = /<(\/?)([A-Z][A-Za-z0-9]*)/g;
const CONTROL_UI_IMPORT = /import\s*{([^}]*)}\s*from\s*"@\/components\/control-ui\/[^"]*"/g;

function endOfQuote(code: string, from: number, quote: string) {
  for (let index = from; index < code.length; index += 1) {
    if (code[index] === "\\") index += 1;
    else if (code[index] === quote) return index;
  }
  return code.length;
}

function afterDelimiter(code: string, from: number, delimiter: string) {
  const end = code.indexOf(delimiter, from);
  return end === -1 ? code.length : end + delimiter.length;
}

// Comments mention parts as prose tags ("handed to <AudioRecorder deviceId>"), which would otherwise open a node.
function withoutComments(code: string) {
  let stripped = "";
  let index = 0;

  while (index < code.length) {
    const char = code[index];
    if (char === '"' || char === "'" || char === "`") {
      const close = endOfQuote(code, index + 1, char);
      stripped += code.slice(index, close + 1);
      index = close + 1;
    } else if (code.startsWith("//", index)) {
      index = afterDelimiter(code, index, "\n");
    } else if (code.startsWith("/*", index)) {
      index = afterDelimiter(code, index, "*/");
    } else {
      stripped += char;
      index += 1;
    }
  }

  return stripped;
}

function* charsOutsideBraces(code: string, from: number) {
  let braces = 0;

  for (let index = from; index < code.length; index += 1) {
    const char = code[index];
    if (char === '"' || char === "'" || char === "`") index = endOfQuote(code, index + 1, char);
    else if (char === "{") braces += 1;
    else if (char === "}") braces -= 1;
    else if (braces === 0) yield { char, index };
  }
}

// Generic arguments put `<`/`>` pairs in the tag itself, so only an unpaired `>` outside props ends it.
function tagEnd(code: string, from: number) {
  let angles = 0;

  for (const { char, index } of charsOutsideBraces(code, from)) {
    if (char === "<") angles += 1;
    else if (char === ">" && angles > 0) angles -= 1;
    else if (char === ">") return { end: index, selfClosing: code[index - 1] === "/" };
  }

  return { end: code.length, selfClosing: true };
}

function mergeInto(siblings: TagNode[], name: string) {
  const existing = siblings.find((sibling) => sibling.name === name);
  if (existing) return existing;

  const node: TagNode = { name, children: [] };
  siblings.push(node);
  return node;
}

function closeTag(stack: TagNode[], name: string) {
  const depth = stack.findLastIndex((open) => open.name === name);
  if (depth >= 0) stack.length = depth;
}

// Neighbours only join the tree inside an owned root, so demo chrome never becomes the component's anatomy.
function parseExample(code: string, owned: ReadonlySet<string>, tracked: ReadonlySet<string>) {
  const roots: TagNode[] = [];
  const stack: TagNode[] = [];
  TAG.lastIndex = 0;

  for (let match = TAG.exec(code); match; match = TAG.exec(code)) {
    const [token, closing, name] = match;
    if (!name) continue;

    if (closing) {
      closeTag(stack, name);
      continue;
    }

    const { end, selfClosing } = tagEnd(code, match.index + token.length);
    TAG.lastIndex = end + 1;
    const siblings = stack.at(-1)?.children ?? (owned.has(name) ? roots : undefined);
    if (!siblings || !tracked.has(name)) continue;

    const node = mergeInto(siblings, name);
    if (!selfClosing) stack.push(node);
  }

  return roots;
}

// A neighbour with no owned part under it is demo filler, so it stays a leaf instead of unfolding its own anatomy.
function pruneFiller(nodes: TagNode[], owned: ReadonlySet<string>) {
  for (const node of nodes) {
    pruneFiller(node.children, owned);
    if (!owned.has(node.name) && !usedNames(node.children).some((name) => owned.has(name))) node.children = [];
  }
  return nodes;
}

function serialize(nodes: TagNode[], indent: string, root: boolean): string[] {
  return nodes.flatMap((node, index) => {
    const last = index === nodes.length - 1;
    const line = root ? node.name : `${indent}${last ? BRANCH_LAST : BRANCH_MID}${node.name}`;
    const childIndent = root ? "" : `${indent}${last ? INDENT_LAST : INDENT_MID}`;
    return [line, ...serialize(node.children, childIndent, false)];
  });
}

function usedNames(nodes: TagNode[]): string[] {
  return nodes.flatMap((node) => [node.name, ...usedNames(node.children)]);
}

// Neighbouring control-ui components belong in the tree — the renderer dims the ones this source does not export.
function importedControlUiNames(code: string) {
  return [...code.matchAll(CONTROL_UI_IMPORT)].flatMap((match) =>
    (match[1] ?? "").split(",").map((binding) => (binding.split(" as ").at(-1) ?? "").trim()),
  );
}

export function compositionTreeFromExample(exampleCode: string, parts: readonly string[]) {
  const code = withoutComments(exampleCode);
  const owned = new Set(parts);
  const tracked = new Set([...parts, ...importedControlUiNames(code)].filter((name) => /^[A-Z]/.test(name)));
  const roots = pruneFiller(parseExample(code, owned, tracked), owned);
  if (!roots.some((node) => node.children.length > 0)) return undefined;

  const used = new Set(usedNames(roots));
  return { code: serialize(roots, "", true).join("\n"), unusedParts: parts.filter((part) => !used.has(part)) };
}
