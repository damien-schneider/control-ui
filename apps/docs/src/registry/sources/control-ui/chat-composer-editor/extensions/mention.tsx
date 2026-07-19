"use client";

import type { DOMOutputSpec, NodeSpec, Node as ProseMirrorNode } from "prosemirror-model";
import type { Command } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import { useEffect } from "react";
import type { MentionItem, TriggerConfig, TriggerMenuItemData } from "@/components/control-ui/contracts";
import { useTriggerMenu } from "@/components/control-ui/hooks/use-trigger-menu";
import { cn } from "@/components/control-ui/lib/cn";
import { detectTrigger } from "@/components/control-ui/lib/trigger-detect";
import { skinSlot } from "@/components/control-ui/skin";
import { TriggerMenu, TriggerMenuEmpty, TriggerMenuIcon, TriggerMenuItem, TriggerMenuList } from "@/components/control-ui/ui/trigger-menu";
import { spawnExitGhost } from "../ghost";
import type { ChatComposerEditorApi, ChatComposerEditorExtension } from "../types";

// Mention extension: "@" pill as one composable unit via mentionExtension({ triggers }) — inline atom node, Backspace/Delete commands, doc→mentions submit extras, caret-anchored popup via trigger-menu engine.
// Base editor stays mention-free.

// PM types attrs as `any`; read each through a typeof guard so we never assert a cast (repo convention).
function attrString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

// Pill node: atom + contenteditable=false = non-editable unit (arrows skip it); leafText serializes to "@label"; styled via chat-composer-mention slot (skin-swappable).
const mentionNode: NodeSpec = {
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  draggable: false,
  attrs: {
    id: { default: "" },
    label: { default: "" },
    kind: { default: "mention" },
    icon: { default: null },
  },
  parseDOM: [
    {
      tag: "span[data-mention]",
      getAttrs: (dom) => {
        if (typeof dom === "string") return false;
        return {
          id: dom.getAttribute("data-id") ?? "",
          label: dom.textContent ?? "",
          kind: dom.getAttribute("data-mention") ?? "mention",
          icon: dom.getAttribute("data-icon"),
        };
      },
    },
  ],
  toDOM: (node): DOMOutputSpec => {
    const label = attrString(node.attrs.label, "");
    const id = attrString(node.attrs.id, "");
    const kind = attrString(node.attrs.kind, "mention");
    const icon = typeof node.attrs.icon === "string" ? node.attrs.icon : null;
    const attrs = {
      class: cn(
        "inline-flex items-center gap-1 rounded-[var(--radius-popup-item)] bg-primary/10 px-1 align-baseline font-medium text-primary-text",
        skinSlot("chat-composer", "mention", {}),
      ),
      "data-control-ui": "chat-composer",
      "data-slot": "mention",
      "data-mention": kind,
      "data-id": id,
      "data-icon": icon ?? "",
      contenteditable: "false",
    };
    const labelSpan: DOMOutputSpec = ["span", { class: "truncate" }, label];
    return icon === null
      ? ["span", attrs, labelSpan]
      : ["span", attrs, ["img", { src: icon, alt: "", class: "size-4 shrink-0 rounded-[3px]" }], labelSpan];
  },
  leafText: (node) => `@${attrString(node.attrs.label, "")}`,
};

// --- caret trigger reading -----------------------------------------------------------------------

type EditorTriggerState = {
  active: boolean;
  from: number;
  to: number;
  char: string;
  query: string;
  rect: DOMRect | null;
};

const INACTIVE: EditorTriggerState = { active: false, from: 0, to: 0, char: "", query: "", rect: null };

// Reads live trigger at caret off current view (positions never stale); called from overlay on every transaction and its keydown handler.
function readEditorTrigger(view: EditorView, triggerChars: readonly string[]): EditorTriggerState {
  const { selection } = view.state;
  if (!selection.empty) return INACTIVE;
  const { $from } = selection;
  if (!$from.parent.isTextblock) return INACTIVE;
  const start = $from.start();
  // Atoms collapse to one sentinel char so detectTrigger's string offsets map 1:1 onto doc positions.
  const textBefore = view.state.doc.textBetween(start, $from.pos, undefined, () => "￼");
  const match = detectTrigger(textBefore, triggerChars);
  if (match === null) return INACTIVE;
  const coords = view.coordsAtPos($from.pos);
  return {
    active: true,
    from: start + match.start,
    to: $from.pos,
    char: match.char,
    query: match.query,
    rect: new DOMRect(coords.left, coords.top, 1, coords.bottom - coords.top),
  };
}

