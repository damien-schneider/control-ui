import type { ReactNode } from "react";
import { cn } from "@/components/control-ui/lib/cn";
import { Text } from "@/components/control-ui/ui/typography";

export const annotationTagClassName = "inline-flex h-5.5 items-center gap-1.5 rounded-sm bg-info px-2 text-white";

export function AnnotationTag({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span className={cn(annotationTagClassName, className)}>
      <Text size="caption" weight="medium" mono className="whitespace-nowrap">
        {children}
      </Text>
    </span>
  );
}
