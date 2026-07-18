"use client";

import type { ModelSwitcherProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/control-ui/ui/select";

// Model picker on Select slot; trigger is a control, shares --radius-control with every button — proof a design direction is a theme rewrite, not a per-component edit.
export function ModelSwitcher({
  models,
  value,
  defaultValue,
  onValueChange,
  size = "sm",
  variant = "surface",
  className,
}: ModelSwitcherProps) {
  const fallback = defaultValue ?? models[0]?.value;

  return (
    <Select value={value} defaultValue={fallback} onValueChange={onValueChange}>
      <SelectTrigger
        size={size}
        variant={variant}
        className={cn("max-w-52", className)}
        aria-label="Model"
        data-control-ui="model-switcher"
        data-slot="root"
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-primary" />
          <SelectValue placeholder="Model">
            {(current: string) => models.find((model) => model.value === current)?.label ?? "Model"}
          </SelectValue>
        </span>
      </SelectTrigger>
      <SelectContent>
        {models.map((model) => (
          <SelectItem key={model.value} value={model.value}>
            <span className="truncate">{model.label}</span>
            {model.hint ? <span className="ml-auto pl-4 text-micro text-muted-foreground">{model.hint}</span> : null}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
