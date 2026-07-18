"use client";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/control-ui/ui/hover-card";

export function PrimitiveHoverCardExample() {
  return (
    <div className="max-w-sm text-sm leading-relaxed text-foreground">
      Shipped by{" "}
      <HoverCard>
        <HoverCardTrigger
          href="#"
          className="cursor-pointer font-medium text-foreground underline decoration-border decoration-1 underline-offset-2 outline-none transition-colors hover:decoration-foreground data-[popup-open]:decoration-foreground focus-visible:rounded-[var(--radius-sm)] focus-visible:ring-2 focus-visible:ring-foreground/20"
        >
          @ada
        </HoverCardTrigger>{" "}
        and the platform team.
        <HoverCardContent align="start">
          <div className="flex gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              AL
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Ada Lovelace</p>
              <p className="text-meta text-muted-foreground">@ada · Platform</p>
              <p className="mt-2 text-meta leading-relaxed text-muted-foreground">
                Building the agent UI registry. Occasionally writes the first program.
              </p>
              <div className="mt-3 flex gap-4 text-meta text-muted-foreground">
                <span>
                  <span className="font-semibold text-foreground">128</span> repos
                </span>
                <span>
                  <span className="font-semibold text-foreground">4.2k</span> followers
                </span>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
