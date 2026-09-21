import {
  AiGenerativeIcon,
  BlocksIcon,
  BlurIcon,
  Book04Icon,
  BubbleChatIcon,
  CodeSquareIcon,
  ContractsIcon,
  CustomizeIcon,
  FormIcon,
  FunctionSquareIcon,
  HierarchyIcon,
  Layers01Icon,
  Layout01Icon,
  MagicWand01Icon,
  MouseLeftClick01Icon,
  Navigation01Icon,
  Notification01Icon,
  PaintBrush01Icon,
  PlusSignSquareIcon,
  TextFontIcon,
  ViewIcon,
  WebDesign01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import type { UseCaseKindId } from "@/app/(features)/catalog/blocks";
import { referenceGroupTitle, referenceOverview } from "@/app/(features)/catalog/guides";
import { catalogOverview } from "@/app/(features)/catalog/overviews";
import { skillPageIds } from "@/app/(features)/model/page-ids";
import type { DocsSkillConcern } from "@/app/(features)/model/types";
import { THEME_EDITOR_PATH } from "@/components/theme-drawer/theme-categories";
import type { CatalogNavGroupId, SidebarDoor } from "./types";

export const skillConcernSidebarIcons = {
  "css-first": WebDesign01Icon,
  "react-code-quality": CodeSquareIcon,
  architecture: HierarchyIcon,
  "ui-tailwind": PaintBrush01Icon,
  ux: MagicWand01Icon,
  "control-ui": AiGenerativeIcon,
} as const satisfies Record<DocsSkillConcern["id"], IconSvgElement>;

export const catalogNavGroupIcons = {
  chat: BubbleChatIcon,
  actions: MouseLeftClick01Icon,
  forms: FormIcon,
  overlays: Layers01Icon,
  navigation: Navigation01Icon,
  feedback: Notification01Icon,
  layout: Layout01Icon,
  display: ViewIcon,
  content: TextFontIcon,
  effects: BlurIcon,
  hooks: FunctionSquareIcon,
  utils: ContractsIcon,
  extensions: PlusSignSquareIcon,
} as const satisfies Record<CatalogNavGroupId, IconSvgElement>;

const useCasesOverview = catalogOverview("use-cases");

export const sidebarDoors = [
  { id: "use-cases", title: useCasesOverview.name, icon: BlocksIcon, href: useCasesOverview.href, overviewId: useCasesOverview.id },
  { id: "practices", title: "Practices", icon: Book04Icon, href: `/skills/${skillPageIds[0]}` },
  { id: "reference", title: referenceGroupTitle, icon: HierarchyIcon, href: `/${referenceOverview.id}`, overviewId: referenceOverview.id },
] as const satisfies readonly SidebarDoor[];

export const themeEditorDoor = {
  id: "theme-editor",
  title: "Theme editor",
  icon: CustomizeIcon,
  href: THEME_EDITOR_PATH,
} as const satisfies SidebarDoor;

export const useCaseKindSidebarIcons = {
  template: Layout01Icon,
  pattern: BlocksIcon,
} as const satisfies Record<UseCaseKindId, IconSvgElement>;
