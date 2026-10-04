"use client";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/control-ui/ui/hover-card";
import { Text } from "@/components/control-ui/ui/typography";

export function PrimitiveHoverCardExample() {
  return (
    <Text as="div" tone="foreground" className="max-w-sm leading-relaxed">
      Shipped by{" "}
      <HoverCard>
        <HoverCardTrigger href="#">@ada</HoverCardTrigger> and the platform team.
        <HoverCardContent align="start">
          <div className="flex gap-3">
            <Text
              weight="semibold"
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
            >
              AL
            </Text>
            <div className="min-w-0">
              <Text as="p" weight="semibold">
                Ada Lovelace
              </Text>
              <Text as="p" size="caption" tone="muted">
                @ada · Platform
              </Text>
              <Text as="p" size="caption" tone="muted" className="mt-2 leading-relaxed">
                Building the agent UI registry. Occasionally writes the first program.
              </Text>
              <Text as="div" size="caption" tone="muted" className="mt-3 flex gap-4">
                <span>
                  <span className="font-semibold text-foreground">128</span> repos
                </span>
                <span>
                  <span className="font-semibold text-foreground">4.2k</span> followers
                </span>
              </Text>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </Text>
  );
}
