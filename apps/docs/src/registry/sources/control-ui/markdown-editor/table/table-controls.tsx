"use client";

import { PlusIcon } from "lucide-react";
import { type ReactNode, type RefObject, useRef, useState } from "react";
import { Button } from "@/components/control-ui/ui/button";
import { LiveStatus } from "@/components/control-ui/ui/live-status";
import { useMarkdownEditor } from "../context";
import type { MarkdownTableAxis } from "../engine";
import { canMoveLine, tableSize } from "./table-geometry";
import { TableGrip } from "./table-grip";
import { useTableTarget } from "./use-table-target";

export function MarkdownEditorTableControls({ container }: { container: RefObject<HTMLDivElement | null> }) {
  const { engine, editable, labels } = useMarkdownEditor();
  const [menu, setMenu] = useState<MarkdownTableAxis | null>(null);
  const [dragging, setDragging] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const controls = useRef<HTMLDivElement>(null);
  const { target, layout, setHover } = useTableTarget(engine, container, controls, editable, menu !== null || dragging);
  const status = <LiveStatus key="status" message={announcement} />;
  if (!(engine && target && layout)) return <TableControlsFrame frame={controls}>{status}</TableControlsFrame>;
  const { tables } = engine;
  const { table } = target;
  const { rows, columns } = tableSize(table);
  const visibleLeft = Math.max(layout.table.left, layout.clip.left);
  const visibleRight = Math.min(layout.table.left + layout.table.width, layout.clip.left + layout.clip.width);

  function move(axis: MarkdownTableAxis, from: number, to: number) {
    if (!canMoveLine(axis === "row" ? rows : columns, axis, from, to) || !tables.move(table, axis, from, to)) return;
    setHover(tables.caret() ?? { table, row: target?.row ?? 0, column: target?.column ?? 0, [axis]: to });
    setAnnouncement(axis === "row" ? labels.rowMoved(to) : labels.columnMoved(to + 1));
  }

  const grip = (axis: MarkdownTableAxis) => (
    <TableGrip
      axis={axis}
      table={table}
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
        onClick={() => tables.append(table, "row")}
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
        onClick={() => tables.append(table, "column")}
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
