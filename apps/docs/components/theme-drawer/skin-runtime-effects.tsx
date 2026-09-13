"use client";

import { lazy, Suspense } from "react";
import { useThemeRuntime } from "./theme-runtime-context";

const LiquidMetalSkinRuntime = lazy(() =>
  import("@/src/registry/skin-packs/liquid-metal/liquid-metal-runtime").then((module) => ({ default: module.LiquidMetalSkinRuntime })),
);

export function SkinRuntimeEffects() {
  const { t } = useThemeRuntime();
  if (t.skin !== "liquid-metal") return null;
  return (
    <Suspense fallback={null}>
      <LiquidMetalSkinRuntime />
    </Suspense>
  );
}
