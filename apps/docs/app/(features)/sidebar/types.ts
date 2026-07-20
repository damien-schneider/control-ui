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
  IntegrationId,
  SearchItem,
  SetupPreferenceUpdate,
} from "@/app/(features)/model/types";

export type DocsSidebarContentProps = {
  active: ActivePageId;
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
  integration: IntegrationId;
  updateSetupPreference: (nextPreference: SetupPreferenceUpdate) => void;
};

export type SidebarMode = "agents" | "primitives" | "use-cases" | "skills";
export type DocsNavItem = {
  id: string;
  name: string;
  status?: DocsStatus;
};
