export function createDragPreview(node: HTMLElement) {
  const preview = document.createElement("div");
  preview.className = "tiptap";
  preview.dataset.markdownDragPreview = "";
  preview.setAttribute("aria-hidden", "true");
  preview.style.inlineSize = `${Math.min(node.getBoundingClientRect().width, 320)}px`;
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
  preview.append(clonePreview(node));
  return preview;
}
