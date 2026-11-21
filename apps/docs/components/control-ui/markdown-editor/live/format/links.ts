import { EditorSelection, type EditorState, type SelectionRange, type StateCommand } from "@codemirror/state";
import type { SyntaxNode } from "@lezer/common";
import type { MarkdownMention, MarkdownTextRange } from "../../engine";
import { enclosingNode, insideCode, mapInward } from "./inline";

type LinkNode = { link: SyntaxNode; url: SyntaxNode };

const escapeText = (text: string) => text.replace(/[[\]\\]/g, "\\$&");

function escapeUrl(href: string): string {
  if (/\s/.test(href)) return `<${href.replace(/[<>]/g, "\\$&")}>`;
  return href.replace(/[()<>]/g, "\\$&");
}

function unescapeUrl(url: string): string {
  const bare = url.startsWith("<") && url.endsWith(">") ? url.slice(1, -1) : url;
  return bare.replace(/\\([!-/:-@[-`{-~])/g, "$1");
}

function linkAround(state: EditorState, range: SelectionRange): LinkNode | null {
  const link = enclosingNode(state, range, "Link");
  const url = link?.getChild("URL");
  return link && url ? { link, url } : null;
}

export function linkAt(state: EditorState): { from: number; to: number; href: string } | null {
  const found = linkAround(state, state.selection.main);
  if (!found) return null;
  return { from: found.link.from, to: found.link.to, href: unescapeUrl(state.sliceDoc(found.url.from, found.url.to)) };
}

function unlink(state: EditorState, range: SelectionRange) {
  const found = linkAround(state, range);
  const [open, close] = found?.link.getChildren("LinkMark") ?? [];
  if (!found || !open || !close) return { range };
  return mapInward(
    state,
    [
      { from: found.link.from, to: open.to },
      { from: close.from, to: found.link.to },
    ],
    range,
  );
}

function linkRange(state: EditorState, range: SelectionRange, href: string) {
  const found = linkAround(state, range);
  const url = escapeUrl(href);
  if (found) return { changes: { from: found.url.from, to: found.url.to, insert: url }, range };
  if (insideCode(state, range.from)) return { range };
  if (range.empty) {
    const insert = `[${escapeText(href)}](${url})`;
    return { changes: { from: range.from, insert }, range: EditorSelection.cursor(range.from + insert.length) };
  }
  return {
    changes: [
      { from: range.from, insert: "[" },
      { from: range.to, insert: `](${url})` },
    ],
    range: EditorSelection.range(range.anchor + 1, range.head + 1),
  };
}

export function setLink(href: string | null): StateCommand {
  return ({ state, dispatch }) => {
    if (state.readOnly) return false;
    const target = href?.trim() ? href.trim() : null;
    const update = state.changeByRange((range) => (target ? linkRange(state, range, target) : unlink(state, range)));
    dispatch(state.update(update, { scrollIntoView: true, userEvent: "input.format" }));
    return true;
  };
}

export function imageMarkdown(image: { src: string; alt: string; title?: string }): string {
  const title = image.title ? ` "${image.title.replace(/["\\]/g, "\\$&")}"` : "";
  return `![${escapeText(image.alt)}](${escapeUrl(image.src)}${title})`;
}

export function insertImage(image: { src: string; alt: string }): StateCommand {
  return ({ state, dispatch }) => {
    if (state.readOnly) return false;
    const insert = imageMarkdown(image);
    const update = state.changeByRange((range) => ({
      changes: { from: range.from, to: range.to, insert },
      range: EditorSelection.cursor(range.from + insert.length),
    }));
    dispatch(state.update(update, { scrollIntoView: true, userEvent: "input.format" }));
    return true;
  };
}

export function replaceWithMention(range: MarkdownTextRange, mention: MarkdownMention): StateCommand {
  return ({ state, dispatch }) => {
    if (state.readOnly) return false;
    const insert = `[@${escapeText(mention.label)}](${escapeUrl(mention.href)}) `;
    dispatch(
      state.update({
        changes: { from: range.from, to: range.to, insert },
        selection: EditorSelection.cursor(range.from + insert.length),
        scrollIntoView: true,
        userEvent: "input.type",
      }),
    );
    return true;
  };
}
