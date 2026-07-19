"use client";

import { Check } from "lucide-react";
import type { BadgeColor } from "@/components/control-ui/contracts";
import { Badge } from "@/components/control-ui/ui/badge";

const badgeColors: BadgeColor[] = ["neutral", "red", "orange", "yellow", "green", "blue", "purple", "pink"];

export function PrimitiveBadgeExample() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Default</Badge>
      <Badge size="sm">Small</Badge>
      <Badge color="blue">Beta</Badge>
      <Badge color="yellow">15</Badge>
      <Badge variant="destructive">Denied</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge color="green">
        <Check />
        Allowed
      </Badge>
      {badgeColors.map((color) => (
        <Badge color={color} key={color}>
          {color}
        </Badge>
      ))}
      <Badge render={<a href="#docs" />}>Link badge</Badge>
    </div>
  );
}
