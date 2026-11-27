"use client";

import type { ComponentProps } from "react";
import { cn } from "@/components/control-ui/lib/cn";
import { skinScopeAttributes } from "@/components/control-ui/skin";
import { useSkin } from "@/components/control-ui/skin-provider";
import { MODE_LOCKED_SKINS } from "@/components/theme";

export function DarkScope({ className, ...props }: ComponentProps<"div">) {
  const skin = useSkin();
  const hasDarkMode = !(skin.id && MODE_LOCKED_SKINS[skin.id] === "light");
  return <div {...props} {...skinScopeAttributes(skin)} className={cn(hasDarkMode && "dark scheme-dark", "text-foreground", className)} />;
}
