"use client";

import { lazy, Suspense } from "react";
import { useThemeRuntime } from "./theme-runtime-context";

const LiquidMetalSkinRuntime = lazy(() =>
  import("@/src/registry/skin-packs/liquid-metal/liquid-metal-runtime").then((module) => ({ default: module.LiquidMetalSkinRuntime })),
);

const SketchStrokeRuntime = lazy(() =>
  import("@/src/registry/skin-packs/sketch/sketch-stroke-runtime").then((module) => ({ default: module.SketchStrokeRuntime })),
);

export function SkinRuntimeEffects() {
  const { t } = useThemeRuntime();
  if (t.skin !== "liquid-metal" && t.skin !== "sketch") return null;
  return <Suspense fallback={null}>{t.skin === "sketch" ? <SketchStrokeRuntime /> : <LiquidMetalSkinRuntime />}</Suspense>;
}
