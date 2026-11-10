import type { ReactNode } from "react";
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

export type ControlUiSkin = {
  id?: string;

  motion?: "reduced";

  colorScheme?: "light" | "dark";

  sidebarLayout?: SidebarLayout;
  scrollAreaBlur?: boolean;
  scrollAreaScrollbarVisibility?: "scroll" | "hover" | "always";
  scrollAreaScrollbarGutter?: "auto" | "stable";
  selectAlignItemWithTrigger?: boolean;
  calendarShowOutsideDays?: boolean;
  indicators?: SkinIndicators;

  effects?: readonly ControlEffect[];
  adornments?: {
    [Scope in SkinAdornmentScope]?: {
      [Part in SkinAdornmentPart<Scope>]?: AdornmentEntry<SkinAdornmentContexts[Scope][Part]>;
    };
  };
};

export type SidebarLayout = "sidebar" | "floating" | "inset" | "page";

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
