export const catalogCategories = [
  {
    id: "chat",
    label: "Chat & agents",
    summary:
      "Everything that composes an AI conversation: the transcript, the composer and the surfaces that replace it, and what the agent is doing while you wait.",
  },
  { id: "actions", label: "Actions", summary: "Trigger a command, directly or from a menu of commands." },
  {
    id: "forms",
    label: "Forms",
    summary: "Capture a value from the user — typed, picked, toggled, or uploaded — plus the scaffolding that labels and validates it.",
  },
  {
    id: "overlays",
    label: "Overlays",
    summary:
      "A container whose only job is to float above the page. Anything floating that runs a command or captures a value is filed by that job instead.",
  },
  { id: "navigation", label: "Navigation", summary: "Move the user between views, steps, or pages." },
  { id: "feedback", label: "Feedback", summary: "Tell the user what just happened, what is loading, or what is missing." },
  {
    id: "layout",
    label: "Layout",
    summary: "Content-agnostic structure: regions, panels, wrappers, scrolling, resizing, and disclosure. It never knows what is inside.",
  },
  {
    id: "display",
    label: "Display",
    summary: "Render a data model you hand it: records, hierarchies, sequences, and the chips that label them.",
  },
  { id: "content", label: "Content", summary: "Render a document you authored or generated, from prose to code to email." },
  {
    id: "effects",
    label: "Effects",
    summary: "Shared visual behavior other components already use internally, published so you can apply it to your own markup.",
  },
] as const;

export type CatalogCategoryId = (typeof catalogCategories)[number]["id"];

export function categoriesWithEntries(entries: readonly { category: CatalogCategoryId }[]) {
  const used = new Set<CatalogCategoryId>(entries.map((entry) => entry.category));
  return catalogCategories.filter((category) => used.has(category.id));
}
