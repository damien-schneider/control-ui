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
  Home05Icon,
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
import type { PrimitiveCategoryId } from "@/app/(features)/catalog/primitives";
import type { DocsSkillConcern } from "@/app/(features)/model/types";
import type { SidebarMode } from "./types";

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

export const sidebarGroupIcons = {
  guides: Home05Icon,
  agents: AiGenerativeIcon,
  primitives: ComponentIcon,
  hooks: FunctionSquareIcon,
  utils: ContractsIcon,
  extensions: PlusSignSquareIcon,
  skins: PaintBrush01Icon,
} as const satisfies Record<string, IconSvgElement>;

export const useCaseKindSidebarIcons = {
  template: Layout01Icon,
  pattern: BlocksIcon,
} as const satisfies Record<UseCaseKindId, IconSvgElement>;

export const sidebarModes = [
  { id: "primitives", label: "Primitives", icon: ComponentIcon },
  { id: "agents", label: "AI", icon: AiGenerativeIcon },
  { id: "use-cases", label: "Use cases", icon: BlocksIcon },
  { id: "skills", label: "Skills", icon: Book04Icon },
] as const satisfies readonly {
  id: SidebarMode;
  label: string;
  icon: IconSvgElement;
}[];
