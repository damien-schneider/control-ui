export const popupItemStructureClasses = "flex select-none items-center";

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
