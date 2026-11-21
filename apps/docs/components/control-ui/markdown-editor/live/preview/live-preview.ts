import { syntaxTree } from "@codemirror/language";
import { type EditorState, Facet, type Range, type SelectionRange } from "@codemirror/state";
import { Decoration, type DecorationSet, type EditorView, ViewPlugin, type ViewUpdate } from "@codemirror/view";
import type { SyntaxNode } from "@lezer/common";
import { markdownHeadingAttributes } from "@/components/control-ui/ui/markdown-heading";
import { markdownHeadingLevels } from "../../engine";
import { type MarkdownUrlPolicy, persistentUrlPolicy } from "../../url-policy";
import { BulletWidget, ImageWidget, TaskWidget } from "./widgets";

type Span = { from: number; to: number };
type Preview = {
  state: EditorState;
  selection: readonly SelectionRange[];
  visible: Span;
  decorations: Range<Decoration>[];
  codeSpans: Span[];
};
/** Returning false skips the node's children. */
type Decorate = (preview: Preview, node: SyntaxNode) => false | undefined;

export const markdownUrlPolicy = Facet.define<MarkdownUrlPolicy, MarkdownUrlPolicy>({
  combine: (policies) => policies[0] ?? persistentUrlPolicy,
});

const hidden = Decoration.replace({});
const bullet = Decoration.replace({ widget: new BulletWidget() });
const link = Decoration.mark({ tagName: "a" });
const lineClasses = new Map<string, Decoration>();

function lineClass(className: string) {
  let decoration = lineClasses.get(className);
  if (!decoration) {
    decoration = Decoration.line({ class: className });
    lineClasses.set(className, decoration);
  }
  return decoration;
}

/** Inline markup shows while the selection touches its span, edges included. */
const touches = (selection: readonly SelectionRange[], span: Span) =>
  selection.some((range) => range.from <= span.to && range.to >= span.from);

/** A block prefix shows while the selection is inside it; a caret right after it, where the text starts, keeps it rendered. */
const insidePrefix = (selection: readonly SelectionRange[], span: Span) =>
  selection.some((range) => range.from < span.to && range.to >= span.from);

const leadingBlanks = (text: string) => text.length - text.trimStart().length;
const lineOf = (preview: Preview, pos: number) => preview.state.doc.lineAt(pos);

function hide(preview: Preview, span: Span, decoration = hidden) {
  if (span.from < span.to) preview.decorations.push(decoration.range(span.from, span.to));
}

function decorateLines(preview: Preview, block: Span, className: string) {
  const { doc } = preview.state;
  const first = doc.lineAt(Math.max(block.from, preview.visible.from));
  const last = doc.lineAt(Math.min(block.to, preview.visible.to));
  for (let number = first.number; number <= last.number; number++) {
    preview.decorations.push(lineClass(className).range(doc.line(number).from));
  }
}

const decorateCode: Decorate = (preview, node) => {
  const { state, selection } = preview;
  preview.codeSpans.push(node);
  decorateLines(preview, node, "cm-md-code-line");
  preview.decorations.push(lineClass("cm-md-code-start").range(lineOf(preview, node.from).from));
  preview.decorations.push(lineClass("cm-md-code-end").range(lineOf(preview, node.to).from));
  if (node.name === "FencedCode" && !touches(selection, node)) {
    for (const fence of node.getChildren("CodeMark")) {
      const line = state.doc.lineAt(fence.from);
      hide(preview, line);
      preview.decorations.push(lineClass("cm-md-fence").range(line.from));
    }
  }
  return false;
};

function headingLine(level: number) {
  const heading = markdownHeadingLevels.find((candidate) => candidate === level);
  return heading
    ? Decoration.line({ class: markdownHeadingAttributes(heading).class, attributes: { "data-heading": String(heading) } })
    : null;
}

