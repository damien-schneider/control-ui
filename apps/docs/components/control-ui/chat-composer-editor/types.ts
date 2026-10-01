import type { NodeSpec, Node as ProseMirrorNode, Schema } from "prosemirror-model";
import type { Command, Plugin } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import type { ReactNode } from "react";

import type { ChatComposerSubmitPayload } from "@/components/control-ui/hooks/use-chat-composer";

// stable for editor's lifetime, so extension never closes over stale view
export type ChatComposerEditorApi = {
  getView: () => EditorView | null;
  subscribe: (listener: () => void) => () => void;
  registerKeyHandler: (handler: (event: KeyboardEvent) => boolean) => () => void;
  /** Merges extra ARIA onto the editable host (e.g. combobox state while a trigger menu is open). */
  setHostAria: (attributes: Readonly<Record<string, string>>) => void;
};

export type ChatComposerEditorOverlayProps = { editor: ChatComposerEditorApi };

// every field optional — mentions are one extension among possible others
export type ChatComposerEditorExtension = {
  // doubles as overlay's React key, so it must be stable and unique
  name: string;
  nodes?: Record<string, NodeSpec>;
  plugins?: (schema: Schema, editor: ChatComposerEditorApi) => Plugin[];
  keymap?: (schema: Schema) => Record<string, Command>;
  submitPayload?: (doc: ProseMirrorNode) => Partial<ChatComposerSubmitPayload>;
  Overlay?: (props: ChatComposerEditorOverlayProps) => ReactNode;
};

export type ChatComposerEditorProps = {
  className?: string;
  placeholder?: string;
  extensions?: readonly ChatComposerEditorExtension[];
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
};
