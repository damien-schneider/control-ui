"use client";

import { createContext, type ReactNode, useContext, useLayoutEffect } from "react";
import { type ControlUiSkin, type SkinAdornmentContexts, type SkinAdornmentPart, type SkinAdornmentScope, skinAdornment } from "./skin";

const defaultSkin: ControlUiSkin = {};
const SkinContext = createContext(defaultSkin);

export type SkinProviderProps = { skin: ControlUiSkin; children: ReactNode };

export type SkinAdornmentProps<Scope extends SkinAdornmentScope, Part extends SkinAdornmentPart<Scope>> = {
  scope: Scope;
  part: Part;
  context: SkinAdornmentContexts[Scope][Part];
};

function reduceRootMotion(root: HTMLElement) {
  if (root.getAttribute("data-motion") === "reduced") return undefined;
  root.setAttribute("data-motion", "reduced");
  return () => root.removeAttribute("data-motion");
}

function lockRootColorScheme(root: HTMLElement, colorScheme: "light" | "dark") {
  const dark = colorScheme === "dark";
  let requestedDark = root.classList.contains("dark");
  const enforce = () => {
    const current = root.classList.contains("dark");
    if (current === dark) return;
    requestedDark = current;
    root.classList.toggle("dark", dark);
  };
  enforce();
  const observer = new MutationObserver(enforce);
  observer.observe(root, { attributes: true, attributeFilter: ["class"] });
  return () => {
    observer.disconnect();
    // a theme manager that already moved the page off the locked mode owns the class again; restoring would undo it
    if (root.classList.contains("dark") === dark) root.classList.toggle("dark", requestedDark);
  };
}

// A skin installed on <html> declares page-wide intents no stylesheet can derive from data-skin alone. Nested
// scopes carry motion through skinScopeAttributes instead; a fixed color scheme only exists at the root.
function useRootSkinScope({ id, motion, colorScheme }: ControlUiSkin) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (!id || root.getAttribute("data-skin") !== id) return undefined;
    const restoreMotion = motion === "reduced" ? reduceRootMotion(root) : undefined;
    const unlockColorScheme = colorScheme ? lockRootColorScheme(root, colorScheme) : undefined;
    return () => {
      restoreMotion?.();
      unlockColorScheme?.();
    };
  }, [id, motion, colorScheme]);
}

export function SkinProvider({ skin, children }: SkinProviderProps) {
  useRootSkinScope(skin);
  return <SkinContext value={skin}>{children}</SkinContext>;
}

export function useSkin(): ControlUiSkin {
  return useContext(SkinContext);
}

export function SkinAdornment<Scope extends SkinAdornmentScope, Part extends SkinAdornmentPart<Scope>>({
  scope,
  part,
  context,
}: SkinAdornmentProps<Scope, Part>) {
  const skin = useSkin();
  return skinAdornment(skin, scope, part, context);
}
