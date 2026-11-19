export type DragPreview = { element: HTMLDivElement; anchor: HTMLElement };

/** A list item renders its marker and indent from its list, so the copy keeps a shallow list around it. */
export function createDragPreview(node: HTMLElement): DragPreview {
  const preview = document.createElement("div");
  preview.className = "tiptap";
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
      if (remainingNodes === 0 || remainingText === 0) break;
      clone.appendChild(clonePreview(child));
    }
    return clone;
  }
  const anchor = clonePreview(node);
  if (!(anchor instanceof HTMLElement)) throw new Error("A block clone is an element");
  anchor.style.inlineSize = `${node.getBoundingClientRect().width}px`;
  const list = node.localName === "li" ? node.parentElement?.cloneNode(false) : null;
  if (list instanceof HTMLElement) {
    list.removeAttribute("id");
    list.append(anchor);
    preview.append(list);
  } else {
    preview.append(anchor);
  }
  return { element: preview, anchor };
}
