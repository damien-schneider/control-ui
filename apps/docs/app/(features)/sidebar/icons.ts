import {
  AiGenerativeIcon,
  BlocksIcon,
  Book04Icon,
  CodeSquareIcon,
  ComponentIcon,
  ContractsIcon,
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
  ViewIcon,
  WebDesign01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import type { UseCaseKindId } from "@/app/(features)/catalog/blocks";
import { referenceGroupTitle, referenceOverview } from "@/app/(features)/catalog/guides";
import { catalogOverview } from "@/app/(features)/catalog/overviews";
import type { PrimitiveCategoryId } from "@/app/(features)/catalog/primitives";
import type { DocsSkillConcern } from "@/app/(features)/model/types";
import type { SidebarDoor, SidebarMode } from "./types";

export const skillConcernSidebarIcons = {
  "css-first": WebDesign01Icon,
  "react-code-quality": CodeSquareIcon,
  architecture: HierarchyIcon,
  "ui-tailwind": PaintBrush01Icon,
  ux: MagicWand01Icon,
  "control-ui": AiGenerativeIcon,
} as const satisfies Record<DocsSkillConcern["id"], IconSvgElement>;

export const primitiveCategorySidebarIcons = {
  layout: Layout01Icon,
  actions: MouseLeftClick01Icon,
  forms: FormIcon,
  navigation: Navigation01Icon,
  overlays: Layers01Icon,
  feedback: Notification01Icon,
  display: ViewIcon,
} as const satisfies Record<PrimitiveCategoryId, IconSvgElement>;

const useCasesOverview = catalogOverview("use-cases");

export const sidebarDoors = [
  { id: "use-cases", title: useCasesOverview.name, icon: BlocksIcon, overviewId: useCasesOverview.id },
  { id: "practices", title: "Practices", icon: Book04Icon },
  { id: "reference", title: referenceGroupTitle, icon: HierarchyIcon, overviewId: referenceOverview.id },
] as const satisfies readonly SidebarDoor[];

export const sidebarGroupIcons = {
  agents: AiGenerativeIcon,
  primitives: ComponentIcon,
  hooks: FunctionSquareIcon,
  utils: ContractsIcon,
  extensions: PlusSignSquareIcon,
} as const satisfies Record<string, IconSvgElement>;

export const useCaseKindSidebarIcons = {
  template: Layout01Icon,
  pattern: BlocksIcon,
} as const satisfies Record<UseCaseKindId, IconSvgElement>;

export const sidebarModes = [
  { id: "agents", label: "Components", icon: AiGenerativeIcon },
  { id: "primitives", label: "Primitives", icon: ComponentIcon },
] as const satisfies readonly {
  id: SidebarMode;
  label: string;
  icon: IconSvgElement;
}[];
