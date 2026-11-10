"use client";

import type { Editor } from "@tiptap/core";
import { closeHistory } from "@tiptap/pm/history";
import { NodeSelection } from "@tiptap/pm/state";
import { GripVerticalIcon } from "lucide-react";
import { type RefObject, useEffect, useRef, useState } from "react";
import { Button } from "@/components/control-ui/ui/button";
import { LiveStatus } from "@/components/control-ui/ui/live-status";
import { useMarkdownEditor } from "./context";
import { createDragPreview } from "./drag-preview";

type BlockHandle = { position: number; top: number };

/** The gutter sits outside every block, so the pointer's x is clamped into the text column before the hit test. */
function blockPositionAt(view: Editor["view"], event: MouseEvent): number | null {
  const rect = view.dom.getBoundingClientRect();
  const style = getComputedStyle(view.dom);
  const gutter = Number.parseFloat(style.paddingInlineStart);
  const left = style.direction === "rtl" ? Math.min(event.clientX, rect.right - gutter) : Math.max(event.clientX, rect.left + gutter);
  const hit = view.posAtCoords({ left, top: event.clientY });
  if (!hit) return null;
  const resolved = view.state.doc.resolve(hit.pos);
  return resolved.depth > 0 ? resolved.before(1) : hit.pos;
}

export function MarkdownEditorDragHandle({ container }: { container: RefObject<HTMLDivElement | null> }) {
  const { editor, editable, labels } = useMarkdownEditor();
  const [block, setBlock] = useState<BlockHandle | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const button = useRef<HTMLButtonElement>(null);
  const dragging = useRef(false);
  const preview = useRef<HTMLDivElement | null>(null);
  const preparedDrag = useRef<ReturnType<typeof prepareDrag> | null>(null);

  useEffect(() => {
    const surface = container.current;
    if (!editor || editor.isDestroyed || !surface || !editable) return;
    const view = editor.view;
    let frame = 0;
    let latestEvent: MouseEvent | null = null;
    function show(blockPosition: number) {
      if (!editor || !surface) return;
      const node = editor.view.nodeDOM(blockPosition);
      if (!(node instanceof HTMLElement)) return;
      const top = node.getBoundingClientRect().top - surface.getBoundingClientRect().top + surface.scrollTop;
      setBlock((current) => (current?.position === blockPosition && current.top === top ? current : { position: blockPosition, top }));
    }
    function updateHandle(event: MouseEvent) {
      if (!editor || dragging.current || button.current?.contains(event.target instanceof Node ? event.target : null)) return;
      const blockPosition = blockPositionAt(editor.view, event);
      if (blockPosition !== null) show(blockPosition);
    }
    function track(event: MouseEvent) {
      latestEvent = event;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (latestEvent) updateHandle(latestEvent);
      });
    }
    function selectionChanged() {
      if (!editor || dragging.current) return;
      const { $from } = editor.state.selection;
      show($from.depth > 0 ? $from.before(1) : $from.pos);
    }
    function hide() {
      cancelAnimationFrame(frame);
      frame = 0;
      latestEvent = null;
      if (!dragging.current && document.activeElement !== button.current) setBlock(null);
    }
    surface.addEventListener("mousemove", track);
    surface.addEventListener("mouseleave", hide);
    editor.on("transaction", selectionChanged).on("focus", selectionChanged);
    return () => {
      cancelAnimationFrame(frame);
      surface.removeEventListener("mousemove", track);
      surface.removeEventListener("mouseleave", hide);
      editor.off("transaction", selectionChanged).off("focus", selectionChanged);
      view.dragging = null;
      preview.current?.remove();
      preview.current = null;
      preparedDrag.current = null;
      dragging.current = false;
    };
  }, [editor, container, editable]);

  if (!editor || !editable) return null;
  const selected = editor.state.selection.$from;
  const position = block?.position ?? (selected.depth > 0 ? selected.before(1) : selected.pos);

  function prepareDrag() {
    if (!editor || editor.isDestroyed) return null;
    const selection = NodeSelection.create(editor.state.doc, position);
    const node = editor.view.nodeDOM(position);
    const { dom, text, slice } = editor.view.serializeForClipboard(selection.content());
    return {
      position,
      document: editor.state.doc,
      selection,
      html: dom.innerHTML,
      text,
      slice,
      preview: node instanceof HTMLElement ? createDragPreview(node) : null,
    };
  }

  function move(direction: -1 | 1) {
    if (!editor) return;
    const { doc, tr } = editor.state;
    const node = doc.nodeAt(position);
    if (!node) return;
    const adjacent = direction === -1 ? doc.resolve(position).nodeBefore : doc.nodeAt(position + node.nodeSize);
    if (!adjacent) return;
    const target = direction === -1 ? position - adjacent.nodeSize : position + adjacent.nodeSize;
    tr.delete(position, position + node.nodeSize).insert(target, node);
    tr.setSelection(NodeSelection.create(tr.doc, target));
    editor.view.dispatch(closeHistory(tr).scrollIntoView());
    setAnnouncement(labels.blockMoved(direction === -1 ? "up" : "down"));
  }

  return (
    <>
      <Button
        ref={button}
        type="button"
        variant="ghost"
        size="xs"
        iconOnly
        data-markdown-drag-handle=""
        data-visible={block ? "" : undefined}
        aria-label={labels.dragHandle}
        aria-description={labels.dragHandleDescription}
        title={labels.dragHandleHint}
        draggable
        style={{
          insetBlockStart: block?.top,
          "--cui-button-background": "transparent",
          "--cui-button-hover-background": "transparent",
          "--cui-button-press-background": "transparent",
          "--cui-button-shadow": "0 0 transparent",
          "--cui-button-hover-shadow": "0 0 transparent",
        }}
        onClick={() => editor.commands.setNodeSelection(position)}
        onPointerDown={() => {
          preparedDrag.current = prepareDrag();
        }}
        onPointerUp={() => {
          preparedDrag.current = null;
        }}
        onKeyDown={(event) => {
          if (!event.altKey || !["ArrowUp", "ArrowDown"].includes(event.key)) return;
          event.preventDefault();
          move(event.key === "ArrowUp" ? -1 : 1);
        }}
        onDragStart={(event) => {
          const prepared = preparedDrag.current;
          const payload = prepared?.position === position && prepared.document === editor.state.doc ? prepared : prepareDrag();
          preparedDrag.current = null;
          if (!payload) {
            event.preventDefault();
            return;
          }
          const { view } = editor;
          const { html, text, slice, selection, preview: ghost } = payload;
          dragging.current = true;
          view.dispatch(view.state.tr.setSelection(selection));
          event.dataTransfer.clearData();
          event.dataTransfer.setData("text/html", html);
          event.dataTransfer.setData("text/plain", text);
          event.dataTransfer.effectAllowed = "copyMove";
          if (ghost) {
            preview.current?.remove();
            container.current?.append(ghost);
            preview.current = ghost;
            event.dataTransfer.setDragImage(ghost, 0, 0);
          }
          view.dragging = { slice, move: true };
        }}
        onDragEnd={() => {
          editor.view.dragging = null;
          dragging.current = false;
          preview.current?.remove();
          preview.current = null;
          preparedDrag.current = null;
          setBlock(null);
        }}
      >
        <GripVerticalIcon aria-hidden="true" />
      </Button>
      <LiveStatus message={announcement} />
    </>
  );
}
