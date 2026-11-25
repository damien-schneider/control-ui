"use client";

import { GripHorizontalIcon, GripVerticalIcon } from "lucide-react";
import { type PointerEvent as ReactPointerEvent, type RefObject, useRef, useState } from "react";
import { useSkinIcon } from "@/components/control-ui/skin-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/control-ui/ui/dropdown-menu";
import { useMarkdownEditor } from "../context";
import type { MarkdownColumnAlign, MarkdownTableAxis } from "../engine";
import { firstMovable, indexForGap, nearestGap, type SurfaceBox, type TableLayout, toSurface } from "./table-geometry";

const DRAG_THRESHOLD = 4;
const MOVE_KEYS: Record<MarkdownTableAxis, [back: string, forward: string]> = {
  row: ["ArrowUp", "ArrowDown"],
  column: ["ArrowLeft", "ArrowRight"],
};

type Press = { pointerId: number; x: number; y: number; moved: boolean };
type TableGripProps = {
  axis: MarkdownTableAxis;
  table: HTMLTableElement;
  index: number;
  count: number;
  layout: TableLayout;
  container: RefObject<HTMLDivElement | null>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDraggingChange: (dragging: boolean) => void;
  onMove: (from: number, to: number) => void;
};

function gripCenter(axis: MarkdownTableAxis, layout: TableLayout) {
  if (axis === "row") return { top: layout.row.top + layout.row.height / 2, left: Math.max(layout.table.left, layout.clip.left) };
  return { top: layout.table.top, left: layout.column.left + layout.column.width / 2 };
}

const withinClip = (left: number, clip: SurfaceBox) => left >= clip.left && left <= clip.left + clip.width;

