import type { IconSvgElement } from "@hugeicons/react";
import type { PrimitiveCategoryId } from "@/app/(features)/catalog/primitives";
import type {
  ActivePageId,
  DocsBlock,
  DocsComponent,
  DocsExtension,
  DocsHook,
  DocsPrimitive,
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
  githubStars: number | null;
  guides: GuidePage[];
  skills: readonly DocsSkill[];
  skillConcerns: readonly DocsSkillConcern[];
  components: DocsComponent[];
  blocks: DocsBlock[];
  primitives: DocsPrimitive[];
  hooks: DocsHook[];
  utils: DocsUtil[];
  extensions: DocsExtension[];
  skinPages: DocsSkinPage[];
  searchItems: SearchItem[];
};

export type CatalogNavGroupId = "agents" | PrimitiveCategoryId | "hooks" | "utils" | "extensions";
export type SidebarDoorId = "use-cases" | "practices" | "reference" | "theme-editor";
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
  status?: DocsStatus;
};
