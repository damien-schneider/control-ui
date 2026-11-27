"use client";

import { type ReactNode, useState } from "react";
import { DarkScope } from "@/app/(features)/home/shared/skin-scope";

function highlightAt(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  const rung = target.closest("[data-rung]")?.getAttribute("data-rung");
  if (rung) return `rung-${rung}`;
  const mark = target.closest("[data-mark]")?.getAttribute("data-mark");
  return mark ? `mark-${mark}` : null;
}

export function LevelHighlightScope({ className, children }: { className?: string; children: ReactNode }) {
  const [highlight, setHighlight] = useState<string | null>(null);

  return (
    <DarkScope
      data-highlight={highlight ?? undefined}
      className={className}
      onPointerOver={(event) => setHighlight(highlightAt(event.target))}
      onPointerLeave={() => setHighlight(null)}
      onFocus={(event) => setHighlight(highlightAt(event.target))}
      onBlur={() => setHighlight(null)}
    >
      {children}
    </DarkScope>
  );
}
