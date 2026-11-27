import type { ComponentItem } from "@/app/(features)/home/home-content";
import type { ComponentId } from "@/app/(features)/model/types";

export type AtlasRect = { x: number; y: number; width: number; height: number };

export type AtlasSize = { width: number; height: number };

export type AtlasView = { x: number; y: number; scale: number };

export type AtlasNode = AtlasRect & { item: ComponentItem; featured: boolean };

export const ATLAS_DEFAULT_VIEW: AtlasView = { x: 0, y: 0, scale: 1 };

export const ATLAS_OPENING_VIEWPORT: AtlasSize = { width: 1150, height: 760 };

export const ATLAS_LABEL_HEIGHT = 24;

export const ATLAS_TILE: AtlasSize = { width: 288, height: 208 };

const CELL: AtlasSize = { width: 320, height: 270 };

const FEATURED_BLOCK = { columns: 5, rows: 3 };

const featuredPlacements = [
  { id: "channel-strip", x: 24, y: 46, width: 232, height: 316 },
  { id: "flow", x: 276, y: 28, width: 340, height: 250 },
  { id: "color-picker", x: 636, y: 44, width: 272, height: 312 },
  { id: "emoji-picker", x: 1004, y: 176, width: 286, height: 234 },
  { id: "command", x: 296, y: 312, width: 300, height: 214 },
  { id: "rich-tooltip", x: 636, y: 376, width: 250, height: 180 },
  { id: "tree", x: 24, y: 422, width: 232, height: 241 },
  { id: "code-diff", x: 296, y: 578, width: 470, height: 230 },
  { id: "chart", x: 822, y: 612, width: 270, height: 197 },
  { id: "timeline", x: 968, y: 430, width: 300, height: 162 },
  { id: "input-otp", x: 24, y: 684, width: 252, height: 56 },
] as const satisfies readonly ({ id: ComponentId } & AtlasRect)[];

export const atlasFeaturedIds: readonly string[] = featuredPlacements.map((placement) => placement.id);

export type AtlasFeaturedId = (typeof featuredPlacements)[number]["id"];

export function isAtlasFeaturedId(id: string): id is AtlasFeaturedId {
  return featuredPlacements.some((placement) => placement.id === id);
}

function distanceOutside(index: number, span: number) {
  if (index < 0) return -index;
  return Math.max(0, index - span + 1);
}

function surroundingCells(count: number) {
  const cells: { x: number; y: number; ring: number; offset: number }[] = [];
  const center = { x: (FEATURED_BLOCK.columns - 1) / 2, y: (FEATURED_BLOCK.rows - 1) / 2 };
  for (let ring = 1; cells.length < count; ring += 1) {
    for (let row = -ring; row < FEATURED_BLOCK.rows + ring; row += 1) {
      for (let column = -ring; column < FEATURED_BLOCK.columns + ring; column += 1) {
        const cellRing = Math.max(distanceOutside(column, FEATURED_BLOCK.columns), distanceOutside(row, FEATURED_BLOCK.rows));
        if (cellRing !== ring) continue;
        cells.push({
          x: column * CELL.width,
          y: row * CELL.height,
          ring,
          offset: Math.hypot((column - center.x) * CELL.width, (row - center.y) * CELL.height),
        });
      }
    }
  }
  return cells.toSorted((a, b) => a.ring - b.ring || a.offset - b.offset).slice(0, count);
}

export function buildAtlasNodes(items: readonly ComponentItem[]): AtlasNode[] {
  const featured = new Map<string, AtlasRect>(featuredPlacements.map((placement) => [placement.id, placement]));
  const tiles = items.filter((item) => !featured.has(item.id));
  const cells = surroundingCells(tiles.length);
  const tileNodes = tiles.flatMap((item, index) => {
    const cell = cells[index];
    if (!cell) return [];
    return [
      {
        item,
        featured: false,
        x: cell.x + (CELL.width - ATLAS_TILE.width) / 2,
        y: cell.y + (CELL.height - ATLAS_TILE.height - ATLAS_LABEL_HEIGHT) / 2,
        width: ATLAS_TILE.width,
        height: ATLAS_TILE.height + ATLAS_LABEL_HEIGHT,
      },
    ];
  });
  const featuredNodes = items.flatMap((item) => {
    const placement = featured.get(item.id);
    return placement ? [{ item, featured: true, x: placement.x, y: placement.y, width: placement.width, height: placement.height }] : [];
  });
  return [...featuredNodes, ...tileNodes];
}

export function atlasBounds(nodes: readonly AtlasRect[]): AtlasRect {
  const left = Math.min(...nodes.map((node) => node.x));
  const top = Math.min(...nodes.map((node) => node.y));
  const right = Math.max(...nodes.map((node) => node.x + node.width));
  const bottom = Math.max(...nodes.map((node) => node.y + node.height));
  return { x: left, y: top, width: right - left, height: bottom - top };
}

export function visibleWorld(view: AtlasView, viewport: AtlasSize): AtlasRect {
  return { x: -view.x / view.scale, y: -view.y / view.scale, width: viewport.width / view.scale, height: viewport.height / view.scale };
}

export function nodeIdsWithin(nodes: readonly AtlasNode[], area: AtlasRect, margin = 0) {
  return nodes.flatMap((node) => {
    const overlaps =
      node.x < area.x + area.width + margin &&
      node.x + node.width > area.x - margin &&
      node.y < area.y + area.height + margin &&
      node.y + node.height > area.y - margin;
    return overlaps ? [node.item.id] : [];
  });
}
