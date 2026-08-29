"use client";

import type { CSSProperties, ReactNode } from "react";
import type { ButtonKnobStyle } from "@/components/control-ui/knob-contracts/button-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import type { SelectTriggerVariant } from "@/components/control-ui/ui/select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/control-ui/ui/select";

export type ModelOption = {
  value: string;
  label: string;
  hint?: ReactNode;
};

export type ModelSwitcherProps = {
  models: ModelOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: "xs" | "sm";
  variant?: SelectTriggerVariant;
  className?: string;
  style?: CSSProperties & ButtonKnobStyle;
};

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
          className="flex min-w-0 items-center"
        >
          <span
            data-control-ui="model-switcher"
            data-control-family="button"
            data-button-kind="model-switcher"
            data-slot="indicator"
            aria-hidden="true"
            className="shrink-0"
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
              <span data-control-ui="model-switcher" data-control-family="popup" data-popup-kind="model-switcher" data-slot="hint">
                {model.hint}
              </span>
            ) : null}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
