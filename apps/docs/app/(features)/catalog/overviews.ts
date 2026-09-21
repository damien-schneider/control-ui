export const catalogOverviews = [
  {
    id: "primitives",
    label: "Library",
    name: "Primitives",
    summary: "Every Control UI primitive, grouped by what the control does, through the same live examples used in its documentation.",
    kind: "Primitive",
    href: "/primitives",
  },
  {
    id: "components",
    label: "Library",
    name: "Components",
    summary:
      "Composed surfaces above the primitives, grouped by the part of the product they build: the chat screen, agent activity, voice capture, and the notification, email, and configuration surfaces around them.",
    kind: "Component",
    href: "/components",
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
