import type { KeyboardEvent, PointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  type DiffFile,
  type DiffLine,
  type DiffLinePoint,
  type DiffLineRange,
  diffLinePosition,
  linesInRange,
} from "@/components/control-ui/lib/diff";

export type DiffLineColumn = "unified" | "left" | "right";

// one line number a pointer or the keyboard can select; a split row has one per side
export type DiffLineTarget = { id: string; rowIndex: number; column: DiffLineColumn; point: DiffLinePoint; line: DiffLine };

type ElementRef = (node: HTMLElement | null) => (() => void) | undefined;

export type DiffLineButtonProps = {
  tabIndex: number;
  "aria-pressed": boolean;
  ref: ElementRef;
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  onFocus: () => void;
};

export type DiffLineSelection = {
  enabled: boolean;
  isSelected: (line: DiffLine) => boolean;
  buttonProps: (target: DiffLineTarget) => DiffLineButtonProps;
  lineRef: (target: DiffLineTarget) => ElementRef;
};

type Gesture = { ranges: DiffLineRange[]; anchor: DiffLinePoint | null; clearOnRelease: boolean };

type PressMode = "replace" | "add" | "extend";

const NO_RANGES: readonly DiffLineRange[] = [];

const VERTICAL_STEPS: Partial<Record<string, 1 | -1>> = { ArrowUp: -1, ArrowDown: 1 };

const SIDEWAYS_COLUMNS: Partial<Record<string, DiffLineColumn>> = { ArrowLeft: "left", ArrowRight: "right" };

const PRESS_KEYS: Partial<Record<string, true>> = { " ": true, Enter: true };

export function diffLineKey(line: DiffLine): string {
  return `${line.oldNo ?? ""}:${line.newNo ?? ""}`;
}

function orderedRange(file: DiffFile, from: DiffLinePoint, to: DiffLinePoint): DiffLineRange {
  return diffLinePosition(file, from) <= diffLinePosition(file, to) ? { from, to } : { from: to, to: from };
}

function isSingleLine(file: DiffFile, range: DiffLineRange, point: DiffLinePoint): boolean {
  const position = diffLinePosition(file, point);
  return diffLinePosition(file, range.from) === position && diffLinePosition(file, range.to) === position;
}

function contains(file: DiffFile, range: DiffLineRange, point: DiffLinePoint): boolean {
  const position = diffLinePosition(file, point);
  const from = diffLinePosition(file, range.from);
  const to = diffLinePosition(file, range.to);
  return position >= Math.min(from, to) && position <= Math.max(from, to);
}

function press(
  file: DiffFile,
  ranges: readonly DiffLineRange[],
  point: DiffLinePoint,
  mode: PressMode,
  anchor: DiffLinePoint | null,
): Gesture {
  const last = ranges.at(-1);
  if (mode === "extend" && last) {
    const from = anchor && contains(file, last, anchor) ? anchor : last.from;
    return { ranges: [...ranges.slice(0, -1), orderedRange(file, from, point)], anchor: from, clearOnRelease: false };
  }
  if (mode === "add") {
    const remaining = ranges.filter((range) => !isSingleLine(file, range, point));
    if (remaining.length < ranges.length) return { ranges: remaining, anchor: null, clearOnRelease: false };
    return { ranges: [...ranges, { from: point, to: point }], anchor: point, clearOnRelease: false };
  }
  const onlyThisLine = ranges.length === 1 && last !== undefined && isSingleLine(file, last, point);
  return { ranges: onlyThisLine ? [...ranges] : [{ from: point, to: point }], anchor: point, clearOnRelease: onlyThisLine };
}

function dragTo(file: DiffFile, gesture: Gesture, point: DiffLinePoint): Gesture {
  const { anchor } = gesture;
  if (!anchor) return gesture;
  return {
    ranges: [...gesture.ranges.slice(0, -1), orderedRange(file, anchor, point)],
    anchor,
    clearOnRelease: gesture.clearOnRelease && diffLinePosition(file, anchor) === diffLinePosition(file, point),
  };
}

// Shift+arrow grows the last range, or starts one at the line the focus leaves
function extendByKey(
  file: DiffFile,
  ranges: readonly DiffLineRange[],
  from: DiffLinePoint,
  to: DiffLinePoint,
  anchor: DiffLinePoint | null,
): Gesture {
  if (ranges.length > 0) return press(file, ranges, to, "extend", anchor);
  return { ranges: [orderedRange(file, from, to)], anchor: from, clearOnRelease: false };
}

function pressMode(event: { shiftKey: boolean; metaKey: boolean; ctrlKey: boolean }): PressMode {
  if (event.shiftKey) return "extend";
  return event.metaKey || event.ctrlKey ? "add" : "replace";
}

// targets are sorted by row, so the first one at or past a row is a binary search away
function firstTargetFrom(targets: readonly DiffLineTarget[], rowIndex: number): DiffLineTarget | undefined {
  let low = 0;
  let high = targets.length;
  while (low < high) {
    const middle = (low + high) >> 1;
    if ((targets[middle]?.rowIndex ?? 0) < rowIndex) low = middle + 1;
    else high = middle;
  }
  return targets[low];
}

function verticalNeighbor(targets: readonly DiffLineTarget[], current: DiffLineTarget, step: 1 | -1): DiffLineTarget | undefined {
  let index = targets.indexOf(current) + step;
  while (index >= 0 && index < targets.length) {
    const target = targets[index];
    if (target && target.column === current.column) return target;
    index += step;
  }
  return undefined;
}

