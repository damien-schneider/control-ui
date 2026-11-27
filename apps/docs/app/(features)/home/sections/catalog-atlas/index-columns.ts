import type { ComponentCategory, ComponentItem } from "@/app/(features)/home/home-content";

export type IndexGroup = { category: ComponentCategory; items: ComponentItem[]; continued: boolean };

const HEADING_ROWS = 2;

function groupRows(group: IndexGroup) {
  return group.items.length + (group.continued ? 0 : HEADING_ROWS);
}

function splitCategory(category: ComponentCategory, maxItems: number): IndexGroup[] {
  const parts = Math.ceil(category.items.length / maxItems);
  const perPart = Math.ceil(category.items.length / parts);
  return Array.from({ length: parts }, (_, part) => ({
    category,
    items: category.items.slice(part * perPart, (part + 1) * perPart),
    continued: part > 0,
  }));
}

export function packIndexColumns(categories: readonly ComponentCategory[]): IndexGroup[][] {
  const sizes = categories.map((category) => category.items.length).toSorted((a, b) => b - a);
  const maxItems = sizes[1] ?? sizes[0] ?? 0;
  const maxRows = maxItems + HEADING_ROWS;
  const columns: IndexGroup[][] = [];

  for (const category of categories) {
    const groups = splitCategory(category, maxItems);
    const [single] = groups;
    const open =
      groups.length === 1 && single
        ? columns.find((column) => column.reduce((rows, group) => rows + groupRows(group), 0) + groupRows(single) <= maxRows)
        : undefined;
    if (open && single) open.push(single);
    else columns.push(...groups.map((group) => [group]));
  }

  return columns;
}
