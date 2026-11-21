import { EditorView } from "@codemirror/view";

/** CodeMirror's unlayered base styles beat every cascade layer; `revert-layer` hands each property back to the recipe. */
export const recipeTheme = EditorView.theme({
  "&.cm-focused": { outline: "revert-layer" },
  ".cm-scroller": { fontFamily: "revert-layer", lineHeight: "revert-layer", overflowX: "revert-layer" },
  ".cm-content": { padding: "revert-layer", caretColor: "revert-layer", minHeight: "revert-layer" },
  ".cm-line": { padding: "revert-layer" },
  ".cm-placeholder": { color: "revert-layer" },
});
