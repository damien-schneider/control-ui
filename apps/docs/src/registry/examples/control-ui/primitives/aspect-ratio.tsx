"use client";

import { useState } from "react";
import { AspectRatio } from "@/components/control-ui/ui/aspect-ratio";
import { Slider } from "@/components/control-ui/ui/slider";

const surfaceClassName =
  "flex items-center justify-center overflow-hidden rounded-[var(--radius-lg)] border bg-linear-to-br from-muted to-accent text-caption font-medium text-muted-foreground";

export function PrimitiveAspectRatioExample() {
  return (
    <div className="grid w-full max-w-md grid-cols-2 gap-4">
      <div className="flex flex-col gap-1.5">
        <div className={`${surfaceClassName} aspect-video`}>aspect-video</div>
        <span className="text-caption text-muted-foreground">Widescreen</span>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className={`${surfaceClassName} aspect-square`}>aspect-square</div>
        <span className="text-caption text-muted-foreground">Square</span>
      </div>
    </div>
  );
}

const WIDESCREEN_RATIO = 16 / 9;
const NARROWEST_RATIO = 1;
const WIDEST_RATIO = 2.5;

export function AspectRatioRuntimeExample() {
  const [ratio, setRatio] = useState(WIDESCREEN_RATIO);

  return (
    <div className="flex w-64 flex-col gap-3">
      <Slider value={ratio} onValueChange={setRatio} min={NARROWEST_RATIO} max={WIDEST_RATIO} step={0.01} aria-label="Aspect ratio" />
      <AspectRatio ratio={ratio} className={surfaceClassName}>
        {ratio.toFixed(2)} / 1
      </AspectRatio>
    </div>
  );
}
