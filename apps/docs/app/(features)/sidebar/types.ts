import type { IconSvgElement } from "@hugeicons/react";
import type { CatalogCategoryId } from "@/app/(features)/catalog/categories";
import type {
  ActivePageId,
  DocsBlock,
  DocsComponent,
  DocsExtension,
  DocsHook,
  DocsKit,
  DocsSkill,
  DocsSkillConcern,
  DocsStatus,
  DocsUtil,
  GuidePage,
  SearchItem,
} from "@/app/(features)/model/types";

export type DocsNavCatalog = {
  guides: readonly Pick<GuidePage, "id" | "name" | "group" | "hiddenFromNav">[];
  skills: readonly Pick<DocsSkill, "id" | "title" | "concern">[];
  skillConcerns: readonly DocsSkillConcern[];
  kits: readonly Pick<DocsKit, "id" | "category" | "name" | "status">[];
  blocks: readonly Pick<DocsBlock, "id" | "templateKind" | "name" | "status">[];
  components: readonly Pick<DocsComponent, "id" | "category" | "name" | "status">[];
  hooks: readonly Pick<DocsHook, "id" | "name">[];
  utils: readonly Pick<DocsUtil, "id" | "name">[];
  extensions: readonly Pick<DocsExtension, "id" | "name" | "status">[];
};

export type DocsSidebarContentProps = DocsNavCatalog & {
  active: ActivePageId | undefined;
  searchItems: SearchItem[];
  showRoot: boolean;
  onShowRoot: () => void;
};

export type CatalogNavGroupId = CatalogCategoryId | "hooks" | "utils" | "extensions";
export type SidebarDoorId = "templates" | "practices" | "reference" | "theme-editor";
export type SidebarPane = "root" | SidebarDoorId;
export type SidebarDoor = {
  id: SidebarDoorId;
  title: string;
  icon: IconSvgElement;
  href: string;
  overviewId?: ActivePageId;
};
export type DocsNavItem = {
  id: string;
  name: string;
  href: string;
  status?: DocsStatus;
};
