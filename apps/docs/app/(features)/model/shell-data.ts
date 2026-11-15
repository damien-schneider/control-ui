import { type PageOutline, pageOutline } from "@/app/(features)/client/page-links";
import { getDocsData } from "@/app/(features)/model/data";
import type { ActivePageId, SearchItem } from "@/app/(features)/model/types";
import { buildSearchItems } from "@/app/(features)/registry-api/search";
import type { DocsNavCatalog } from "@/app/(features)/sidebar/types";
import { objectFromEntries } from "@/lib/typed-object";

export type DocsShellData = {
  nav: DocsNavCatalog;
  searchItems: SearchItem[];
  pageOutlines: Record<ActivePageId, PageOutline>;
};

let docsShellData: DocsShellData | undefined;

export function getDocsShellData(): DocsShellData {
  if (docsShellData) return docsShellData;

  const data = getDocsData();
  const searchItems = buildSearchItems(data);
  docsShellData = {
    nav: {
      guides: data.guides.map(({ id, name, group, hiddenFromNav }) => ({ id, name, group, hiddenFromNav })),
      skills: data.skills.map(({ id, title, concern }) => ({ id, title, concern })),
      skillConcerns: data.skillConcerns,
      kits: data.kits.map(({ id, name, category, status }) => ({ id, name, category, status })),
      blocks: data.blocks.map(({ id, name, templateKind, status }) => ({ id, name, templateKind, status })),
      components: data.components.map(({ id, name, category, status }) => ({ id, name, category, status })),
      hooks: data.hooks.map(({ id, name }) => ({ id, name })),
      utils: data.utils.map(({ id, name }) => ({ id, name })),
      extensions: data.extensions.map(({ id, name, status }) => ({ id, name, status })),
    },
    searchItems,
    pageOutlines: objectFromEntries(searchItems.map((item) => [item.id, pageOutline(item.id, data)] as const)),
  };

  return docsShellData;
}
