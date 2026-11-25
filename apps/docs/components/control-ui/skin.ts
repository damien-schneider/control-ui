import type { ComponentProps, ComponentType, ReactNode } from "react";
import type { HoverIndicator, SelectionIndicator } from "@/components/control-ui/control-props";
import type { ButtonVariant, ControlTone } from "@/components/control-ui/control-variants";

type StatelessPart = Record<never, never>;
export type SkinAdornmentContexts = {
  button: { layer: { variant: ButtonVariant; tone: ControlTone } };
  "chat-layout": { titlebar: StatelessPart };
  dialog: { titlebar: StatelessPart };
  "chat-composer": { "send-layer": { sendCount: number } };
};

export type SkinAdornmentScope = keyof SkinAdornmentContexts;
export type SkinAdornmentPart<Scope extends SkinAdornmentScope> = keyof SkinAdornmentContexts[Scope];

type AdornmentEntry<Ctx> = ReactNode | ((ctx: Ctx) => ReactNode);

export type SkinIndicators = {
  sidebar?: SelectionIndicator | HoverIndicator;
  tree?: SelectionIndicator;
  "button-group"?: HoverIndicator;
  "toggle-group"?: HoverIndicator;
  "checkbox-group"?: HoverIndicator;
  "radio-group"?: HoverIndicator;
};

export type SkinIconName =
  | "arrowDown"
  | "arrowLeft"
  | "arrowRight"
  | "arrowUp"
  | "chevronDown"
  | "chevronLeft"
  | "chevronRight"
  | "chevronUp"
  | "chevronsDownUp"
  | "chevronsUpDown"
  | "externalLink"
  | "menu"
  | "more"
  | "panelLeft"
  | "panelRight"
  | "pictureInPicture"
  | "check"
  | "close"
  | "copy"
  | "edit"
  | "eyeDropper"
  | "link"
  | "maximize"
  | "minus"
  | "plus"
  | "reply"
  | "rotate"
  | "search"
  | "stop"
  | "unlink"
  | "upload"
  | "cancelled"
  | "clock"
  | "error"
  | "info"
  | "neutral"
  | "noNewline"
  | "pending"
  | "permission"
  | "spinner"
  | "success"
  | "waiting"
  | "warning"
  | "agent"
  | "file"
  | "folder"
  | "globe"
  | "gripHorizontal"
  | "gripVertical"
  | "image"
  | "microphone"
  | "speaker"
  | "user"
  | "themeDark"
  | "themeLight"
  | "themeSystem"
  | "bold"
  | "bulletList"
  | "code"
  | "codeBlock"
  | "divider"
  | "heading1"
  | "heading2"
  | "heading3"
  | "italic"
  | "orderedList"
  | "paragraph"
  | "quote"
  | "redo"
  | "strikethrough"
  | "table"
  | "taskList"
  | "undo"
  | "emojiActivities"
  | "emojiFlags"
  | "emojiFood"
  | "emojiNature"
  | "emojiObjects"
  | "emojiOther"
  | "emojiPeople"
  | "emojiSmileys"
  | "emojiSymbols"
  | "emojiTravel"
  | "blend"
  | "cornerRadius"
  | "hidden"
  | "layers"
  | "properties"
  | "toolEllipse"
  | "toolFrame"
  | "toolHand"
  | "toolMove"
  | "toolRectangle"
  | "toolText"
  | "visible";

export type SkinIconProps = ComponentProps<"svg">;

export type SkinIconComponent = ComponentType<SkinIconProps>;

export type SkinIcons = Partial<Record<SkinIconName, SkinIconComponent>>;

export type ControlUiSkin = {
  id?: string;

  motion?: "reduced";

  colorScheme?: "light" | "dark";

  sidebarLayout?: SidebarLayout;
  scrollAreaBlur?: boolean;
  scrollAreaScrollbarVisibility?: "scroll" | "hover" | "always";
  scrollAreaScrollbarGutter?: "auto" | "stable";
  scrollAreaScrollbarButtons?: boolean;
  selectAlignItemWithTrigger?: boolean;
  calendarShowOutsideDays?: boolean;
  buttonGroupJoin?: ButtonGroupJoin;
  indicators?: SkinIndicators;
  icons?: SkinIcons;

  effects?: readonly ControlEffect[];
  adornments?: {
    [Scope in SkinAdornmentScope]?: {
      [Part in SkinAdornmentPart<Scope>]?: AdornmentEntry<SkinAdornmentContexts[Scope][Part]>;
    };
  };
};

export type SidebarLayout = "sidebar" | "floating" | "inset" | "page";

export type ButtonGroupJoin = "frame" | "overlap";

export type ControlEffect = "top-shine" | "ripple" | "hover-circle";

export type ControlEffectValue = ControlEffect | readonly ControlEffect[];

export function controlEffectsAttribute(effects?: ControlEffectValue): string | undefined {
  if (!effects) return undefined;
  const value = typeof effects === "string" ? effects : effects.join(" ");
  return value.length > 0 ? value : undefined;
}

export type SkinScopeAttributes = {
  "data-skin"?: string;
  "data-effects"?: string;
  "data-motion"?: "reduced";
};

// Everything a skin boundary carries as attributes, so a wrapper or a portalled surface re-creates the scope with one
// spread. colorScheme is absent on purpose: the page mode is the root `dark` class, which no descendant can undo.
export function skinScopeAttributes(skin: ControlUiSkin): SkinScopeAttributes {
  const attributes: SkinScopeAttributes = {};
  if (skin.id) attributes["data-skin"] = skin.id;
  const effects = controlEffectsAttribute(skin.effects);
  if (effects) attributes["data-effects"] = effects;
  if (skin.motion) attributes["data-motion"] = skin.motion;
  return attributes;
}

function resolveAdornment<Ctx>(entry: AdornmentEntry<Ctx> | undefined, ctx: Ctx): ReactNode | undefined {
  if (entry === undefined) return undefined;
  return typeof entry === "function" ? entry(ctx) : entry;
}

export function skinAdornment<Scope extends SkinAdornmentScope, Part extends SkinAdornmentPart<Scope>>(
  skin: ControlUiSkin,
  scope: Scope,
  part: Part,
  ctx: SkinAdornmentContexts[Scope][Part],
): ReactNode | undefined {
  return resolveAdornment(skin.adornments?.[scope]?.[part], ctx);
}

export function hasSkinAdornment<Scope extends SkinAdornmentScope, Part extends SkinAdornmentPart<Scope>>(
  skin: ControlUiSkin,
  scope: Scope,
  part: Part,
): boolean {
  return skin.adornments?.[scope]?.[part] !== undefined;
}
