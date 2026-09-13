"use client";

import { createContext, type ReactNode, useContext } from "react";
import { type ControlUiSkin, type SkinAdornmentContexts, type SkinAdornmentPart, type SkinAdornmentScope, skinAdornment } from "./skin";

const defaultSkin: ControlUiSkin = {};
const SkinContext = createContext(defaultSkin);

export function SkinProvider({ skin, children }: { skin: ControlUiSkin; children: ReactNode }) {
  return <SkinContext value={skin}>{children}</SkinContext>;
}

export function useSkin(): ControlUiSkin {
  return useContext(SkinContext);
}

export function SkinAdornment<Scope extends SkinAdornmentScope, Part extends SkinAdornmentPart<Scope>>({
  scope,
  part,
  context,
}: {
  scope: Scope;
  part: Part;
  context: SkinAdornmentContexts[Scope][Part];
}) {
  const skin = useSkin();
  return skinAdornment(skin, scope, part, context);
}
