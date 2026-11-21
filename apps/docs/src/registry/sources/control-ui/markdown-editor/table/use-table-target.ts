"use client";

import { type Dispatch, type RefObject, type SetStateAction, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { MarkdownEditorEngine, MarkdownTableTarget } from "../engine";
import { isNear, measureTable, type TableLayout, tableSize, tableTargetAt } from "./table-geometry";

const HOVER_REACH = 28;

const sameTarget = (a: MarkdownTableTarget | null, b: MarkdownTableTarget | null) =>
  a === b || (a !== null && b !== null && a.table === b.table && a.row === b.row && a.column === b.column);

function hoverFor(root: HTMLElement, current: MarkdownTableTarget | null, event: MouseEvent) {
  const next = tableTargetAt(root, event.target);
  if (next) return sameTarget(current, next) ? current : next;
  const rect = current?.table.isConnected ? current.table.getBoundingClientRect() : undefined;
  return rect && isNear(rect, event.clientX, event.clientY, HOVER_REACH) ? current : null;
}

type TableTargetState = {
  target: MarkdownTableTarget | null;
  layout: TableLayout | null;
  setHover: Dispatch<SetStateAction<MarkdownTableTarget | null>>;
};

/** The table cell the controls attach to: the hovered cell, else the caret's cell while editing or while a grip is held. */
export function useTableTarget(
  engine: MarkdownEditorEngine | null,
  container: RefObject<HTMLDivElement | null>,
  controls: RefObject<HTMLDivElement | null>,
  enabled: boolean,
  holding: boolean,
): TableTargetState {
  const [hover, setHover] = useState<MarkdownTableTarget | null>(null);
  const [revision, setRevision] = useState(0);
  const [layout, setLayout] = useState<TableLayout | null>(null);
  const holdingRef = useRef(holding);
  holdingRef.current = holding;

  useEffect(() => {
    const surface = container.current;
    if (!engine || !surface || !enabled) return;
    let frame = 0;
    let latest: MouseEvent | null = null;
    const insideControls = (node: unknown) => node instanceof Node && controls.current?.contains(node) === true;
    function follow(event: MouseEvent) {
      if (holdingRef.current || insideControls(event.target) || !engine) return;
      setHover((current) => hoverFor(engine.element, current, event));
    }
    function track(event: MouseEvent) {
      latest = event;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (latest) follow(latest);
      });
    }
    function leave() {
      if (!(holdingRef.current || insideControls(document.activeElement))) setHover(null);
    }
    function remeasure() {
      setRevision((value) => value + 1);
    }
    function engineChanged() {
      setHover((current) => (current && !current.table.isConnected ? null : current));
      remeasure();
    }
    surface.addEventListener("mousemove", track);
    surface.addEventListener("mouseleave", leave);
    surface.addEventListener("scroll", remeasure, { capture: true, passive: true });
    window.addEventListener("resize", remeasure);
    const unsubscribe = engine.subscribe(engineChanged);
    return () => {
      cancelAnimationFrame(frame);
      unsubscribe();
      surface.removeEventListener("mousemove", track);
      surface.removeEventListener("mouseleave", leave);
      surface.removeEventListener("scroll", remeasure, { capture: true });
      window.removeEventListener("resize", remeasure);
    };
  }, [engine, container, controls, enabled]);

  const live = engine !== null && enabled;
  const caret = live && (engine.getSnapshot().focused || holding) ? engine.tables.caret() : null;
  const found = live ? (hover ?? caret) : null;
  const size = found?.table.isConnected ? tableSize(found.table) : null;
  const target =
    found && size
      ? { table: found.table, row: Math.min(found.row, size.rows - 1), column: Math.min(found.column, size.columns - 1) }
      : null;
  const table = target?.table;
  const row = target?.row;
  const column = target?.column;

  // biome-ignore lint/correctness/useExhaustiveDependencies: revision re-measures after scroll, resize and edits
  useLayoutEffect(() => {
    const surface = container.current;
    if (!(surface && table && row !== undefined && column !== undefined)) {
      setLayout(null);
      return;
    }
    setLayout(measureTable(surface, { table, row, column }));
  }, [container, table, row, column, revision]);

  return { target: layout ? target : null, layout, setHover };
}
