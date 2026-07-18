"use client";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import type { ToggleGroupProps, ToggleProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";
import { buttonContentClasses, buttonRecipeClasses } from "@/components/control-ui/ui/button";

// Toggle keeps its own anatomy while sharing Button's visual recipe.
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
        const context = { variant, tone, size, shape: "default" as const, active: isActive };
        return (
          <button
            type="button"
            {...renderProps}
            data-control-ui="toggle"
            data-slot="root"
            data-control="true"
            data-active={isActive ? "true" : undefined}
            data-variant={variant}
            data-tone={tone}
            data-size={size}
            className={cn(
              buttonRecipeClasses(variant, tone, size),
              skinSlot("toggle", "root", context) ?? skinSlot("button", "root", context),
              renderProps.className,
              className,
            )}
          >
            <span
              data-control-ui="toggle"
              data-slot="content"
              className={cn(buttonContentClasses, skinSlot("toggle", "content", {}) ?? skinSlot("button", "content", {}))}
            >
              {showCheck ? (
                <span
                  data-control-ui="toggle"
                  data-slot="check"
                  className={cn("flex size-3.5 shrink-0 items-center justify-center", skinSlot("toggle", "check", {}))}
                >
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

export function ToggleGroup({ className, orientation = "horizontal", ...props }: ToggleGroupProps) {
  return (
    <ToggleGroupPrimitive
      data-control-ui="toggle"
      data-slot="group"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "inline-flex items-center gap-1",
        orientation === "vertical" && "flex-col",
        skinSlot("toggle", "group", { orientation }),
        className,
      )}
      {...props}
    />
  );
}
