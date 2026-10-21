export type InfiniteCanvasTransform = { x: number; y: number; scale: number };

export type InfiniteCanvasPoint = { x: number; y: number };

export type InfiniteCanvasBounds = { x: number; y: number; width: number; height: number };

export type CanvasWheelInput = Pick<WheelEvent, "deltaMode" | "deltaX" | "deltaY" | "shiftKey">;

const MAX_CAMERA_OFFSET_PX = 10_000_000;
const WHEEL_LINE_HEIGHT_PX = 16;
const DOM_DELTA_LINE = 1;
const DOM_DELTA_PAGE = 2;

export function clampScale(scale: number, minScale: number, maxScale: number) {
  return Math.min(Math.max(scale, minScale), maxScale);
}

export function sameTransform(left: InfiniteCanvasTransform, right: InfiniteCanvasTransform) {
  return left.x === right.x && left.y === right.y && left.scale === right.scale;
}

export function boundedTransform(next: InfiniteCanvasTransform, minScale: number, maxScale: number): InfiniteCanvasTransform | null {
  if (!(Number.isFinite(next.x) && Number.isFinite(next.y) && Number.isFinite(next.scale)) || next.scale <= 0) return null;
  return {
    x: Math.min(Math.max(next.x, -MAX_CAMERA_OFFSET_PX), MAX_CAMERA_OFFSET_PX),
    y: Math.min(Math.max(next.y, -MAX_CAMERA_OFFSET_PX), MAX_CAMERA_OFFSET_PX),
    scale: clampScale(next.scale, minScale, maxScale),
  };
}

export function toWorldPoint(transform: InfiniteCanvasTransform, point: InfiniteCanvasPoint): InfiniteCanvasPoint {
  return { x: (point.x - transform.x) / transform.scale, y: (point.y - transform.y) / transform.scale };
}

export function zoomAroundPoint(
  transform: InfiniteCanvasTransform,
  nextScale: number,
  point: InfiniteCanvasPoint,
): InfiniteCanvasTransform {
  const world = toWorldPoint(transform, point);
  return { x: point.x - world.x * nextScale, y: point.y - world.y * nextScale, scale: nextScale };
}

export function pinchTransform(
  start: InfiniteCanvasTransform,
  startMidpoint: InfiniteCanvasPoint,
  midpoint: InfiniteCanvasPoint,
  nextScale: number,
): InfiniteCanvasTransform {
  const zoomed = zoomAroundPoint(start, nextScale, startMidpoint);
  return { x: zoomed.x + midpoint.x - startMidpoint.x, y: zoomed.y + midpoint.y - startMidpoint.y, scale: nextScale };
}

export function wheelDeltaMultiplier(deltaMode: number, pageHeight: number) {
  if (deltaMode === DOM_DELTA_LINE) return WHEEL_LINE_HEIGHT_PX;
  if (deltaMode === DOM_DELTA_PAGE) return pageHeight;
  return 1;
}

export function wheelDeltaPixels(event: CanvasWheelInput, pageHeight: number): InfiniteCanvasPoint {
  const multiplier = wheelDeltaMultiplier(event.deltaMode, pageHeight);
  const verticalAsHorizontal = event.shiftKey && event.deltaX === 0;
  return {
    x: (verticalAsHorizontal ? event.deltaY : event.deltaX) * multiplier,
    y: (verticalAsHorizontal ? 0 : event.deltaY) * multiplier,
  };
}

export function unionBounds(bounds: readonly InfiniteCanvasBounds[]): InfiniteCanvasBounds | null {
  if (bounds.length === 0) return null;
  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;
  for (const entry of bounds) {
    left = Math.min(left, entry.x);
    top = Math.min(top, entry.y);
    right = Math.max(right, entry.x + entry.width);
    bottom = Math.max(bottom, entry.y + entry.height);
  }
  return { x: left, y: top, width: right - left, height: bottom - top };
}

export function fitTransform(
  bounds: InfiniteCanvasBounds,
  area: InfiniteCanvasBounds,
  limits: { padding: number; minScale: number; maxScale: number },
): InfiniteCanvasTransform {
  const availableWidth = Math.max(1, area.width - limits.padding * 2);
  const availableHeight = Math.max(1, area.height - limits.padding * 2);
  const scale = clampScale(
    Math.min(availableWidth / Math.max(bounds.width, 1), availableHeight / Math.max(bounds.height, 1)),
    limits.minScale,
    limits.maxScale,
  );
  return {
    x: area.x + area.width / 2 - (bounds.x + bounds.width / 2) * scale,
    y: area.y + area.height / 2 - (bounds.y + bounds.height / 2) * scale,
    scale,
  };
}

function revealAxisOffset(start: number, size: number, areaStart: number, areaSize: number, padding: number) {
  const visibleStart = areaStart + padding;
  const visibleEnd = areaStart + areaSize - padding;
  if (size > visibleEnd - visibleStart || start < visibleStart) return visibleStart - start;
  if (start + size > visibleEnd) return visibleEnd - (start + size);
  return 0;
}

export function revealOffset(screenBounds: InfiniteCanvasBounds, area: InfiniteCanvasBounds, padding: number): InfiniteCanvasPoint {
  return {
    x: revealAxisOffset(screenBounds.x, screenBounds.width, area.x, area.width, padding),
    y: revealAxisOffset(screenBounds.y, screenBounds.height, area.y, area.height, padding),
  };
}
