import { history, historyKeymap } from "@codemirror/commands";
import { markdownKeymap, markdownLanguage, pasteURLAsLink } from "@codemirror/lang-markdown";
import { Compartment, EditorState, type Extension, Prec, type StateCommand, type StateEffect } from "@codemirror/state";
import { EditorView, keymap, placeholder } from "@codemirror/view";
import type { MarkdownUrlPolicy } from "../url-policy";
import { blockDragging } from "./drag/block-drag";
import { insideCode } from "./format/inline";
import { editingKeymap, markdownFormatKeymap } from "./format/keymap";
import { indentListItem } from "./format/list-indent";
import { livePreview, markdownUrlPolicy } from "./preview/live-preview";
import { recipeTheme } from "./preview/recipe-theme";
import { type TaskCheckboxes, taskCheckboxes } from "./preview/widgets";
import { liveTables } from "./table/live-tables";
import { uploadPlaceholders } from "./upload-placeholders";

/** `preview` off shows the Markdown source in the same editor. */
export type LiveSettings = {
  editable: boolean;
  preview: boolean;
  attributes: Record<string, string>;
  placeholder: string;
};

export type LiveServices = {
  isUrlAllowed: MarkdownUrlPolicy;
  tasks: TaskCheckboxes;
  onUpdate: Extension;
  extensions: Extension;
};

const editableSetting = new Compartment();
const previewSetting = new Compartment();
const contentSetting = new Compartment();

const editability = (editable: boolean) => [EditorView.editable.of(editable), EditorState.readOnly.of(!editable)];
const previewing = (preview: boolean) => (preview ? [livePreview, liveTables] : []);
const describing = ({ attributes, placeholder: text }: LiveSettings) => [
  EditorView.contentAttributes.of(attributes),
  text ? placeholder(text) : [],
];

/** Enter ends a paragraph or heading with a blank line, as a rich editor starts a new paragraph. */
const paragraphBreak: StateCommand = ({ state, dispatch }) => {
  const { main } = state.selection;
  if (state.selection.ranges.length > 1 || state.doc.lineAt(main.head).text.trim() === "" || insideCode(state, main.head)) return false;
  dispatch(state.update(state.replaceSelection("\n\n"), { scrollIntoView: true, userEvent: "input" }));
  return true;
};

const structureKeymap = Prec.high(
  keymap.of([
    ...markdownKeymap,
    { key: "Enter", run: paragraphBreak },
    { key: "Tab", run: indentListItem(1) },
    { key: "Shift-Tab", run: indentListItem(-1) },
  ]),
);

export function liveSetup(settings: LiveSettings, services: LiveServices): Extension {
  return [
    markdownLanguage.extension,
    pasteURLAsLink,
    history(),
    structureKeymap,
    markdownFormatKeymap,
    keymap.of(historyKeymap),
    editingKeymap,
    recipeTheme,
    EditorView.lineWrapping,
    blockDragging,
    uploadPlaceholders,
    markdownUrlPolicy.of(services.isUrlAllowed),
    taskCheckboxes.of(services.tasks),
    services.onUpdate,
    editableSetting.of(editability(settings.editable)),
    previewSetting.of(previewing(settings.preview)),
    contentSetting.of(describing(settings)),
    services.extensions,
  ];
}

export function reconfigureLive(previous: LiveSettings, next: LiveSettings): StateEffect<unknown>[] {
  const effects: StateEffect<unknown>[] = [];
  if (previous.editable !== next.editable) effects.push(editableSetting.reconfigure(editability(next.editable)));
  if (previous.preview !== next.preview) effects.push(previewSetting.reconfigure(previewing(next.preview)));
  if (previous.attributes !== next.attributes || previous.placeholder !== next.placeholder) {
    effects.push(contentSetting.reconfigure(describing(next)));
  }
  return effects;
}
