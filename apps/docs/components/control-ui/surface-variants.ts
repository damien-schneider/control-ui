export const popupItemStructureClasses = "flex min-h-[var(--control-h-xs)] select-none items-center gap-2";

export const popupParts = [
  "backdrop",
  "surface",
  "list-surface",
  "list-content",
  "bar",
  "item",
  "navigation-link",
  "label",
  "separator",
  "shortcut",
] as const;

export type PopupPart = (typeof popupParts)[number];
