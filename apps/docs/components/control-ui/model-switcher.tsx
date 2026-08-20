"use client";

import type { ModelSwitcherProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/control-ui/ui/select";

export function ModelSwitcher({
  models,
  value,
  defaultValue,
  onValueChange,
  size = "sm",
  variant = "surface",
  className,
  style,
}: ModelSwitcherProps) {
  const fallback = defaultValue ?? models[0]?.value;

  return (
    <Select value={value} defaultValue={fallback} onValueChange={onValueChange}>
      <SelectTrigger
        size={size}
        variant={variant}
        className={cn("max-w-52", className)}
        style={style}
        aria-label="Model"
        data-control-ui="model-switcher"
        data-control-family="button"
        data-button-kind="model-switcher"
        data-slot="root"
      >
        <span
          data-control-ui="model-switcher"
          data-control-family="button"
          data-button-kind="model-switcher"
          data-slot="value"
          className="flex min-w-0 items-center gap-1.5"
        >
          <span
            data-control-ui="model-switcher"
            data-control-family="button"
            data-button-kind="model-switcher"
            data-slot="indicator"
            aria-hidden="true"
            className="size-1.5 shrink-0"
          />
          <SelectValue placeholder="Model">
            {(current: string) => models.find((model) => model.value === current)?.label ?? "Model"}
          </SelectValue>
        </span>
      </SelectTrigger>
      <SelectContent>
        {models.map((model) => (
          <SelectItem key={model.value} value={model.value}>
            <span className="truncate">{model.label}</span>
            {model.hint ? (
              <span
                data-control-ui="model-switcher"
                data-control-family="button"
                data-button-kind="model-switcher"
                data-slot="hint"
                className="ml-auto pl-4"
              >
                {model.hint}
              </span>
            ) : null}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
