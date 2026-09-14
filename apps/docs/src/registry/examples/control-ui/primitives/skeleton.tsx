"use client";

import { Card, CardContent } from "@/components/control-ui/ui/card";
import { Skeleton, skeletonVariants } from "@/components/control-ui/ui/skeleton";

const variantLabels = { shimmer: "Shimmer", pulse: "Pulse", none: "Static" };

export function PrimitiveSkeletonExample() {
  return (
    <Card className="w-full max-w-sm">
      <CardContent className="flex flex-col gap-6">
        {skeletonVariants.map((variant) => (
          <div key={variant} className="flex flex-col gap-3">
            <span className="text-xs font-medium text-muted-foreground">{variantLabels[variant]}</span>
            <div className="flex items-start gap-3">
              <Skeleton variant={variant} className="size-10 shrink-0" style={{ "--cui-skeleton-radius": "50%" }} />
              <div className="flex min-w-0 flex-1 flex-col gap-2 py-1">
                <Skeleton variant={variant} className="h-3 w-2/3" />
                <Skeleton variant={variant} className="h-3 w-full" />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
