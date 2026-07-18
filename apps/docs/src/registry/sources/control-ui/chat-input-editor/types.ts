import type { NodeSpec, Node as ProseMirrorNode, Schema } from "prosemirror-model";
import type { Command, Plugin } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import type { ReactNode } from "react";

import type { ChatInputSubmitPayload } from "@/components/control-ui/contracts";

// Runtime handed to every extension: live-view getter, per-transaction subscription (overlays mirror caret/doc state), keydown pre-handler registry (popups swallow arrows/Enter/Esc); stable for editor lifetime.
export type ChatInputEditorApi = {
  getView: () => EditorView | null;
  subscribe: (listener: () => void) => () => void;
  registerKeyHandler: (handler: (event: KeyboardEvent) => boolean) => () => void;
};

export type ChatInputEditorOverlayProps = { editor: ChatInputEditorApi };

// Composable unit of editor behavior; all fields optional — nodes, plugins, keymap, submitPayload extras, Overlay (caret-anchored popup). Mentions are just one such extension.
export type ChatInputEditorExtension = {
  // Stable unique id (used as overlay's React key); convention: feature name, e.g. "mention".
  name: string;
  nodes?: Record<string, NodeSpec>;
  plugins?: (schema: Schema, editor: ChatInputEditorApi) => Plugin[];
  keymap?: (schema: Schema) => Record<string, Command>;
  submitPayload?: (doc: ProseMirrorNode) => Partial<ChatInputSubmitPayload>;
  Overlay?: (props: ChatInputEditorOverlayProps) => ReactNode;
};

// Props for base rich editor (ProseMirror), composes inside <ChatInput>; plain <ChatInputTextarea> still works without it. extensions opts into rich behavior, omit for plain composer.
export type ChatInputEditorProps = {
  className?: string;
  placeholder?: string;
  extensions?: readonly ChatInputEditorExtension[];
};