function decorateHeading(level: number, setext: boolean): Decorate {
  const decoration = headingLine(level);
  return (preview, node) => {
    const { doc } = preview.state;
    const first = doc.lineAt(node.from).number;
    const last = setext ? doc.lineAt(node.to).number - 1 : first;
    for (let number = first; number <= last; number++) {
      if (decoration) preview.decorations.push(decoration.range(doc.line(number).from));
    }
    return undefined;
  };
}

const decorateHeaderMark: Decorate = (preview, node) => {
  const { state, selection } = preview;
  const heading = node.parent;
  const line = lineOf(preview, node.from);
  if (!heading?.name.startsWith("ATXHeading")) {
    if (!touches(selection, line)) hide(preview, line);
    return undefined;
  }
  if (node.from === heading.from) {
    const span = { from: node.from, to: node.to + leadingBlanks(state.sliceDoc(node.to, line.to)) };
    if (!insidePrefix(selection, { from: line.from, to: span.to })) hide(preview, span);
    return undefined;
  }
  const before = state.sliceDoc(line.from, node.from);
  const span = { from: node.from - (before.length - before.trimEnd().length), to: node.to };
  if (!touches(selection, span)) hide(preview, span);
  return undefined;
};

const decorateQuoteMark: Decorate = (preview, node) => {
  const line = lineOf(preview, node.from);
  const span = { from: node.from, to: node.to + Math.min(1, leadingBlanks(preview.state.sliceDoc(node.to, line.to))) };
  if (!insidePrefix(preview.selection, span)) hide(preview, span);
  return undefined;
};

const decorateListMark: Decorate = (preview, node) => {
  const item = node.parent;
  if (item?.parent?.name !== "BulletList") return undefined;
  const task = item.getChild("Task")?.getChild("TaskMarker");
  if (insidePrefix(preview.selection, { from: node.from, to: (task ?? node).to + 1 })) return undefined;
  if (task) hide(preview, { from: node.from, to: task.from });
  else hide(preview, node, bullet);
  return undefined;
};

const decorateTaskMarker: Decorate = (preview, node) => {
  const { state, selection } = preview;
  const line = lineOf(preview, node.from);
  if (insidePrefix(selection, { from: line.from, to: node.to + 1 })) return undefined;
  const checked = state.sliceDoc(node.from + 1, node.to - 1).toLowerCase() === "x";
  const label = state.sliceDoc(node.to, line.to).trim();
  hide(preview, node, Decoration.replace({ widget: new TaskWidget(checked, label) }));
  return undefined;
};

function inlineMark(tagName: string): Decorate {
  const decoration = Decoration.mark({ tagName });
  return (preview, node) => {
    preview.decorations.push(decoration.range(node.from, node.to));
    return undefined;
  };
}

const decorateInlineMarkup: Decorate = (preview, node) => {
  const owner = node.parent;
  if (owner && !touches(preview.selection, owner)) hide(preview, node);
  return undefined;
};

const decorateLink: Decorate = (preview, node) => {
  const [open, close] = node.getChildren("LinkMark");
  if (!(open && close && node.getChild("URL"))) return undefined;
  if (open.to < close.from) preview.decorations.push(link.range(open.to, close.from));
  if (touches(preview.selection, node)) return undefined;
  hide(preview, open);
  hide(preview, { from: close.from, to: node.to });
  return undefined;
};

const decorateAutolink: Decorate = (preview, node) => {
  const url = node.getChild("URL");
  if (url) preview.decorations.push(link.range(url.from, url.to));
  if (!touches(preview.selection, node)) for (const mark of node.getChildren("LinkMark")) hide(preview, mark);
  return false;
};

function imageDecoration(state: EditorState, image: SyntaxNode) {
  const [open, close] = image.getChildren("LinkMark");
  const url = image.getChild("URL");
  if (!(open && close && url)) return null;
  const raw = state.sliceDoc(url.from, url.to);
  const src = raw.startsWith("<") && raw.endsWith(">") ? raw.slice(1, -1) : raw;
  if (!state.facet(markdownUrlPolicy)(src, "image")) return null;
  const title = image.getChild("LinkTitle");
  const alt = state.sliceDoc(open.to, close.from);
  return Decoration.replace({ widget: new ImageWidget(src, alt, title ? state.sliceDoc(title.from + 1, title.to - 1) : "") });
}

