"use client";

import { baseKeymap, splitBlock } from "prosemirror-commands";
import { history, redo, undo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { EditorState, Plugin } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { type CSSProperties, useEffect, useRef, useState } from "react";

import { useChatComposerContext } from "@/components/control-ui/chat-composer";
import type { ChatComposerSubmitPayload } from "@/components/control-ui/hooks/use-chat-composer";
import type { ChatComposerKnobStyle } from "@/components/control-ui/knob-contracts/chat-composer-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { MESSAGE_GHOST_INHERIT, spawnExitGhost } from "./chat-composer-editor/ghost";
import { createEditorSchema } from "./chat-composer-editor/schema";
import { docFromText, serializeDoc } from "./chat-composer-editor/serialize";
import type { ChatComposerEditorApi, ChatComposerEditorProps } from "./chat-composer-editor/types";

const SUBMIT_KEY = "Enter";

export function ChatComposerEditor({
  className,
  placeholder,
  style,
  extensions = [],
}: ChatComposerEditorProps & { style?: CSSProperties & ChatComposerKnobStyle }) {
  const input = useChatComposerContext();

  const mountRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const inputRef = useRef(input);
  useEffect(() => {
    inputRef.current = input;
  }, [input]);
  const lastSerialized = useRef(input.value);
  const [mounted, setMounted] = useState(false);

  const listenersRef = useRef(new Set<() => void>());
  const keyHandlersRef = useRef(new Set<(event: KeyboardEvent) => boolean>());
  const [api] = useState<ChatComposerEditorApi>(() => ({
    getView: () => viewRef.current,
    subscribe: (listener) => {
      listenersRef.current.add(listener);
      return () => {
        listenersRef.current.delete(listener);
      };
    },
    registerKeyHandler: (handler) => {
      keyHandlersRef.current.add(handler);
      return () => {
        keyHandlersRef.current.delete(handler);
      };
    },
  }));
  const [initialExtensions] = useState(extensions);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const exts = initialExtensions;
    const schema = createEditorSchema(exts);

    const extensionKeymap: Record<string, (typeof baseKeymap)[string]> = {};
    for (const extension of exts) Object.assign(extensionKeymap, extension.keymap?.(schema) ?? {});
    const extensionPlugins = exts.flatMap((extension) => extension.plugins?.(schema, api) ?? []);
    const submitMessage = (editorState: EditorState) => {
      const extra: Partial<ChatComposerSubmitPayload> = {};
      for (const extension of exts) Object.assign(extra, extension.submitPayload?.(editorState.doc) ?? {});
      inputRef.current.submit(extra);
      return true;
    };

    const state = EditorState.create({
      schema,
      doc: docFromText(schema, inputRef.current.value),
      plugins: [
        new Plugin({
          props: {
            handleKeyDown: (_view, event) => {
              for (const handler of keyHandlersRef.current) if (handler(event)) return true;
              return false;
            },
          },
        }),
        ...extensionPlugins,
        history(),
        keymap(extensionKeymap),
        keymap({
          "Mod-z": undo,
          "Mod-y": redo,
          "Shift-Mod-z": redo,
          "Shift-Enter": splitBlock,
          [SUBMIT_KEY]: submitMessage,
        }),
        keymap(baseKeymap),
      ],
    });
    const view = new EditorView(mount, {
      state,
      editable: () => !inputRef.current.isDisabled,
      attributes: { "aria-label": "Message", "aria-multiline": "true", role: "textbox" },
      dispatchTransaction(transaction) {
        const next = view.state.apply(transaction);
        view.updateState(next);
        if (transaction.docChanged) {
          const text = serializeDoc(next.doc);
          lastSerialized.current = text;
          inputRef.current.setValue(text);
        }
        for (const listener of listenersRef.current) listener();
      },
    });
    viewRef.current = view;
    setMounted(true);
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [api, initialExtensions]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    if (input.value === lastSerialized.current) return;
    if (input.value === "" && lastSerialized.current !== "" && view.dom instanceof HTMLElement) {
      spawnExitGhost(view.dom, MESSAGE_GHOST_INHERIT);
    }
    lastSerialized.current = input.value;
    const { schema } = view.state;
    view.updateState(EditorState.create({ schema, doc: docFromText(schema, input.value), plugins: view.state.plugins }));
  }, [input.value]);

  useEffect(() => {
    viewRef.current?.setProps({
      editable: () => !input.isDisabled,
      attributes: { "aria-label": "Message", "aria-multiline": "true", "aria-disabled": String(input.isDisabled), role: "textbox" },
    });
  }, [input.isDisabled]);

  return (
    <div
      data-control-ui="chat-composer-editor"
      data-control-family="chat-composer"
      data-slot="editor-root"
      style={style}
      className={cn("relative", className)}
    >
      {input.value === "" && placeholder ? (
        <div
          aria-hidden="true"
          data-control-ui="chat-composer-editor"
          data-control-family="chat-composer"
          data-slot="placeholder"
          className="pointer-events-none absolute left-[var(--padding-x)] top-[var(--padding-y)]"
        >
          {placeholder}
        </div>
      ) : null}
      <div
        ref={mountRef}
        data-control-ui="chat-composer-editor"
        data-control-family="chat-composer"
        data-slot="editor"
        className={cn(
          "[&_.ProseMirror]:max-h-[40dvh] [&_.ProseMirror]:min-h-16 [&_.ProseMirror]:w-full [&_.ProseMirror]:overflow-y-auto [&_.ProseMirror]:outline-none [&_.ProseMirror]:whitespace-pre-wrap [&_.ProseMirror]:break-words [&_.ProseMirror]:px-[var(--padding-x)] [&_.ProseMirror]:py-[var(--padding-y)]",
          mounted ? "" : "hidden",
        )}
      />
      {mounted ? null : (
        <textarea
          data-control-ui="chat-composer-editor"
          data-control-family="chat-composer"
          data-slot="fallback"
          aria-label="Message"
          defaultValue={input.value}
          readOnly
          disabled={input.isDisabled}
          rows={2}
          placeholder={placeholder}
          className="min-h-16 w-full resize-none outline-none px-[var(--padding-x)] py-[var(--padding-y)]"
        />
      )}
      {mounted
        ? initialExtensions.map((extension) => (extension.Overlay ? <extension.Overlay key={extension.name} editor={api} /> : null))
        : null}
    </div>
  );
}
