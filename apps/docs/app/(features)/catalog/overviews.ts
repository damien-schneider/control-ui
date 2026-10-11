export const catalogOverviews = [
  {
    id: "primitives",
    label: "Library",
    name: "Components",
    summary: "Every Control UI component, grouped by what the control does, through the same live examples used in its documentation.",
    kind: "Primitive",
    href: "/components",
  },
  {
    id: "components",
    label: "Library",
    name: "Kits",
    summary:
      "Pre-assembled sets of components, grouped by the part of the product they build: the chat screen, agent activity, voice capture, and the notification, email, and configuration surfaces around them.",
    kind: "Component",
    href: "/kits",
  },
  {
    id: "use-cases",
    label: "Library",
    name: "Templates & patterns",
    summary: "Start from complete workspace templates or focused interaction patterns, then own and adapt the installed source.",
    kind: "Block",
    href: "/use-cases",
  },
] as const;

export type CatalogOverviewId = (typeof catalogOverviews)[number]["id"];

export function catalogOverview(id: CatalogOverviewId) {
  const overview = catalogOverviews.find((item) => item.id === id);
  if (!overview) throw new Error(`Unknown catalog overview: ${id}`);
  return overview;
}
