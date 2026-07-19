export const catalogOverviews = [
  {
    id: "primitives",
    label: "Library",
    name: "Primitives",
    summary: "Browse every Control UI primitive through the same live examples used in its documentation.",
    kind: "Primitive",
    href: "/primitives",
  },
  {
    id: "ai",
    label: "Library",
    name: "AI components",
    summary: "Explore composable surfaces for messages, input, activity, media, and agent workflows.",
    kind: "Agent",
    href: "/ai",
  },
] as const;

export type CatalogOverviewId = (typeof catalogOverviews)[number]["id"];

export function catalogOverview(id: CatalogOverviewId) {
  const overview = catalogOverviews.find((item) => item.id === id);
  if (!overview) throw new Error(`Unknown catalog overview: ${id}`);
  return overview;
}
