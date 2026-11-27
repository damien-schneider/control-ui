import type { ReactNode } from "react";
import { cn } from "@/components/control-ui/lib/cn";

export function PreviewPanel({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("w-full rounded-xl border border-border bg-card", className)}>{children}</div>;
}