const decorateImage: Decorate = (preview, node) => {
  const decoration = touches(preview.selection, node) ? null : imageDecoration(preview.state, node);
  if (decoration) hide(preview, node, decoration);
  return false;
};

const decorateRule: Decorate = (preview, node) => {
  const line = lineOf(preview, node.from);
  if (touches(preview.selection, line)) return undefined;
  hide(preview, node);
  preview.decorations.push(lineClass("cm-md-rule-line").range(line.from));
  return undefined;
};

const decorators: Record<string, Decorate> = {
  Table: () => false,
  FencedCode: decorateCode,
  CodeBlock: decorateCode,
  Blockquote: (preview, node) => {
    decorateLines(preview, node, "cm-md-quote-line");
    return undefined;
  },
  HorizontalRule: decorateRule,
  Image: decorateImage,
  Link: decorateLink,
  Autolink: decorateAutolink,
  URL: (preview, node) => {
    if (node.parent?.name === "Paragraph") preview.decorations.push(link.range(node.from, node.to));
    return undefined;
  },
  Escape: (preview, node) => {
    if (!touches(preview.selection, node)) hide(preview, { from: node.from, to: node.from + 1 });
    return undefined;
  },
  HeaderMark: decorateHeaderMark,
  QuoteMark: decorateQuoteMark,
  ListMark: decorateListMark,
  TaskMarker: decorateTaskMarker,
  Emphasis: inlineMark("em"),
  StrongEmphasis: inlineMark("strong"),
  Strikethrough: inlineMark("s"),
  InlineCode: inlineMark("code"),
  EmphasisMark: decorateInlineMarkup,
  StrikethroughMark: decorateInlineMarkup,
  CodeMark: decorateInlineMarkup,
  ...Object.fromEntries(markdownHeadingLevels.map((level) => [`ATXHeading${level}`, decorateHeading(level, false)])),
  SetextHeading1: decorateHeading(1, true),
  SetextHeading2: decorateHeading(2, true),
};

/** Blank lines between blocks shrink to the block gap, except the caret's line and lines inside code. */
function decorateBlankLines(preview: Preview) {
  const { doc, selection } = preview.state;
  if (doc.lines < 2) return;
  const caretLine = doc.lineAt(selection.main.head).number;
  for (let pos = preview.visible.from; pos <= preview.visible.to; ) {
    const line = doc.lineAt(pos);
    const inCode = preview.codeSpans.some((span) => span.from <= line.from && line.to <= span.to);
    if (line.number !== caretLine && !inCode && line.text.trim() === "")
      preview.decorations.push(lineClass("cm-md-blank").range(line.from));
    pos = line.to + 1;
  }
}

function previewDecorations(view: EditorView): DecorationSet {
  const decorations: Range<Decoration>[] = [];
  const selection = view.hasFocus ? view.state.selection.ranges : [];
  for (const visible of view.visibleRanges) {
    const preview: Preview = { state: view.state, selection, visible, decorations, codeSpans: [] };
    syntaxTree(view.state).iterate({
      from: visible.from,
      to: visible.to,
      enter: (ref) => decorators[ref.name]?.(preview, ref.node),
    });
    decorateBlankLines(preview);
  }
  return Decoration.set(decorations, true);
}

export const livePreview = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = previewDecorations(view);
    }

    update(update: ViewUpdate) {
      const treeChanged = syntaxTree(update.startState) !== syntaxTree(update.state);
      if (update.docChanged || update.selectionSet || update.focusChanged || update.viewportChanged || treeChanged) {
        this.decorations = previewDecorations(update.view);
      }
    }
  },
  { decorations: (plugin) => plugin.decorations },
);
