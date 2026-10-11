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
  DocsSkinPage,
  DocsStatus,
  DocsUtil,
  GuidePage,
  SearchItem,
} from "@/app/(features)/model/types";

export type DocsSidebarContentProps = {
  active: ActivePageId | undefined;
  guides: GuidePage[];
  skills: readonly DocsSkill[];
  skillConcerns: readonly DocsSkillConcern[];
  kits: DocsKit[];
  blocks: DocsBlock[];
  components: DocsComponent[];
  hooks: DocsHook[];
  utils: DocsUtil[];
  extensions: DocsExtension[];
  skinPages: DocsSkinPage[];
  searchItems: SearchItem[];
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
