import type { DocsStatus } from "@/app/(features)/model/types";
import type { BadgeColor } from "@/components/control-ui/contracts";

export const statusMeta = {
  beta: {
    label: "Beta",
    shortLabel: "Beta",
    color: "amber",
    description: "Beta — the props contract is close to final, but small breaking changes can still land.",
  },
  experimental: {
    label: "Experimental",
    shortLabel: "Exp",
    color: "violet",
    description: "Experimental — the contract and the rendering can change without notice. Own the installed copy before shipping it.",
  },
} as const satisfies Record<DocsStatus, { label: string; shortLabel: string; color: BadgeColor; description: string }>;
