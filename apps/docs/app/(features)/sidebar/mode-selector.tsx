"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/control-ui/ui/button";
import { sidebarModes } from "./icons";
import type { SidebarMode } from "./types";

export function SidebarControlSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 px-1 text-caption font-medium uppercase tracking-[0.08em] text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}

export function SidebarModeSelector({
  mode,
  hrefs,
  onNavigate,
}: {
  mode: SidebarMode;
  hrefs: Record<SidebarMode, string>;
  onNavigate: (mode: SidebarMode) => void;
}) {
  return (
    <nav aria-label="Catalogs" className="grid shrink-0 grid-cols-2 gap-1 px-2 pb-2">
      {sidebarModes.map((item) => (
        <ButtonLink
          key={item.id}
          render={<Link href={hrefs[item.id]} onClick={() => onNavigate(item.id)} aria-current={mode === item.id ? "true" : undefined} />}
          variant="surface"
          size="sm"
          active={mode === item.id}
          className="min-w-0 justify-start"
        >
          <HugeiconsIcon aria-hidden icon={item.icon} size={16} strokeWidth={1.7} className="shrink-0" />
          <span className="truncate">{item.label}</span>
        </ButtonLink>
      ))}
    </nav>
  );
}
