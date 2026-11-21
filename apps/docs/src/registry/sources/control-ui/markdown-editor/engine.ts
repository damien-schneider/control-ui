import type { DragPreview } from "./drag/drag-preview";
import type { MarkdownImage } from "./uploads";

export type MarkdownMark = "bold" | "italic" | "strike" | "code";
export type MarkdownBlockType = "bulletList" | "orderedList" | "taskList" | "blockquote" | "codeBlock";
export type MarkdownHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export const markdownHeadingLevels: readonly MarkdownHeadingLevel[] = [1, 2, 3, 4, 5, 6];

export type MarkdownBlockCommand =
  | { type: "paragraph" }
  | { type: "heading"; level: MarkdownHeadingLevel }
  | { type: MarkdownBlockType }
  | { type: "horizontalRule" }
  | { type: "table" };

export type MarkdownTextRange = { from: number; to: number };
export type MarkdownMention = { label: string; href: string };

export type MarkdownEditorSnapshot = {
  marks: Readonly<Record<MarkdownMark, boolean>>;
  blocks: Readonly<Record<MarkdownBlockType, boolean>>;
  heading: MarkdownHeadingLevel | null;
  link: string | null;
  canUndo: boolean;
  canRedo: boolean;
  focused: boolean;
  /** A non-blank text selection outside code: what the bubble menu formats. */
  formattable: boolean;
  inlineOnly: boolean;
  isEmpty: boolean;
  /** The document holds Markdown this engine would lose, so only its source can be edited. */
  sourceRequired: boolean;
};

export type MarkdownTextBeforeCaret = { text: string; from: number; to: number };

export type MarkdownBlockDrag = { preview: DragPreview | null; origin: DOMRect };

/** A block is addressed by the document position it starts at; the deepest list item is its own block. Never moves focus. */
export type MarkdownBlocks = {
  at: (point: { x: number; y: number }) => number | null;
  atSelection: () => number | null;
  rect: (block: number) => DOMRect | null;
  select: (block: number) => void;
  /** Swaps the block with its neighbour, selects it, and returns where it now starts. */
  move: (block: number, direction: -1 | 1) => number | null;
  /** Called on pointer down so the first drag frame does no serialization work. */
  prepareDrag: (block: number) => void;
  startDrag: (block: number, transfer: DataTransfer) => MarkdownBlockDrag | null;
  endDrag: () => void;
};

export type MarkdownTableAxis = "row" | "column";
export type MarkdownColumnAlign = "left" | "center" | "right";
export type MarkdownTableTarget = { table: HTMLTableElement; row: number; column: number };

/** The header is row 0 and never moves; `select` and `move` keep focus on their caller, the edits focus the editor. */
export type MarkdownTables = {
  caret: () => MarkdownTableTarget | null;
  select: (table: HTMLTableElement, axis: MarkdownTableAxis, index: number) => void;
  move: (table: HTMLTableElement, axis: MarkdownTableAxis, from: number, to: number) => boolean;
  insert: (table: HTMLTableElement, axis: MarkdownTableAxis, index: number, side: "before" | "after") => void;
  remove: (table: HTMLTableElement, axis: MarkdownTableAxis, index: number) => void;
  align: (table: HTMLTableElement, column: number, align: MarkdownColumnAlign) => void;
  /** Adds a last row or column and puts the caret in its first new cell. */
  append: (table: HTMLTableElement, axis: MarkdownTableAxis) => void;
};

/** Upload placeholders live beside the Markdown, never in it, until their image arrives. */
export type MarkdownUploadPlaceholders = {
  insert: (id: string, name: string, at?: number) => void;
  complete: (id: string, image: Required<Pick<MarkdownImage, "url" | "alt">> & Pick<MarkdownImage, "title">) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
};

/** Parts reach editors only through this contract, so every part works with every alternative; commands focus the editor first. */
export type MarkdownEditorEngine = {
  readonly element: HTMLElement;
  readonly sourceView: "editor" | "textarea";
  /** Calls the listener after every document, selection, focus or editability change. */
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => MarkdownEditorSnapshot;
  /** Runs for document changes the user makes, never for `setMarkdown`. */
  onChange: (listener: (markdown: string) => void) => () => void;
  getMarkdown: () => string;
  /** Replaces the document from outside and starts a fresh undo history; does nothing when the Markdown is already current. */
  setMarkdown: (markdown: string) => void;
  setEditable: (editable: boolean) => void;
  focus: () => void;
  undo: () => void;
  redo: () => void;
  toggleMark: (mark: MarkdownMark) => void;
  toggleBlock: (block: MarkdownBlockType) => void;
  setHeading: (level: MarkdownHeadingLevel | null) => void;
  setLink: (href: string | null) => void;
  insertImage: (image: { src: string; alt: string }) => void;
  selectionRect: () => DOMRect | null;
  /** Null wherever a trigger cannot start: unfocused, a selection, code, or a link. */
  textBeforeCaret: () => MarkdownTextBeforeCaret | null;
  caretRect: () => DOMRect | null;
  replaceWithBlock: (range: MarkdownTextRange, block: MarkdownBlockCommand) => void;
  replaceWithMention: (range: MarkdownTextRange, mention: MarkdownMention) => void;
  positionAt: (point: { x: number; y: number }) => number | null;
  readonly uploads: MarkdownUploadPlaceholders;
  readonly blocks: MarkdownBlocks;
  readonly tables: MarkdownTables;
};
