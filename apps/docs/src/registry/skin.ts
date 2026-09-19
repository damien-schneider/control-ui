import type { ReactNode } from "react";
import type { HoverIndicator, SelectionIndicator } from "@/components/control-ui/control-props";
import type { ControlTone, ControlVariant } from "@/components/control-ui/control-variants";

type StatelessPart = Record<never, never>;
export type SkinAdornmentContexts = {
  button: { layer: { variant: ControlVariant; tone: ControlTone } };
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
};

export type ControlUiSkin = {
  id?: string;

  motion?: "reduced";

  colorScheme?: "light" | "dark";

  sidebarLayout?: SidebarLayout;
  scrollAreaBlur?: boolean;
  indicators?: SkinIndicators;

  sidebarWidth?: string;

  effects?: ControlEffect[];
  adornments?: {
    [Scope in SkinAdornmentScope]?: {
      [Part in SkinAdornmentPart<Scope>]?: AdornmentEntry<SkinAdornmentContexts[Scope][Part]>;
    };
  };
};

export type SidebarLayout = "sidebar" | "floating" | "inset" | "page";

export type ControlEffect = "top-shine" | "ripple" | "hover-circle";

export type ControlEffectValue = ControlEffect | ControlEffect[];

export function controlEffectsAttribute(effects?: ControlEffectValue): string | undefined {
  if (!effects) return undefined;
  const value = (Array.isArray(effects) ? effects : [effects]).join(" ");
  return value.length > 0 ? value : undefined;
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