export function useDiffLineSelection({
  file,
  targets,
  selectedLines = NO_RANGES,
  onSelectedLinesChange,
  firstRenderedRow,
  lastRenderedRow,
  revealRow,
}: {
  file: DiffFile;
  targets: readonly DiffLineTarget[];
  selectedLines?: readonly DiffLineRange[];
  onSelectedLinesChange?: (lines: DiffLineRange[]) => void;
  firstRenderedRow: number;
  lastRenderedRow: number;
  revealRow: (rowIndex: number) => void;
}): DiffLineSelection {
  const [gesture, setGesture] = useState<Gesture | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const anchor = useRef<DiffLinePoint | null>(null);
  const buttons = useRef(new Map<string, HTMLElement>());
  const lineTargets = useRef(new Map<Element, DiffLineTarget>());
  const pendingFocus = useRef<string | null>(null);
  const endDrag = useRef<(() => void) | null>(null);
  const ranges = gesture?.ranges ?? selectedLines;
  const selectedKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const range of ranges) for (const line of linesInRange(file, range)) keys.add(diffLineKey(line));
    return keys;
  }, [file, ranges]);
  const enabled = onSelectedLinesChange !== undefined;

  useEffect(() => {
    const id = pendingFocus.current;
    if (!id) return;
    const button = buttons.current.get(id);
    if (!button) return;
    pendingFocus.current = null;
    button.focus();
  });

  useEffect(() => () => endDrag.current?.(), []);

  const isRendered = (target: DiffLineTarget) => target.rowIndex >= firstRenderedRow && target.rowIndex <= lastRenderedRow;
  const active = activeId ? targets.find((target) => target.id === activeId) : undefined;
  const firstRendered = firstTargetFrom(targets, firstRenderedRow);
  const selectedRendered = firstRendered
    ? targets.slice(targets.indexOf(firstRendered)).find((target) => isRendered(target) && selectedKeys.has(diffLineKey(target.line)))
    : undefined;
  const tabStop = active && isRendered(active) ? active : (selectedRendered ?? firstRendered);

  function commit(next: DiffLineRange[], nextAnchor: DiffLinePoint | null) {
    anchor.current = nextAnchor;
    onSelectedLinesChange?.(next);
  }

  function focusTarget(target: DiffLineTarget) {
    setActiveId(target.id);
    const button = buttons.current.get(target.id);
    if (button) {
      button.focus();
      return;
    }
    pendingFocus.current = target.id;
    revealRow(target.rowIndex);
  }

  function commitGesture(finished: Gesture) {
    if (finished.clearOnRelease) commit([], null);
    else commit(finished.ranges, finished.anchor);
  }

  function release(finished: Gesture) {
    setGesture(null);
    commitGesture(finished);
  }

  function startDrag(started: Gesture) {
    let current = started;
    setGesture(started);
    const move = (event: globalThis.PointerEvent) => {
      const line = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-control-family="code-diff"][data-slot="line"]');
      const target = line ? lineTargets.current.get(line) : undefined;
      if (!target) return;
      const next = dragTo(file, current, target.point);
      if (next === current) return;
      current = next;
      setGesture(next);
    };
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", cancel);
      endDrag.current = null;
    };
    const finish = () => {
      stop();
      release(current);
    };
    const cancel = () => {
      stop();
      setGesture(null);
    };
    endDrag.current?.();
    endDrag.current = stop;
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", cancel);
  }

  function onPointerDown(event: PointerEvent<HTMLElement>, target: DiffLineTarget) {
    if (event.button !== 0) return;
    event.preventDefault();
    setActiveId(target.id);
    event.currentTarget.focus({ preventScroll: true });
    startDrag(press(file, ranges, target.point, pressMode(event), anchor.current));
  }

  function moveVertically(event: KeyboardEvent<HTMLElement>, target: DiffLineTarget, step: 1 | -1) {
    event.preventDefault();
    const next = verticalNeighbor(targets, target, step);
    if (!next) return;
    if (event.shiftKey) commitGesture(extendByKey(file, ranges, target.point, next.point, anchor.current));
    focusTarget(next);
  }

  function moveSideways(event: KeyboardEvent<HTMLElement>, target: DiffLineTarget, column: DiffLineColumn) {
    const next = targets.find((candidate) => candidate.rowIndex === target.rowIndex && candidate.column === column);
    if (target.column === "unified" || !next) return;
    event.preventDefault();
    focusTarget(next);
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>, target: DiffLineTarget) {
    const step = VERTICAL_STEPS[event.key];
    const column = SIDEWAYS_COLUMNS[event.key];
    if (step) moveVertically(event, target, step);
    else if (column) moveSideways(event, target, column);
    else if (PRESS_KEYS[event.key]) {
      event.preventDefault();
      commitGesture(press(file, ranges, target.point, event.metaKey || event.ctrlKey ? "add" : "replace", anchor.current));
    }
  }

  function buttonProps(target: DiffLineTarget): DiffLineButtonProps {
    return {
      tabIndex: target === tabStop ? 0 : -1,
      "aria-pressed": selectedKeys.has(diffLineKey(target.line)),
      ref: (node: HTMLElement | null) => {
        if (!node) return;
        buttons.current.set(target.id, node);
        return () => {
          buttons.current.delete(target.id);
        };
      },
      onPointerDown: (event: PointerEvent<HTMLElement>) => onPointerDown(event, target),
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => onKeyDown(event, target),
      onFocus: () => setActiveId(target.id),
    };
  }

  function lineRef(target: DiffLineTarget): ElementRef {
    return (node: HTMLElement | null) => {
      if (!node) return;
      lineTargets.current.set(node, target);
      return () => {
        lineTargets.current.delete(node);
      };
    };
  }

  return {
    enabled,
    isSelected: (line: DiffLine) => selectedKeys.has(diffLineKey(line)),
    buttonProps,
    lineRef,
  };
}
