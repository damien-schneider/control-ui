"use client";

import { closeHistory } from "@tiptap/pm/history";
import { NodeSelection } from "@tiptap/pm/state";
import { GripVerticalIcon } from "lucide-react";
import { type RefObject, useEffect, useRef, useState } from "react";
import { Button } from "@/components/control-ui/ui/button";
import { LiveStatus } from "@/components/control-ui/ui/live-status";
import { useMarkdownEditor } from "./context";

type BlockHandle = { position: number; top: number };

export function MarkdownEditorDragHandle({ container }: { container: RefObject<HTMLDivElement | null> }) {
  const { editor, disabled, source } = useMarkdownEditor();
  const [block, setBlock] = useState<BlockHandle | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const button = useRef<HTMLButtonElement>(null);
  const dragging = useRef(false);

  useEffect(() => {
    const surface = container.current;
    if (!editor || !surface || disabled || source) return;
    function show(blockPosition: number) {
      if (!editor || !surface) return;
      const node = editor.view.nodeDOM(blockPosition);
      if (!(node instanceof HTMLElement)) return;
      const top = node.getBoundingClientRect().top - surface.getBoundingClientRect().top + surface.scrollTop;
      setBlock((current) => (current?.position === blockPosition && current.top === top ? current : { position: blockPosition, top }));
    }
    function track(event: MouseEvent) {
      if (!editor || dragging.current || button.current?.contains(event.target instanceof Node ? event.target : null)) return;
      const rect = editor.view.dom.getBoundingClientRect();
      const padding = Number.parseFloat(getComputedStyle(editor.view.dom).paddingInlineStart);
      const hit = editor.view.posAtCoords({ left: Math.max(event.clientX, rect.left + padding), top: event.clientY });
      if (!hit) return;
      const resolved = editor.state.doc.resolve(hit.pos);
      show(resolved.depth > 0 ? resolved.before(1) : hit.pos);
    }
    function selectionChanged() {
      if (!editor || dragging.current) return;
      const { $from } = editor.state.selection;
      show($from.depth > 0 ? $from.before(1) : $from.pos);
    }
    function hide() {
      if (!dragging.current && document.activeElement !== button.current) setBlock(null);
    }
    surface.addEventListener("mousemove", track);
    surface.addEventListener("mouseleave", hide);
    editor.on("transaction", selectionChanged).on("focus", selectionChanged);
    return () => {
      surface.removeEventListener("mousemove", track);
      surface.removeEventListener("mouseleave", hide);
      editor.off("transaction", selectionChanged).off("focus", selectionChanged);
      editor.view.dragging = null;
    };
  }, [editor, container, disabled, source]);

  if (!editor || disabled || source) return null;
  const selected = editor.state.selection.$from;
  const position = block?.position ?? (selected.depth > 0 ? selected.before(1) : selected.pos);

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
    setAnnouncement(`Block moved ${direction === -1 ? "up" : "down"}.`);
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
        aria-label="Drag to reorder block"
        aria-description="Drag this block, or use Alt+ArrowUp and Alt+ArrowDown to move it."
        title="Drag to reorder · Alt+↑/↓ to move"
        draggable
        style={{ top: block?.top }}
        onClick={() => editor.commands.setNodeSelection(position)}
        onKeyDown={(event) => {
          if (!event.altKey || !["ArrowUp", "ArrowDown"].includes(event.key)) return;
          event.preventDefault();
          move(event.key === "ArrowUp" ? -1 : 1);
        }}
        onDragStart={(event) => {
          const { view } = editor;
          const selection = NodeSelection.create(view.state.doc, position);
          const node = view.nodeDOM(position);
          view.dispatch(view.state.tr.setSelection(selection));
          const { dom, text, slice } = view.serializeForClipboard(selection.content());
          event.dataTransfer.clearData();
          event.dataTransfer.setData("text/html", dom.innerHTML);
          event.dataTransfer.setData("text/plain", text);
          event.dataTransfer.effectAllowed = "copyMove";
          if (node instanceof HTMLElement) event.dataTransfer.setDragImage(node, 0, 0);
          view.dragging = { slice, move: true };
          dragging.current = true;
        }}
        onDragEnd={() => {
          editor.view.dragging = null;
          dragging.current = false;
          setBlock(null);
        }}
      >
        <GripVerticalIcon aria-hidden="true" />
      </Button>
      <LiveStatus message={announcement} />
    </>
  );
}
