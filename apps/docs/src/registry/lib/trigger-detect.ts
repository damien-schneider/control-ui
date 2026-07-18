// pure trigger detection shared by every binding (textarea DOM binding + ProseMirror plugin), no React/framework
// assumptions — takes text before caret, answers "is a /-style trigger active, what's typed after it?"
// caret-rect helper is the only DOM-touching export, kept here so both bindings anchor the popup the same way

export type TriggerMatch = {
  /** The trigger character that opened the menu (e.g. "/" or "@"). */
  char: string;
  /** Text typed after the trigger char, up to the caret (never contains whitespace). */
  query: string;
  /** Offset of the trigger char in the scanned text; the token spans [start, end). */
  start: number;
  /** Offset of the caret in the scanned text (exclusive end of the trigger token). */
  end: number;
};

const WHITESPACE = new Set([" ", "\n", "\t", " "]);

// active only when char sits at start or after whitespace (so `path/to` never triggers on `/`); closes as soon as whitespace follows
// walks back from caret; first non-query char decides the outcome
export function detectTrigger(textBeforeCaret: string, triggerChars: readonly string[]): TriggerMatch | null {
  const triggerSet = new Set(triggerChars);
  for (let i = textBeforeCaret.length - 1; i >= 0; i -= 1) {
    const char = textBeforeCaret[i];
    if (WHITESPACE.has(char)) return null;
    if (triggerSet.has(char)) {
      const preceding = i === 0 ? "" : textBeforeCaret[i - 1];
      if (preceding === "" || WHITESPACE.has(preceding)) {
        return { char, query: textBeforeCaret.slice(i + 1), start: i, end: textBeforeCaret.length };
      }
      return null;
    }
  }
  return null;
}

// layout-affecting properties mirrored onto the measuring div so its caret column matches the textarea's
const MIRROR_PROPERTIES = [
  "box-sizing",
  "width",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "font-variant",
  "letter-spacing",
  "text-transform",
  "text-indent",
  "line-height",
  "tab-size",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
];

// viewport-space rect of caret (or any offset) in <textarea>, so popup anchors to exact glyph like ProseMirror's coordsAtPos
// hidden-mirror technique: clone textarea's text geometry into off-screen div, drop marker at offset, read marker's box
// 1px-wide rect keyed to line height — enough for the positioner to place a popup
export function caretRectInTextarea(element: HTMLTextAreaElement, offset: number): DOMRect {
  const doc = element.ownerDocument;
  const computed = doc.defaultView?.getComputedStyle(element);
  const mirror = doc.createElement("div");
  const style = mirror.style;
  style.position = "absolute";
  style.visibility = "hidden";
  style.whiteSpace = "pre-wrap";
  style.overflowWrap = "break-word";
  style.top = "0";
  style.left = "-9999px";
  if (computed) {
    for (const property of MIRROR_PROPERTIES) style.setProperty(property, computed.getPropertyValue(property));
  }

  mirror.textContent = element.value.slice(0, offset);
  const marker = doc.createElement("span");
  // A non-empty marker so it has a box even at the very end of the text.
  marker.textContent = element.value.slice(offset) || ".";
  mirror.appendChild(marker);
  doc.body.appendChild(mirror);

  const elementRect = element.getBoundingClientRect();
  const mirrorRect = mirror.getBoundingClientRect();
  const markerRect = marker.getBoundingClientRect();
  const lineHeight = computed ? Number.parseFloat(computed.lineHeight) : 0;
  const height = markerRect.height || (Number.isFinite(lineHeight) ? lineHeight : 16);
  const x = elementRect.left + (markerRect.left - mirrorRect.left) - element.scrollLeft;
  const y = elementRect.top + (markerRect.top - mirrorRect.top) - element.scrollTop;

  doc.body.removeChild(mirror);
  return new DOMRect(x, y, 1, height);
}