// --- mutations -----------------------------------------------------------------------------------

type MentionNodeAttrs = { id: string; label: string; kind?: string; icon?: string | null };

// Replace the `<char><query>` range with an atomic mention node followed by a space, then refocus.
function insertMention(view: EditorView, from: number, to: number, attrs: MentionNodeAttrs) {
  const node = view.state.schema.nodes.mention.create({
    id: attrs.id,
    label: attrs.label,
    kind: attrs.kind ?? "mention",
    icon: attrs.icon ?? null,
  });
  const transaction = view.state.tr.replaceWith(from, to, node);
  transaction.insertText(" ");
  view.dispatch(transaction);
  view.focus();
}

// Remove the `<char><query>` token (slash-commands that run an action rather than inserting), refocus.
function deleteTriggerToken(view: EditorView, from: number, to: number) {
  view.dispatch(view.state.tr.delete(from, to));
  view.focus();
}

// Ghosts pill before its transaction lands; pillPos = mention node start, so nodeDOM returns its DOM to clone. Skipped on dry runs / no view (delete lands bare).
function ghostPill(view: EditorView | undefined, pillPos: number): void {
  const dom = view?.nodeDOM(pillPos);
  if (dom instanceof HTMLElement) spawnExitGhost(dom);
}

// Lone atom at block END gets trailing <br> (phantom blank line); plain Backspace looks like it adds a newline instead of removing the pill.
// These commands delete pill + auto-inserted space together in one keystroke, avoiding a lone trailing atom.
// Dispatched run spawns a blur-out ghost first so the pill doesn't just snap out.
export const deleteMentionBackward: Command = (state, dispatch, view) => {
  const { selection } = state;
  if (!selection.empty) return false;
  const { $from } = selection;
  const before = $from.nodeBefore;
  if (!before) return false;
  // Caret directly after a pill → remove the pill.
  if (before.type.name === "mention") {
    const pillPos = $from.pos - before.nodeSize;
    if (dispatch) {
      ghostPill(view, pillPos);
      dispatch(state.tr.delete(pillPos, $from.pos).scrollIntoView());
    }
    return true;
  }
  // Caret past auto-inserted trailing space at block END → drop space+pill together (else pill becomes last node → phantom line); mid-block, dropping just the space is harmless.
  if (before.isText && before.text === " " && $from.pos === $from.end()) {
    const beforeSpace = state.doc.resolve($from.pos - before.nodeSize).nodeBefore;
    if (beforeSpace && beforeSpace.type.name === "mention") {
      const pillPos = $from.pos - before.nodeSize - beforeSpace.nodeSize;
      if (dispatch) {
        ghostPill(view, pillPos);
        dispatch(state.tr.delete(pillPos, $from.pos).scrollIntoView());
      }
      return true;
    }
  }
  return false;
};

// Forward-delete (Del key) symmetry: caret directly before a pill → remove the pill.
export const deleteMentionForward: Command = (state, dispatch, view) => {
  const { selection } = state;
  if (!selection.empty) return false;
  const { $from } = selection;
  const after = $from.nodeAfter;
  if (after?.type.name !== "mention") return false;
  if (dispatch) {
    ghostPill(view, $from.pos);
    dispatch(state.tr.delete($from.pos, $from.pos + after.nodeSize).scrollIntoView());
  }
  return true;
};

// Walks doc for structured mentions (ids+labels) the agent consumes, attached to submit payload alongside plain-text value.
function collectMentions(doc: ProseMirrorNode): MentionItem[] {
  const mentions: MentionItem[] = [];
  doc.descendants((node) => {
    if (node.type.name === "mention") {
      mentions.push({
        id: attrString(node.attrs.id, ""),
        label: attrString(node.attrs.label, ""),
        kind: attrString(node.attrs.kind, "mention"),
      });
    }
  });
  return mentions;
}

