"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/control-ui/ui/select";
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

function ModeOption({ value }: { value: string }) {
  const item = sidebarModes.find((candidate) => candidate.id === value);
  if (!item) return null;

  return (
    <span className="flex min-w-0 items-center gap-2">
      <HugeiconsIcon icon={item.icon} size={16} strokeWidth={1.7} className="shrink-0" />
      <span className="truncate">{item.label}</span>
    </span>
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
  const router = useRouter();

  return (
    <nav aria-label="Documentation sections" className="shrink-0 px-2 pb-2">
      <Select<SidebarMode>
        value={mode}
        onValueChange={(next) => {
          onNavigate(next);
          router.push(hrefs[next]);
        }}
      >
        <SelectTrigger size="sm" className="w-full" aria-label="Documentation section">
          <SelectValue>{(value: string) => <ModeOption value={value} />}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {sidebarModes.map((item) => (
            <SelectItem key={item.id} value={item.id} label={item.label}>
              <ModeOption value={item.id} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </nav>
  );
}
