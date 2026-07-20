"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { TrackHighlight } from "@/components/control-ui/extensions/track-highlight";
import { ToolbarLink } from "@/components/control-ui/ui/toolbar";
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
    <nav aria-label="Documentation sections" className="relative isolate flex w-fit shrink-0 items-center gap-0.5">
      {/* Single pill: rests on the active mode, chases the hovered one (data-hover demotes it to the wash). */}
      <TrackHighlight className="rounded-[var(--toolbar-item-radius-fit)] bg-background shadow-sm ring-0 data-[hover]:bg-background/10 duration-[var(--duration-slow)] ease-[var(--ease-emphasized)]" />
      {sidebarModes.map((item) => {
        const active = item.id === mode;

        return (
          <ToolbarLink
            key={item.id}
            data-track-item=""
            data-active={active ? "true" : "false"}
            aria-current={active ? "page" : undefined}
            aria-label={item.label}
            title={item.label}
            variant="track"
            render={<Link href={hrefs[item.id]} onClick={() => onNavigate(item.id)} />}
          >
            <HugeiconsIcon icon={item.icon} size={16} strokeWidth={1.7} className="shrink-0" />
            <span className="max-sm:sr-only">{item.label}</span>
          </ToolbarLink>
        );
      })}
    </nav>
  );
}
