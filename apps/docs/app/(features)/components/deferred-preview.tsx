"use client";

import { type ReactNode, useRef } from "react";
import { useNearViewport } from "@/app/(features)/client/use-near-viewport";
import { cn } from "@/components/control-ui/lib/cn";
import { Skeleton } from "@/components/control-ui/ui/skeleton";

export function DeferredPreview({ children, className }: { children: ReactNode; className?: string }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mounted = useNearViewport(hostRef);

  return (
    <div
      ref={hostRef}
      inert
      aria-hidden="true"
      data-gallery-preview=""
      data-gallery-preview-state={mounted ? "mounted" : "deferred"}
      className={cn(
        "pointer-events-none grid h-full w-full min-w-0 select-none place-items-center overflow-hidden p-5 supports-[content-visibility:auto]:[content-visibility:auto]",
        className,
      )}
    >
      {mounted ? (
        <div className="starting:opacity-0 grid h-full w-full min-w-0 place-items-center opacity-100 transition-opacity duration-[var(--duration-base)] ease-[var(--ease-standard)] motion-reduce:transition-none">
          {children}
        </div>
      ) : (
        <Skeleton className="size-full" />
      )}
    </div>
  );
}