export function TableGrip({ axis, table, index, count, layout, container, open, onOpenChange, onDraggingChange, onMove }: TableGripProps) {
  const GripVerticalGlyph = useSkinIcon("gripVertical", GripVerticalIcon);
  const GripHorizontalGlyph = useSkinIcon("gripHorizontal", GripHorizontalIcon);
  const { engine, labels } = useMarkdownEditor();
  const [dropLine, setDropLine] = useState<{ gap: number; at: number } | null>(null);
  const press = useRef<Press | null>(null);
  const swallowClick = useRef(false);
  const openAtPress = useRef(false);
  const popup = useRef<HTMLDivElement>(null);
  const center = gripCenter(axis, layout);
  const movable = index >= firstMovable(axis);
  if (!engine || (axis === "column" && !withinClip(center.left, layout.clip))) return null;
  const { tables } = engine;

  function startPress(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;
    openAtPress.current = open;
    press.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function beginDrag(current: Press, event: ReactPointerEvent<HTMLButtonElement>) {
    if (!movable || Math.hypot(event.clientX - current.x, event.clientY - current.y) < DRAG_THRESHOLD) return false;
    current.moved = true;
    onOpenChange(false);
    onDraggingChange(true);
    tables.select(table, axis, index);
    return true;
  }

  function dragPress(event: ReactPointerEvent<HTMLButtonElement>) {
    const current = press.current;
    const surface = container.current;
    if (!(current && surface) || current.pointerId !== event.pointerId) return;
    if (!(current.moved || beginDrag(current, event))) return;
    const client = axis === "row" ? event.clientY : event.clientX;
    const { gap, line } = nearestGap(table, axis, client);
    setDropLine({ gap, at: toSurface(surface, axis, line) });
  }

  function endPress(event: ReactPointerEvent<HTMLButtonElement>) {
    const current = press.current;
    if (!current || current.pointerId !== event.pointerId) return;
    press.current = null;
    swallowClick.current = current.moved;
    if (current.moved && dropLine) onMove(index, indexForGap(index, dropLine.gap));
    if (current.moved) onDraggingChange(false);
    setDropLine(null);
  }

  function cancelPress() {
    if (press.current?.moved) onDraggingChange(false);
    press.current = null;
    setDropLine(null);
  }

  function click() {
    const dragged = swallowClick.current;
    const wasOpen = openAtPress.current;
    swallowClick.current = false;
    openAtPress.current = false;
    if (dragged) return;
    if (!wasOpen) tables.select(table, axis, index);
    onOpenChange(!wasOpen);
  }

  function editorIfFocusIsLost() {
    const active = document.activeElement;
    const lost = !active || active === document.body || popup.current?.contains(active) === true;
    return lost && engine ? engine.element : false;
  }

  const [back, forward] = MOVE_KEYS[axis];
  const visibleLeft = Math.max(layout.table.left, layout.clip.left);
  const visibleRight = Math.min(layout.table.left + layout.table.width, layout.clip.left + layout.clip.width);

  return (
    <>
      <DropdownMenu
        open={open}
        onOpenChange={(next, details) => {
          if (details.reason === "trigger-press") return;
          if (next && details.event instanceof KeyboardEvent && details.event.altKey) return;
          onOpenChange(next);
        }}
      >
        <DropdownMenuTrigger
          variant="surface"
          size="xs"
          iconOnly
          className="absolute"
          data-markdown-table-grip={axis}
          data-dragging={dropLine ? "" : undefined}
          aria-label={axis === "row" ? labels.rowActions : labels.columnActions}
          aria-description={labels.tableGripDescription}
          style={center}
          onPointerDown={startPress}
          onPointerMove={dragPress}
          onPointerUp={endPress}
          onPointerCancel={cancelPress}
          onClick={click}
          onKeyDown={(event) => {
            if (!(event.altKey && (event.key === back || event.key === forward))) return;
            event.preventDefault();
            onMove(index, index + (event.key === back ? -1 : 1));
          }}
        >
          {axis === "row" ? <GripVerticalGlyph aria-hidden="true" /> : <GripHorizontalGlyph aria-hidden="true" />}
        </DropdownMenuTrigger>
        <DropdownMenuContent ref={popup} side={axis === "row" ? "left" : "top"} align="start" finalFocus={editorIfFocusIsLost}>
          <TableGripMenu axis={axis} table={table} index={index} count={count} onMove={onMove} />
        </DropdownMenuContent>
      </DropdownMenu>
      {dropLine ? (
        <div
          data-control-ui="markdown-editor"
          data-control-family="markdown-editor"
          data-slot="table-drop-line"
          data-axis={axis}
          style={
            axis === "row"
              ? { top: dropLine.at, left: visibleLeft, width: visibleRight - visibleLeft }
              : { left: dropLine.at, top: layout.table.top, height: layout.table.height }
          }
        />
      ) : null}
    </>
  );
}

type TableGripMenuProps = Pick<TableGripProps, "axis" | "table" | "index" | "count" | "onMove">;

function TableGripMenu({ axis, table, index, count, onMove }: TableGripMenuProps) {
  const { engine, labels } = useMarkdownEditor();
  if (!engine) return null;
  const { tables } = engine;
  const header = axis === "row" && index === 0;
  const insert = (side: "before" | "after") => () => tables.insert(table, axis, index, side);
  const align = (value: MarkdownColumnAlign) => () => tables.align(table, index, value);

  return (
    <>
      {axis === "row" ? (
        <>
          <DropdownMenuItem disabled={header} onClick={insert("before")}>
            {labels.insertRowAbove}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={insert("after")}>{labels.insertRowBelow}</DropdownMenuItem>
        </>
      ) : (
        <>
          <DropdownMenuItem onClick={insert("before")}>{labels.insertColumnLeft}</DropdownMenuItem>
          <DropdownMenuItem onClick={insert("after")}>{labels.insertColumnRight}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={align("left")}>{labels.alignLeft}</DropdownMenuItem>
          <DropdownMenuItem onClick={align("center")}>{labels.alignCenter}</DropdownMenuItem>
          <DropdownMenuItem onClick={align("right")}>{labels.alignRight}</DropdownMenuItem>
        </>
      )}
      <DropdownMenuSeparator />
      <DropdownMenuItem disabled={header || index === firstMovable(axis)} onClick={() => onMove(index, index - 1)}>
        {axis === "row" ? labels.moveRowUp : labels.moveColumnLeft}
      </DropdownMenuItem>
      <DropdownMenuItem disabled={header || index === count - 1} onClick={() => onMove(index, index + 1)}>
        {axis === "row" ? labels.moveRowDown : labels.moveColumnRight}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem tone="danger" disabled={axis === "row" ? header : count === 1} onClick={() => tables.remove(table, axis, index)}>
        {axis === "row" ? labels.deleteRow : labels.deleteColumn}
      </DropdownMenuItem>
    </>
  );
}
