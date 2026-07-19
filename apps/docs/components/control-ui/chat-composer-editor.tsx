"use client";

import { baseKeymap, splitBlock } from "prosemirror-commands";
import { history, redo, undo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { EditorState, Plugin } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { useEffect, useRef, useState } from "react";

import { useChatComposerContext } from "@/components/control-ui/chat-composer";
import type { ChatComposerSubmitPayload } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { MESSAGE_GHOST_INHERIT, spawnExitGhost } from "./chat-composer-editor/ghost";
import { createEditorSchema } from "./chat-composer-editor/schema";
import { docFromText, serializeDoc } from "./chat-composer-editor/serialize";
import type { ChatComposerEditorApi, ChatComposerEditorProps } from "./chat-composer-editor/types";

const SUBMIT_KEY = "Enter";

// Bare ProseMirror editor (plain-text paragraphs only); extensions add nodes/plugins/keymap/overlay (e.g. mentionExtension), editor works with none.
// Doc is source of truth: pushes serialized text to chat-composer hook; re-hydrates only on EXTERNAL value changes (clear/prefill), never own keystrokes (would fight caret).
export function ChatComposerEditor({ className, placeholder, extensions = [] }: ChatComposerEditorProps) {
  const input = useChatComposerContext();

  const mountRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const inputRef = useRef(input);
  useEffect(() => {
    inputRef.current = input;
  }, [input]);
  // Editor's own last output; lets reset effect distinguish external value change from own keystroke round-trip.
  const lastSerialized = useRef(input.value);
  const [mounted, setMounted] = useState(false);

  // Per-mount runtime shared by all extensions (plugins + overlays); stable for editor lifetime so extensions never close over stale state.
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
  // Extensions are mount-time config; capture first set so schema/plugins never rebuild mid-life (would tear down live editor).
  const [initialExtensions] = useState(extensions);

  // Mount once; value/extensions/api read through refs so this never needs to re-run.
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
        // First so handleKeyDown wins: lets extension overlays (e.g. open mention menu) consume arrow/Enter/Esc before keymaps below.
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
        // Extension keymaps (e.g. mention Backspace/Delete) before baseKeymap so they win.
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
      attributes: { "aria-label": "Message", "aria-multiline": "true", role: "textbox" },
      dispatchTransaction(transaction) {
        const next = view.state.apply(transaction);
        view.updateState(next);
        if (transaction.docChanged) {
          const text = serializeDoc(next.doc);
          lastSerialized.current = text;
          inputRef.current.setValue(text);
        }
        // Notify overlays on every transaction (selection moves included) so they can mirror caret state.
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

  // Re-hydrate the doc only when the value changes from OUTSIDE the editor (clear/prefill).
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    if (input.value === lastSerialized.current) return;
    // Submit/clear (text→empty): ghost outgoing message so it blurs instead of snapping blank; prefill (edit→non-empty) untouched.
    if (input.value === "" && lastSerialized.current !== "" && view.dom instanceof HTMLElement) {
      spawnExitGhost(view.dom, MESSAGE_GHOST_INHERIT);
    }
    lastSerialized.current = input.value;
    const { schema } = view.state;
    view.updateState(EditorState.create({ schema, doc: docFromText(schema, input.value), plugins: view.state.plugins }));
  }, [input.value]);

  return (
    <div data-control-ui="chat-composer-editor" data-slot="root" className={cn("relative", className)}>
      {input.value === "" && placeholder ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[var(--padding-x)] top-[var(--padding-y)] text-sm leading-6 text-muted-foreground"
        >
          {placeholder}
        </div>
      ) : null}
      <div
        ref={mountRef}
        className={cn(
          "[&_.ProseMirror]:max-h-[40dvh] [&_.ProseMirror]:min-h-16 [&_.ProseMirror]:w-full [&_.ProseMirror]:overflow-y-auto [&_.ProseMirror]:whitespace-pre-wrap [&_.ProseMirror]:break-words [&_.ProseMirror]:px-[var(--padding-x)] [&_.ProseMirror]:py-[var(--padding-y)] [&_.ProseMirror]:text-sm [&_.ProseMirror]:leading-6 [&_.ProseMirror]:outline-none",
          mounted ? "" : "hidden",
        )}
      />
      {/* SSR / pre-hydration fallback so the field is visible before the editor mounts (like ChatGPT). */}
      {mounted ? null : (
        <textarea
          aria-label="Message"
          defaultValue={input.value}
          readOnly
          rows={2}
          placeholder={placeholder}
          className="min-h-16 w-full resize-none bg-transparent px-[var(--padding-x)] py-[var(--padding-y)] text-sm leading-6 outline-none placeholder:text-muted-foreground"
        />
      )}
      {/* Extension overlays (caret-anchored popups) render once the view exists. */}
      {mounted
        ? initialExtensions.map((extension) => (extension.Overlay ? <extension.Overlay key={extension.name} editor={api} /> : null))
        : null}
    </div>
  );
}
