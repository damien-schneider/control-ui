"use client";

import { GripHorizontalIcon, GripVerticalIcon } from "lucide-react";
import { type PointerEvent as ReactPointerEvent, type RefObject, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/control-ui/ui/dropdown-menu";
import { useMarkdownEditor } from "./context";
import { alignColumn, type ColumnAlign, firstMovable, runInCell, selectLine } from "./table-commands";
import { indexForGap, nearestGap, type SurfaceBox, type TableAxis, type TableLayout, tableElement, toSurface } from "./table-geometry";

const DRAG_THRESHOLD = 4;
const MOVE_KEYS: Record<TableAxis, [back: string, forward: string]> = {
  row: ["ArrowUp", "ArrowDown"],
  column: ["ArrowLeft", "ArrowRight"],
};

type Press = { pointerId: number; x: number; y: number; moved: boolean };
type TableGripProps = {
  axis: TableAxis;
  tablePos: number;
  index: number;
  count: number;
  layout: TableLayout;
  container: RefObject<HTMLDivElement | null>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDraggingChange: (dragging: boolean) => void;
  onMove: (from: number, to: number) => void;
};

function gripCenter(axis: TableAxis, layout: TableLayout) {
  if (axis === "row") return { top: layout.row.top + layout.row.height / 2, left: Math.max(layout.table.left, layout.clip.left) };
  return { top: layout.table.top, left: layout.column.left + layout.column.width / 2 };
}

const withinClip = (left: number, clip: SurfaceBox) => left >= clip.left && left <= clip.left + clip.width;

export function TableGrip({
  axis,
  tablePos,
  index,
  count,
  layout,
  container,
  open,
  onOpenChange,
  onDraggingChange,
  onMove,
}: TableGripProps) {
  const { editor, labels } = useMarkdownEditor();
  const [dropLine, setDropLine] = useState<{ gap: number; at: number } | null>(null);
  const press = useRef<Press | null>(null);
  const swallowClick = useRef(false);
  const openAtPress = useRef(false);
  const center = gripCenter(axis, layout);
  const movable = index >= firstMovable(axis);
  if (!editor || (axis === "column" && !withinClip(center.left, layout.clip))) return null;
  const live = editor;

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
    selectLine(live, tablePos, axis, index);
    return true;
  }

  function dragPress(event: ReactPointerEvent<HTMLButtonElement>) {
    const current = press.current;
    const surface = container.current;
    const table = tableElement(live.view, tablePos);
    if (!(current && surface && table) || current.pointerId !== event.pointerId) return;
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
    if (!wasOpen) selectLine(live, tablePos, axis, index);
    onOpenChange(!wasOpen);
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
          {axis === "row" ? <GripVerticalIcon aria-hidden="true" /> : <GripHorizontalIcon aria-hidden="true" />}
        </DropdownMenuTrigger>
        <DropdownMenuContent side={axis === "row" ? "left" : "top"} align="start" finalFocus={() => live.view.dom}>
          <TableGripMenu axis={axis} tablePos={tablePos} index={index} count={count} onMove={onMove} />
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

type TableGripMenuProps = Pick<TableGripProps, "axis" | "tablePos" | "index" | "count" | "onMove">;

function TableGripMenu({ axis, tablePos, index, count, onMove }: TableGripMenuProps) {
  const { editor, labels } = useMarkdownEditor();
  if (!editor) return null;
  const live = editor;
  const header = axis === "row" && index === 0;
  const inRow = (apply: Parameters<typeof runInCell>[4]) => () => runInCell(live, tablePos, index, 0, apply);
  const inColumn = (apply: Parameters<typeof runInCell>[4]) => () => runInCell(live, tablePos, 0, index, apply);
  const align = (value: ColumnAlign) => () => alignColumn(live, tablePos, index, value);

  return (
    <>
      {axis === "row" ? (
        <>
          <DropdownMenuItem disabled={header} onClick={inRow((chain) => chain.addRowBefore())}>
            {labels.insertRowAbove}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={inRow((chain) => chain.addRowAfter())}>{labels.insertRowBelow}</DropdownMenuItem>
        </>
      ) : (
        <>
          <DropdownMenuItem onClick={inColumn((chain) => chain.addColumnBefore())}>{labels.insertColumnLeft}</DropdownMenuItem>
          <DropdownMenuItem onClick={inColumn((chain) => chain.addColumnAfter())}>{labels.insertColumnRight}</DropdownMenuItem>
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
      {axis === "row" ? (
        <DropdownMenuItem tone="danger" disabled={header} onClick={inRow((chain) => chain.deleteRow())}>
          {labels.deleteRow}
        </DropdownMenuItem>
      ) : (
        <DropdownMenuItem tone="danger" disabled={count === 1} onClick={inColumn((chain) => chain.deleteColumn())}>
          {labels.deleteColumn}
        </DropdownMenuItem>
      )}
    </>
  );
}
