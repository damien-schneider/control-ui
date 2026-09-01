"use client";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import type { ComponentProps } from "react";
import type { ControlledMultiChoice } from "@/components/control-ui/control-props";
import { cn } from "@/components/control-ui/lib/cn";
import type { ButtonProps } from "@/components/control-ui/ui/button";
import { buttonContentClasses, buttonStructureClasses } from "@/components/control-ui/ui/button";

export type ToggleProps = Omit<ButtonProps, "render" | "nativeButton" | "value"> & {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  value?: string;
  showCheck?: boolean;
};

export type ToggleGroupProps<TValue extends string = string> = Omit<ComponentProps<"div">, "defaultValue" | "onChange"> &
  ControlledMultiChoice<TValue> & {
    multiple?: boolean;
    disabled?: boolean;
    orientation?: "horizontal" | "vertical";
  };

// keeps its own anatomy while sharing Button's visual recipe
export function Toggle({
  variant = "surface",
  size = "sm",
  tone = "neutral",
  active,
  showCheck = false,
  className,
  pressed,
  defaultPressed,
  onPressedChange,
  value,
  disabled,
  children,
  ...props
}: ToggleProps) {
  return (
    <TogglePrimitive
      pressed={pressed}
      defaultPressed={defaultPressed}
      onPressedChange={onPressedChange}
      value={value}
      disabled={disabled}
      render={(renderProps, state) => {
        const isActive = active ?? state.pressed;
        return (
          <button
            type="button"
            {...renderProps}
            data-control-ui="toggle"
            data-control-family="button"
            data-slot="root"
            data-control="true"
            data-active={isActive ? "true" : undefined}
            data-variant={variant}
            data-tone={tone}
            data-size={size}
            className={cn(buttonStructureClasses, renderProps.className, className)}
          >
            <span data-control-ui="toggle" data-control-family="button" data-slot="content" className={buttonContentClasses}>
              {showCheck ? (
                <span data-control-ui="toggle" data-slot="check" className="flex size-3.5 shrink-0 items-center justify-center">
                  {isActive ? (
                    <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true" fill="none">
                      <path d="M2.5 6.5 5 9l4.5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : null}
                </span>
              ) : null}
              {renderProps.children}
            </span>
          </button>
        );
      }}
      {...props}
    >
      {children}
    </TogglePrimitive>
  );
}

export function ToggleGroup<TValue extends string = string>({ className, orientation = "horizontal", ...props }: ToggleGroupProps<TValue>) {
  return (
    <ToggleGroupPrimitive
      data-control-ui="toggle"
      data-control-family="button"
      data-slot="group"
      data-orientation={orientation}
      orientation={orientation}
      className={cn("inline-flex items-center", orientation === "vertical" && "flex-col", className)}
      {...props}
    />
  );
}
