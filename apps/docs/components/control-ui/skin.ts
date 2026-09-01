import type { ReactNode } from "react";
import type { SelectionIndicator } from "@/components/control-ui/control-props";
import type { ControlTone, ControlVariant } from "@/components/control-ui/control-variants";
// Missing module = no skin installed yet; any skin pack creates it: npx shadcn add <registry>/r/skin-<id>.json
import { skin } from "./skin.config";

type StatelessPart = Record<never, never>;
export type SkinAdornmentContexts = {
  button: { layer: { variant: ControlVariant; tone: ControlTone } };
  "chat-layout": { titlebar: StatelessPart };
  "chat-thought": { details: StatelessPart };
  dialog: { titlebar: StatelessPart };
  "chat-composer": { "send-layer": { sendCount: number } };
};

export type SkinAdornmentScope = keyof SkinAdornmentContexts;
export type SkinAdornmentPart<Scope extends SkinAdornmentScope> = keyof SkinAdornmentContexts[Scope];

type AdornmentEntry<Ctx> = ReactNode | ((ctx: Ctx) => ReactNode);

export type ControlUiSkin = {
  /** Scopes theme.css/skin.css via data-skin; components stamp it on portal containers. */
  id: string;
  /** Stamps data-motion="reduced", collapsing --duration-* to 0ms. Never `animation:none` — ripple cleanup still needs `animationend` to fire. */
  motion?: "reduced";
  /** Locks skin to one scheme; page's .dark class must then follow it, since Shiki, native color-scheme, and dark: utilities key off .dark, not skin tokens. Undefined = adaptive, both blocks authored. */
  colorScheme?: "light" | "dark";
  /** Geometry, not slot restyle — padding, gap, rounding, and shadow across sidebar gap/container/inner. explicit `variant` prop wins; undefined keeps "sidebar". */
  sidebarLayout?: SidebarLayout;
  /** App-wide choice: sidebars and trees all glide or none do. Explicit `indicator` still wins; undefined also skips highlight engine's lazy chunk. */
  indicators?: { sidebar?: SelectionIndicator; tree?: SelectionIndicator };
  /** Any CSS length. Seeds --sidebar-width; caller's own value still wins. Undefined keeps shadcn's 16rem. */
  sidebarWidth?: string;
  /** effects.css keys off data-effects ancestor attribute. top-shine is CSS-only; ripple needs runtime's document pointer listener. */
  effects?: ControlEffect[];
  adornments?: {
    [Scope in SkinAdornmentScope]?: {
      [Part in SkinAdornmentPart<Scope>]?: AdornmentEntry<SkinAdornmentContexts[Scope][Part]>;
    };
  };
};

export type SidebarLayout = "sidebar" | "floating" | "inset";

export type ControlEffect = "top-shine" | "ripple" | "hover-circle";

export type ControlEffectValue = ControlEffect | ControlEffect[];

export function controlEffectsAttribute(effects?: ControlEffectValue): string | undefined {
  if (!effects) return undefined;
  const value = (Array.isArray(effects) ? effects : [effects]).join(" ");
  return value.length > 0 ? value : undefined;
}

/** Read at render time so getter-based configs stay live. Portals stamp it on their positioner, which lands outside any token-scoped ancestor. */
export function activeSkin(): ControlUiSkin {
  return skin;
}

const verifiedSkinIds = new Set<string>();

/**
 * A skin id no element carries, or a skin-theme.css that never loaded, leaves every token undeclared and the app
 * renders unstyled with no error. Next and Vite replace NODE_ENV, so this whole branch drops out of a production build.
 */
function verifySkinScope(id: string): void {
  if (process.env.NODE_ENV === "production" || typeof document === "undefined" || verifiedSkinIds.has(id)) return;
  verifiedSkinIds.add(id);
  // React commits the boundary after the render that read the id, so a microtask would look before it exists.
  setTimeout(() => {
    const boundary = document.querySelector<HTMLElement>(`[data-skin="${id}"]`);
    if (!boundary) {
      // biome-ignore lint/suspicious/noConsole: the misconfiguration is invisible in the UI, so dev needs the console.
      console.error(
        `Control UI: skin.config id is "${id}" but no element carries data-skin="${id}" (root has ${JSON.stringify(document.documentElement.dataset.skin ?? null)}); every token is undeclared until they match.`,
      );
      return;
    }
    if (getComputedStyle(boundary).getPropertyValue("--background").trim()) return;
    // biome-ignore lint/suspicious/noConsole: the misconfiguration is invisible in the UI, so dev needs the console.
    console.error(
      `Control UI: skin-theme.css declares no tokens for data-skin="${id}"; check the CSS entry imports (../components/control-ui/styles/skin-theme.css) or run scripts/control-ui-doctor.mjs.`,
    );
  }, 0);
}

export function skinId(): string {
  verifySkinScope(skin.id);
  return skin.id;
}

/** Sidebar falls back: variant prop → this → "sidebar". */
export function skinSidebarLayout(): SidebarLayout | undefined {
  return skin.sidebarLayout;
}

/** Component falls back: indicator prop → this → "none". */
export function skinIndicator(component: "sidebar" | "tree"): SelectionIndicator | undefined {
  return skin.indicators?.[component];
}

/** SidebarProvider seeds --sidebar-width from this; caller-provided value still wins. */
export function skinSidebarWidth(): string | undefined {
  return skin.sidebarWidth;
}

/** Portals stamp result next to data-skin; ControlEffectsRuntime mirrors it on <html>. */
export function skinEffects(): string | undefined {
  return controlEffectsAttribute(skin.effects);
}

function resolveAdornment<Ctx>(entry: AdornmentEntry<Ctx> | undefined, ctx: Ctx): ReactNode | undefined {
  if (entry === undefined) return undefined;
  return typeof entry === "function" ? entry(ctx) : entry;
}

export function skinAdornment<Scope extends SkinAdornmentScope, Part extends SkinAdornmentPart<Scope>>(
  scope: Scope,
  part: Part,
  ctx: SkinAdornmentContexts[Scope][Part],
): ReactNode | undefined {
  return resolveAdornment(skin.adornments?.[scope]?.[part], ctx);
}

export function hasSkinAdornment<Scope extends SkinAdornmentScope, Part extends SkinAdornmentPart<Scope>>(
  scope: Scope,
  part: Part,
): boolean {
  return skin.adornments?.[scope]?.[part] !== undefined;
}
