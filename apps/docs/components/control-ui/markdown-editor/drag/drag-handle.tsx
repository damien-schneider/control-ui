"use client";

import { GripVerticalIcon } from "lucide-react";
import { type RefObject, useEffect, useRef, useState } from "react";
import { useSkinIcon } from "@/components/control-ui/skin-provider";
import { Button } from "@/components/control-ui/ui/button";
import { LiveStatus } from "@/components/control-ui/ui/live-status";
import { useMarkdownEditor } from "../context";

type BlockHandle = { position: number; top: number; visible: boolean; glide: boolean };

/** Hiding keeps the last place, so the handle fades out where it was instead of jumping first. */
function conceal(current: BlockHandle | null): BlockHandle | null {
  return current?.visible ? { ...current, visible: false, glide: false } : current;
}

/** The gutter sits outside every block, so the pointer's x is clamped into the text column before the hit test. */
function textColumnPoint(element: HTMLElement, point: { x: number; y: number }) {
  const rect = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  const gutter = Number.parseFloat(style.paddingInlineStart);
  const x = style.direction === "rtl" ? Math.min(point.x, rect.right - gutter) : Math.max(point.x, rect.left + gutter);
  return { x, y: point.y };
}

export function MarkdownEditorDragHandle({ container }: { container: RefObject<HTMLDivElement | null> }) {
  const GripVerticalGlyph = useSkinIcon("gripVertical", GripVerticalIcon);
  const { engine, editable, labels } = useMarkdownEditor();
  const [block, setBlock] = useState<BlockHandle | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [pointerSelection, setPointerSelection] = useState(false);
  const [lifted, setLifted] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const dragging = useRef(false);
  const preview = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const surface = container.current;
    if (!engine || !surface || !editable) return;
    const { blocks } = engine;
    let frame = 0;
    let pointer: { x: number; y: number } | null = null;
    function show(start: number | null) {
      const rect = start === null ? null : blocks.rect(start);
      if (start === null || !rect || !surface) return;
      const top = rect.top - surface.getBoundingClientRect().top + surface.scrollTop;
      setBlock((current) =>
        current?.visible && current.position === start && current.top === top
          ? current
          : { position: start, top, visible: true, glide: current?.visible === true },
      );
    }
    function showAtPointer() {
      if (pointer && engine) show(blocks.at(textColumnPoint(engine.element, pointer)));
    }
    function track(event: MouseEvent) {
      if (dragging.current || button.current?.contains(event.target instanceof Node ? event.target : null)) return;
      pointer = { x: event.clientX, y: event.clientY };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        showAtPointer();
      });
    }
    function engineChanged() {
      if (dragging.current) return;
      if (document.activeElement === button.current) show(blocks.atSelection());
      else if (pointer) showAtPointer();
      else if (engine?.getSnapshot().focused) show(blocks.atSelection());
      else setBlock(conceal);
    }
    function keyboardUsed() {
      pointer = null;
      setPointerSelection(false);
    }
    function hide() {
      cancelAnimationFrame(frame);
      frame = 0;
      pointer = null;
      if (!dragging.current && document.activeElement !== button.current) setBlock(conceal);
    }
    surface.addEventListener("mousemove", track);
    surface.addEventListener("mouseleave", hide);
    surface.addEventListener("keydown", keyboardUsed);
    const unsubscribe = engine.subscribe(engineChanged);
    return () => {
      cancelAnimationFrame(frame);
      unsubscribe();
      surface.removeEventListener("mousemove", track);
      surface.removeEventListener("mouseleave", hide);
      surface.removeEventListener("keydown", keyboardUsed);
      blocks.endDrag();
      preview.current?.remove();
      preview.current = null;
      dragging.current = false;
    };
  }, [engine, container, editable]);

  if (!engine || !editable) return null;
  const { blocks } = engine;
  const position = block ? block.position : blocks.atSelection();

  function endDrag() {
    blocks.endDrag();
    dragging.current = false;
    setLifted(false);
    preview.current?.remove();
    preview.current = null;
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
        data-visible={block?.visible ? "" : undefined}
        data-glide={block?.glide ? "" : undefined}
        data-pointer-selection={pointerSelection ? "" : undefined}
        data-lifted={lifted ? "" : undefined}
        aria-label={labels.dragHandle}
        aria-description={labels.dragHandleDescription}
        title={labels.dragHandleHint}
        draggable
        style={{
          translate: block ? `0 ${block.top}px` : undefined,
          "--cui-button-background": "transparent",
          "--cui-button-hover-background": "transparent",
          "--cui-button-press-background": "transparent",
          "--cui-button-shadow": "0 0 transparent",
          "--cui-button-hover-shadow": "0 0 transparent",
        }}
        onClick={() => {
          if (position !== null) blocks.select(position);
        }}
        onPointerDown={() => {
          setPointerSelection(true);
          if (position !== null) blocks.prepareDrag(position);
        }}
        onPointerUp={() => {
          if (!dragging.current) blocks.endDrag();
        }}
        onKeyDown={(event) => {
          if (!event.altKey || !["ArrowUp", "ArrowDown"].includes(event.key) || position === null) return;
          event.preventDefault();
          const direction = event.key === "ArrowUp" ? -1 : 1;
          if (blocks.move(position, direction) !== null) setAnnouncement(labels.blockMoved(direction === -1 ? "up" : "down"));
        }}
        onDragStart={(event) => {
          const drag = position === null ? null : blocks.startDrag(position, event.dataTransfer);
          if (!drag) {
            event.preventDefault();
            return;
          }
          dragging.current = true;
          setLifted(true);
          const ghost = drag.preview;
          if (!ghost) return;
          preview.current?.remove();
          container.current?.append(ghost.element);
          preview.current = ghost.element;
          const frame = ghost.element.getBoundingClientRect();
          const anchor = ghost.anchor.getBoundingClientRect();
          ghost.element.toggleAttribute("data-clipped", ghost.element.scrollHeight > ghost.element.clientHeight);
          event.dataTransfer.setDragImage(
            ghost.element,
            Math.max(0, anchor.left - frame.left + event.clientX - drag.origin.left),
            Math.max(0, anchor.top - frame.top + event.clientY - drag.origin.top),
          );
        }}
        onDragEnd={() => {
          endDrag();
          setBlock(conceal);
        }}
      >
        <GripVerticalGlyph aria-hidden="true" />
      </Button>
      <LiveStatus message={announcement} />
    </>
  );
}
