"use client";

import { type ReactNode, useRef } from "react";
import { useNearViewport } from "@/app/(features)/client/use-near-viewport";
import { cn } from "@/components/control-ui/lib/cn";

export function MountWhenNear({ className, children }: { className?: string; children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const near = useNearViewport(hostRef);

  return (
    <div ref={hostRef} data-mounted={near ? "" : undefined} className={cn("min-w-0", className)}>
      {near ? children : null}
    </div>
  );
}
