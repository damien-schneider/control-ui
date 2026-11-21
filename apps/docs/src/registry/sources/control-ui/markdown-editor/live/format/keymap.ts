import { defaultKeymap } from "@codemirror/commands";
import { type Extension, Prec } from "@codemirror/state";
import { type KeyBinding, keymap } from "@codemirror/view";
import { markdownHeadingLevels } from "../../engine";
import { setHeading, toggleBlock } from "./blocks";
import { toggleMark } from "./inline";

/** CodeMirror's defaults, minus Mod-Enter: hosts use it to send what was written. */
export const editingKeymap: Extension = keymap.of(defaultKeymap.filter((binding) => binding.key !== "Mod-Enter"));

const markBindings: readonly KeyBinding[] = [
  { key: "Mod-b", run: toggleMark("bold") },
  { key: "Mod-i", run: toggleMark("italic") },
  { key: "Mod-Shift-s", run: toggleMark("strike") },
  { key: "Mod-e", run: toggleMark("code") },
];

export const markdownMarkKeymap: Extension = Prec.high(keymap.of(markBindings));

export const markdownFormatKeymap: Extension = Prec.high(
  keymap.of([
    ...markBindings,
    { key: "Mod-Alt-0", run: setHeading(null) },
    ...markdownHeadingLevels.map((level) => ({ key: `Mod-Alt-${level}`, run: setHeading(level) })),
    { key: "Mod-Shift-7", run: toggleBlock("orderedList") },
    { key: "Mod-Shift-8", run: toggleBlock("bulletList") },
    { key: "Mod-Shift-9", run: toggleBlock("taskList") },
    { key: "Mod-Shift-b", run: toggleBlock("blockquote") },
    { key: "Mod-Alt-c", run: toggleBlock("codeBlock") },
  ]),
);
