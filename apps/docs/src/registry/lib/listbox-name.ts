import type { Ref } from "react";

const MAX_FRAMES = 30;

/** Names the listbox once Base UI has given it an id and pointed its owner's aria-controls at it, a few renders after mount. */
function nameListboxAfterOwner(node: HTMLElement) {
  let frame = 0;
  let attempts = 0;
  const attempt = () => {
    const list = node.matches('[role="listbox"]') ? node : node.querySelector<HTMLElement>('[role="listbox"]');
    const owner = list?.id ? list.ownerDocument.querySelector<HTMLElement>(`[aria-controls~="${CSS.escape(list.id)}"]`) : null;
    if (list && owner) nameListbox(list, owner);
    else if (++attempts < MAX_FRAMES) frame = requestAnimationFrame(attempt);
  };
  frame = requestAnimationFrame(attempt);
  return () => cancelAnimationFrame(frame);
}

function nameListbox(list: HTMLElement, owner: HTMLElement) {
  if (list.hasAttribute("aria-label") || list.hasAttribute("aria-labelledby")) return;
  const label = owner.getAttribute("aria-label");
  if (label) {
    list.setAttribute("aria-label", label);
    return;
  }
  const labelledBy = owner.getAttribute("aria-labelledby");
  if (labelledBy) {
    list.setAttribute("aria-labelledby", labelledBy);
    return;
  }
  const [labelElement] = (owner as HTMLInputElement).labels ?? [];
  if (!labelElement) return;
  labelElement.id ||= `${list.id}-label`;
  list.setAttribute("aria-labelledby", labelElement.id);
}

/**
 * Base UI leaves popup listboxes unnamed, while ARIA requires a name. The returned ref names the listbox at or inside
 * its node after the combobox that controls it, unless the listbox already has a name, and forwards the node to `ref`.
 */
export function listboxNameRef<T extends HTMLElement>(ref: Ref<T> | undefined) {
  return (node: T | null) => {
    if (!node) return;
    const stop = nameListboxAfterOwner(node);
    const release = typeof ref === "function" ? ref(node) : undefined;
    if (ref && typeof ref !== "function") ref.current = node;
    return () => {
      stop();
      if (typeof release === "function") release();
      else if (typeof ref === "function") ref(null);
      else if (ref) ref.current = null;
    };
  };
}
