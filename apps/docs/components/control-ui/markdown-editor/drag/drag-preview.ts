export type DragPreview = { element: HTMLDivElement; anchor: HTMLElement };

/** A list item takes its marker and indent from its list, so the copy keeps a shallow list around it. */
export function createDragPreview(nodes: readonly HTMLElement[], contentClass: string): DragPreview | null {
  const [first] = nodes;
  if (!first) return null;
  const preview = document.createElement("div");
  preview.className = contentClass;
  preview.dataset.markdownDragPreview = "";
  preview.setAttribute("aria-hidden", "true");
  let remainingNodes = 80;
  let remainingText = 2000;
  function clonePreview(source: Node): Node {
    remainingNodes--;
    const clone = source.cloneNode(false);
    if (clone instanceof HTMLElement) {
      clone.classList.remove("ProseMirror-selectednode");
      clone.removeAttribute("id");
    }
    if (clone instanceof Text) {
      clone.data = clone.data.slice(0, remainingText);
      remainingText -= clone.data.length;
    }
    for (const child of source.childNodes) {
      if (remainingNodes <= 0 || remainingText <= 0) break;
      clone.appendChild(clonePreview(child));
    }
    return clone;
  }
  const list = first.localName === "li" ? first.parentElement?.cloneNode(false) : null;
  const parent = list instanceof HTMLElement ? list : preview;
  if (parent !== preview) {
    parent.removeAttribute("id");
    preview.append(parent);
  }
  const width = `${first.getBoundingClientRect().width}px`;
  for (const node of nodes) {
    if (remainingNodes <= 0 || remainingText <= 0) break;
    const clone = clonePreview(node);
    if (clone instanceof HTMLElement) clone.style.inlineSize = width;
    parent.append(clone);
  }
  const anchor = parent.firstElementChild;
  if (!(anchor instanceof HTMLElement)) return null;
  return { element: preview, anchor };
}
