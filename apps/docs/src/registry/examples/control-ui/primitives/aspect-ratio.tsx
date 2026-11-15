"use client";

import { type ReactNode, useState } from "react";
import { AspectRatio } from "@/components/control-ui/ui/aspect-ratio";
import { Slider } from "@/components/control-ui/ui/slider";
import { Text } from "@/components/control-ui/ui/typography";

const surfaceClassName =
  "flex items-center justify-center overflow-hidden rounded-[var(--radius-lg)] border bg-linear-to-br from-muted to-accent";

function Placeholder({ className, children }: { className: string; children: ReactNode }) {
  return (
    <div className={`${surfaceClassName} ${className}`}>
      <Text size="caption" weight="medium" tone="muted">
        {children}
      </Text>
    </div>
  );
}

export function PrimitiveAspectRatioExample() {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Placeholder className="aspect-video">aspect-video</Placeholder>
        <Text size="caption" tone="muted">
          Widescreen
        </Text>
      </div>
      <div className="flex flex-col gap-1.5">
        <Placeholder className="aspect-square">aspect-square</Placeholder>
        <Text size="caption" tone="muted">
          Square
        </Text>
      </div>
    </>
  );
}

const WIDESCREEN_RATIO = 16 / 9;
const NARROWEST_RATIO = 1;
const WIDEST_RATIO = 2.5;

export function AspectRatioRuntimeExample() {
  const [ratio, setRatio] = useState(WIDESCREEN_RATIO);

  return (
    <>
      <Slider value={ratio} onValueChange={setRatio} min={NARROWEST_RATIO} max={WIDEST_RATIO} step={0.01} aria-label="Aspect ratio" />
      <AspectRatio ratio={ratio}>
        <Placeholder className="size-full">{ratio.toFixed(2)} / 1</Placeholder>
      </AspectRatio>
    </>
  );
}
