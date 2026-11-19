"use client";

import { PlusIcon } from "lucide-react";
import { type ReactNode, type RefObject, useRef, useState } from "react";
import { Button } from "@/components/control-ui/ui/button";
import { LiveStatus } from "@/components/control-ui/ui/live-status";
import { useMarkdownEditor } from "./context";
import { lineCount, moveLine, runInCell } from "./table-commands";
import type { TableAxis } from "./table-geometry";
import { TableGrip } from "./table-grip";
import { useTableTarget } from "./use-table-target";

export function MarkdownEditorTableControls({ container }: { container: RefObject<HTMLDivElement | null> }) {
  const { editor, editable, labels } = useMarkdownEditor();
  const [menu, setMenu] = useState<TableAxis | null>(null);
  const [dragging, setDragging] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const controls = useRef<HTMLDivElement>(null);
  const { target, layout, setHover } = useTableTarget(editor, container, controls, editable, menu !== null || dragging);
  const status = <LiveStatus key="status" message={announcement} />;
  if (!(editor && target && layout)) return <TableControlsFrame frame={controls}>{status}</TableControlsFrame>;
  const live = editor;
  const { tablePos } = target;
  const rows = lineCount(live, tablePos, "row");
  const columns = lineCount(live, tablePos, "column");
  const visibleLeft = Math.max(layout.table.left, layout.clip.left);
  const visibleRight = Math.min(layout.table.left + layout.table.width, layout.clip.left + layout.clip.width);

  function move(axis: TableAxis, from: number, to: number) {
    if (!moveLine(live, tablePos, axis, from, to)) return;
    setHover({ tablePos, row: target?.row ?? 0, column: target?.column ?? 0, [axis]: to });
    setAnnouncement(axis === "row" ? labels.rowMoved(to) : labels.columnMoved(to + 1));
  }

  const grip = (axis: TableAxis) => (
    <TableGrip
      axis={axis}
      tablePos={tablePos}
      index={target[axis]}
      count={axis === "row" ? rows : columns}
      layout={layout}
      container={container}
      open={menu === axis}
      onOpenChange={(open) => setMenu(open ? axis : null)}
      onDraggingChange={setDragging}
      onMove={(from, to) => move(axis, from, to)}
    />
  );

  return (
    <TableControlsFrame frame={controls}>
      {grip("row")}
      {grip("column")}
      <Button
        type="button"
        variant="ghost"
        size="xs"
        className="absolute"
        data-markdown-table-add="row"
        aria-label={labels.addRow}
        style={{ top: layout.table.top + layout.table.height, left: visibleLeft, width: visibleRight - visibleLeft }}
        onClick={() => runInCell(live, tablePos, rows - 1, columns - 1, (chain) => chain.addRowAfter().goToNextCell())}
      >
        <PlusIcon aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="xs"
        className="absolute"
        data-markdown-table-add="column"
        aria-label={labels.addColumn}
        style={{ top: layout.table.top, left: visibleRight, height: layout.table.height }}
        onClick={() => runInCell(live, tablePos, 0, columns - 1, (chain) => chain.addColumnAfter().goToNextCell())}
      >
        <PlusIcon aria-hidden="true" />
      </Button>
      {status}
    </TableControlsFrame>
  );
}

function TableControlsFrame({ frame, children }: { frame: RefObject<HTMLDivElement | null>; children: ReactNode }) {
  return (
    <div ref={frame} data-control-ui="markdown-editor" data-control-family="markdown-editor" data-slot="table-controls">
      {children}
    </div>
  );
}
