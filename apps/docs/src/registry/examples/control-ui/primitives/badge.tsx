"use client";

import { Check } from "lucide-react";
import type { BadgeColor } from "@/components/control-ui/contracts";
import { Badge } from "@/components/control-ui/ui/badge";

const badgeColors: BadgeColor[] = [
  "slate",
  "gray",
  "zinc",
  "stone",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
];

export function PrimitiveBadgeExample() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Default</Badge>
      <Badge size="sm">Small</Badge>
      <Badge color="blue">Beta</Badge>
      <Badge color="amber">15</Badge>
      <Badge variant="destructive">Denied</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge color="emerald">
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
