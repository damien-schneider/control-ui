export const catalogOverviews = [
  {
    id: "components",
    label: "Library",
    name: "Components",
    summary: "Every Control UI component, grouped by what the control does, through the same live examples used in its documentation.",
    kind: "Component",
    href: "/components",
  },
  {
    id: "kits",
    label: "Library",
    name: "Kits",
    summary:
      "Pre-assembled sets of components, grouped by the part of the product they build: the chat screen, agent activity, voice capture, and the notification, email, and configuration surfaces around them.",
    kind: "Kit",
    href: "/kits",
  },
  {
    id: "templates",
    label: "Library",
    name: "Templates",
    summary: "Start from complete workspace templates or focused interaction patterns, then own and adapt the installed source.",
    kind: "Block",
    href: "/templates",
  },
] as const;

export type CatalogOverviewId = (typeof catalogOverviews)[number]["id"];

export function catalogOverview(id: CatalogOverviewId) {
  const overview = catalogOverviews.find((item) => item.id === id);
  if (!overview) throw new Error(`Unknown catalog overview: ${id}`);
  return overview;
}