// --- overlay -------------------------------------------------------------------------------------

type MentionOverlayProps<Item extends TriggerMenuItemData> = {
  editor: ChatComposerEditorApi;
  triggers: readonly TriggerConfig<Item>[];
  side: "top" | "bottom";
  align: "start" | "center" | "end";
};

// React half: owns trigger-menu controller+popup, talks to doc only via editor api (republish caret trigger, route keys while open, insert pill on commit); no PM plugin needed, keeps base editor mention-unaware.
function MentionOverlay<Item extends TriggerMenuItemData>({ editor, triggers, side, align }: MentionOverlayProps<Item>) {
  const chars = triggers.map((trigger) => trigger.char);

  const controller = useTriggerMenu<Item>({
    triggers,
    onCommit: (item, trigger) => {
      const view = editor.getView();
      if (!view) return;
      const state = readEditorTrigger(view, chars);
      if (!state.active) return;
      if ((trigger.insert ?? "replace") === "none") {
        deleteTriggerToken(view, state.from, state.to);
      } else {
        insertMention(view, state.from, state.to, { id: item.id, label: item.label, kind: item.kind, icon: item.image ?? null });
      }
      trigger.onSelect?.(item, { char: state.char, query: state.query });
    },
  });

  // Republish the caret trigger (and its rect) to the engine on every editor transaction.
  useEffect(() => {
    return editor.subscribe(() => {
      const view = editor.getView();
      if (!view) return;
      const state = readEditorTrigger(view, chars);
      controller.report(state.active ? { char: state.char, query: state.query, start: state.from, end: state.to } : null, state.rect);
    });
  }, [editor, controller, chars]);

  // While the menu is open, let it eat arrows/Enter/Esc before the editor's keymaps see them.
  useEffect(() => {
    return editor.registerKeyHandler((event) => {
      const view = editor.getView();
      if (!view) return false;
      if (!readEditorTrigger(view, chars).active) return false;
      return controller.handleKeyDown(event.key);
    });
  }, [editor, controller, chars]);

  if (triggers.length === 0) return null;
  return (
    <TriggerMenu open={controller.open} onOpenChange={controller.setOpen} anchorRect={controller.anchorRect} side={side} align={align}>
      <TriggerMenuList>
        {controller.items.length === 0 ? (
          <TriggerMenuEmpty>No results</TriggerMenuEmpty>
        ) : (
          controller.items.map((item, index) => (
            <TriggerMenuItem
              key={item.id}
              active={index === controller.activeIndex}
              disabled={item.disabled}
              onPointerMove={() => controller.setActiveIndex(index)}
              onClick={() => controller.select(item)}
            >
              {item.icon ? <TriggerMenuIcon>{item.icon}</TriggerMenuIcon> : null}
              <span className="flex-1 truncate">{item.label}</span>
              {item.description ? <span className="truncate text-micro text-muted-foreground">{item.description}</span> : null}
            </TriggerMenuItem>
          ))
        )}
      </TriggerMenuList>
    </TriggerMenu>
  );
}

// --- factory -------------------------------------------------------------------------------------

export type MentionExtensionConfig<Item extends TriggerMenuItemData = TriggerMenuItemData> = {
  triggers: readonly TriggerConfig<Item>[];
  side?: "top" | "bottom";
  align?: "start" | "center" | "end";
};

export function mentionExtension<Item extends TriggerMenuItemData = TriggerMenuItemData>({
  triggers,
  side = "top",
  align = "start",
}: MentionExtensionConfig<Item>): ChatComposerEditorExtension {
  return {
    name: "mention",
    nodes: { mention: mentionNode },
    keymap: () => ({ Backspace: deleteMentionBackward, Delete: deleteMentionForward }),
    submitPayload: (doc) => ({ mentions: collectMentions(doc) }),
    Overlay: ({ editor }) => <MentionOverlay editor={editor} triggers={triggers} side={side} align={align} />,
  };
}
