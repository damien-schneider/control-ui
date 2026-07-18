"use client";

import { AspectRatio } from "@/components/control-ui/ui/aspect-ratio";

export function PrimitiveAspectRatioExample() {
  return (
    <div className="grid w-full max-w-md grid-cols-2 gap-4">
      <div className="flex flex-col gap-1.5">
        <AspectRatio
          ratio={16 / 9}
          className="flex items-center justify-center overflow-hidden rounded-[var(--radius-lg)] border bg-linear-to-br from-muted to-accent text-meta font-medium text-muted-foreground"
        >
          16 / 9
        </AspectRatio>
        <span className="text-meta text-muted-foreground">Widescreen</span>
      </div>
      <div className="flex flex-col gap-1.5">
        <AspectRatio
          ratio={1}
          className="flex items-center justify-center overflow-hidden rounded-[var(--radius-lg)] border bg-linear-to-br from-muted to-accent text-meta font-medium text-muted-foreground"
        >
          1 / 1
        </AspectRatio>
        <span className="text-meta text-muted-foreground">Square</span>
      </div>
    </div>
  );
}
