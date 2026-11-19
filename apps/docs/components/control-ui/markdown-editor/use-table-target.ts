"use client";

import type { Editor } from "@tiptap/core";
import type { Transaction } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import { type Dispatch, type RefObject, type SetStateAction, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  isNear,
  measureTable,
  type TableLayout,
  type TableTarget,
  tableAt,
  tableElement,
  tableTargetAt,
  tableTargetFrom,
} from "./table-geometry";

const HOVER_REACH = 28;

const sameTarget = (a: TableTarget | null, b: TableTarget | null) =>
  a === b || (a !== null && b !== null && a.tablePos === b.tablePos && a.row === b.row && a.column === b.column);

function mapTarget(current: TableTarget | null, transaction: Transaction): TableTarget | null {
  if (!current) return null;
  const tablePos = transaction.mapping.map(current.tablePos, -1);
  const found = tableAt(transaction.doc, tablePos);
  if (!found) return null;
  return { tablePos, row: Math.min(current.row, found.map.height - 1), column: Math.min(current.column, found.map.width - 1) };
}

function hoverFor(view: EditorView, current: TableTarget | null, event: MouseEvent) {
  const next = tableTargetAt(view, event.target);
  if (next) return sameTarget(current, next) ? current : next;
  const rect = current ? tableElement(view, current.tablePos)?.getBoundingClientRect() : undefined;
  return rect && isNear(rect, event.clientX, event.clientY, HOVER_REACH) ? current : null;
}

type TableTargetState = {
  target: TableTarget | null;
  layout: TableLayout | null;
  setHover: Dispatch<SetStateAction<TableTarget | null>>;
};

/** The table cell the controls attach to: the hovered cell, else the caret's cell while editing or while a grip is held. */
export function useTableTarget(
  editor: Editor | null,
  container: RefObject<HTMLDivElement | null>,
  controls: RefObject<HTMLDivElement | null>,
  enabled: boolean,
  holding: boolean,
): TableTargetState {
  const [hover, setHover] = useState<TableTarget | null>(null);
  const [revision, setRevision] = useState(0);
  const [layout, setLayout] = useState<TableLayout | null>(null);
  const holdingRef = useRef(holding);
  holdingRef.current = holding;

  useEffect(() => {
    const surface = container.current;
    if (!editor || editor.isDestroyed || !surface || !enabled) return;
    const { view } = editor;
    let frame = 0;
    let latest: MouseEvent | null = null;
    const insideControls = (node: unknown) => node instanceof Node && controls.current?.contains(node) === true;
    function follow(event: MouseEvent) {
      if (holdingRef.current || insideControls(event.target)) return;
      setHover((current) => hoverFor(view, current, event));
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
    function transacted({ transaction }: { transaction: Transaction }) {
      if (transaction.docChanged) setHover((current) => mapTarget(current, transaction));
      remeasure();
    }
    surface.addEventListener("mousemove", track);
    surface.addEventListener("mouseleave", leave);
    surface.addEventListener("scroll", remeasure, { capture: true, passive: true });
    window.addEventListener("resize", remeasure);
    editor.on("transaction", transacted).on("focus", remeasure).on("blur", remeasure);
    return () => {
      cancelAnimationFrame(frame);
      surface.removeEventListener("mousemove", track);
      surface.removeEventListener("mouseleave", leave);
      surface.removeEventListener("scroll", remeasure, { capture: true });
      window.removeEventListener("resize", remeasure);
      editor.off("transaction", transacted).off("focus", remeasure).off("blur", remeasure);
    };
  }, [editor, container, controls, enabled]);

  const live = editor && !editor.isDestroyed && enabled;
  const caret = live && (editor.isFocused || holding) ? tableTargetFrom(editor.state.selection.$from) : null;
  const target = live ? (hover ?? caret) : null;
  const tablePos = target?.tablePos;
  const row = target?.row;
  const column = target?.column;

  // biome-ignore lint/correctness/useExhaustiveDependencies: revision re-measures after scroll, resize and edits
  useLayoutEffect(() => {
    const surface = container.current;
    const table = editor && tablePos !== undefined ? tableElement(editor.view, tablePos) : null;
    if (!(surface && table && row !== undefined && column !== undefined && tablePos !== undefined)) {
      setLayout(null);
      return;
    }
    setLayout(measureTable(surface, table, { tablePos, row, column }));
  }, [editor, container, tablePos, row, column, revision]);

  return { target: layout ? target : null, layout, setHover };
}
