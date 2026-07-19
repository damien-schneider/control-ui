import type { NodeSpec, Node as ProseMirrorNode, Schema } from "prosemirror-model";
import type { Command, Plugin } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import type { ReactNode } from "react";

import type { ChatComposerSubmitPayload } from "@/components/control-ui/contracts";

// Runtime handed to every extension: live-view getter, per-transaction subscription (overlays mirror caret/doc state), keydown pre-handler registry (popups swallow arrows/Enter/Esc); stable for editor lifetime.
export type ChatComposerEditorApi = {
  getView: () => EditorView | null;
  subscribe: (listener: () => void) => () => void;
  registerKeyHandler: (handler: (event: KeyboardEvent) => boolean) => () => void;
};

export type ChatComposerEditorOverlayProps = { editor: ChatComposerEditorApi };

// Composable unit of editor behavior; all fields optional — nodes, plugins, keymap, submitPayload extras, Overlay (caret-anchored popup). Mentions are just one such extension.
export type ChatComposerEditorExtension = {
  // Stable unique id (used as overlay's React key); convention: feature name, e.g. "mention".
  name: string;
  nodes?: Record<string, NodeSpec>;
  plugins?: (schema: Schema, editor: ChatComposerEditorApi) => Plugin[];
  keymap?: (schema: Schema) => Record<string, Command>;
  submitPayload?: (doc: ProseMirrorNode) => Partial<ChatComposerSubmitPayload>;
  Overlay?: (props: ChatComposerEditorOverlayProps) => ReactNode;
};

// Props for base rich editor (ProseMirror), composes inside <ChatComposer>; plain <ChatComposerTextarea> still works without it. extensions opts into rich behavior, omit for plain composer.
export type ChatComposerEditorProps = {
  className?: string;
  placeholder?: string;
  extensions?: readonly ChatComposerEditorExtension[];
};
