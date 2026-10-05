export function createDragPreview(node: HTMLElement) {
  const preview = document.createElement("div");
  preview.className = "tiptap";
  preview.dataset.markdownDragPreview = "";
  preview.setAttribute("aria-hidden", "true");
  preview.style.inlineSize = `${Math.min(node.getBoundingClientRect().width, 320)}px`;
  const clone = node.cloneNode(true);
  if (clone instanceof HTMLElement) {
    clone.classList.remove("ProseMirror-selectednode");
    clone.removeAttribute("id");
    for (const element of clone.querySelectorAll("[id]")) element.removeAttribute("id");
  }
  preview.append(clone);
  return preview;
}
