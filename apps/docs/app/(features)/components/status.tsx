"use client";

import { statusMeta } from "@/app/(features)/components/status-meta";
import type { DocsStatus } from "@/app/(features)/model/types";
import { Badge } from "@/components/control-ui/ui/badge";

export function StatusBadge({ status, compact = false, className }: { status: DocsStatus; compact?: boolean; className?: string }) {
  const meta = statusMeta[status];

  return (
    <Badge variant="secondary" size={compact ? "sm" : "md"} color={meta.color} title={meta.description} className={className}>
      {compact ? meta.shortLabel : meta.label}
      <span className="sr-only">{meta.description}</span>
    </Badge>
  );
}
