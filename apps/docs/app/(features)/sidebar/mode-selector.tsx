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
    <nav aria-label="Documentation sections" className="grid shrink-0 grid-cols-2 gap-1 px-2 pb-2">
      {sidebarModes.map((item) => {
        const active = item.id === mode;

        return (
          <ButtonLink
            key={item.id}
            active={active}
            aria-current={active ? "page" : undefined}
            aria-label={item.label}
            render={<Link href={hrefs[item.id]} onClick={() => onNavigate(item.id)} />}
            className="w-full justify-start gap-2"
          >
            <HugeiconsIcon icon={item.icon} size={16} strokeWidth={1.7} className="shrink-0" />
            <span>{item.label}</span>
          </ButtonLink>
        );
      })}
    </nav>
  );
}
