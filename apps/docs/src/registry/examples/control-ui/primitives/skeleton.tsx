"use client";

import { Skeleton } from "@/components/control-ui/ui/skeleton";

// Loading chat turn: avatar + text lines, token-driven shimmer sweep.
export function PrimitiveSkeletonExample() {
  return (
    <div className="flex w-full max-w-sm items-start gap-3 rounded-xl border bg-background p-4">
      <Skeleton className="size-9 shrink-0 rounded-full" />
      <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}
