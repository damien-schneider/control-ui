"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { cn } from "@/components/control-ui/lib/cn";
import type { SelectTriggerProps } from "@/components/control-ui/ui/select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/control-ui/ui/select";

export type ModelOption = {
  value: string;
  label: string;
  hint?: ReactNode;
  icon?: ReactNode;
};

export type ModelSwitcherProps = Omit<SelectTriggerProps, "children" | "value" | "defaultValue" | "size" | "name" | "form"> & {
  models: readonly ModelOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: "xs" | "sm";
  label?: string;
  /** Submits the selected model with the surrounding form. */
  name?: string;
  form?: string;
};

export function ModelSwitcher({
  models,
  value,
  defaultValue,
  onValueChange,
  disabled,
  size = "sm",
  variant = "surface",
  className,
  label = "Model",
  name,
  form,
  "aria-labelledby": ariaLabelledby,
  ...props
}: ModelSwitcherProps) {
  // Owned here rather than handed to Select as a default: models often load after mount, and a default is only read once.
  const [picked, setPicked] = useState(defaultValue);
  const selected = value ?? picked ?? models[0]?.value ?? null;

  function handleValueChange(next: string) {
    setPicked(next);
    onValueChange?.(next);
  }

  return (
    <Select value={selected} onValueChange={handleValueChange} disabled={disabled || models.length === 0} name={name} form={form}>
      <SelectTrigger
        size={size}
        variant={variant}
        className={cn("max-w-52", className)}
        aria-label={ariaLabelledby ? undefined : label}
        aria-labelledby={ariaLabelledby}
        {...props}
      >
        <span data-control-ui="model-switcher" data-slot="value" className="flex min-w-0 items-center">
          <SelectValue placeholder={label}>
            {(current: string) => {
              const model = models.find((option) => option.value === current);
              return (
                <span className="flex min-w-0 items-center gap-1.5">
                  {model?.icon ? (
                    <span aria-hidden="true" className="flex shrink-0 [&_svg]:size-4">
                      {model.icon}
                    </span>
                  ) : null}
                  <span className="truncate" title={model?.label ?? label}>
                    {model?.label ?? label}
                  </span>
                </span>
              );
            }}
          </SelectValue>
        </span>
      </SelectTrigger>
      <SelectContent>
        {models.map((model) => (
          <SelectItem key={model.value} value={model.value} label={model.label}>
            {model.icon ? (
              <span aria-hidden="true" className="flex shrink-0 [&_svg]:size-4">
                {model.icon}
              </span>
            ) : null}
            <span className="truncate" title={model.label}>
              {model.label}
            </span>
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
