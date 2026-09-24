"use client";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import { type ComponentProps, useContext } from "react";
import type { ControlledMultiChoice, HoverIndicator } from "@/components/control-ui/control-props";
import { TrackHighlight } from "@/components/control-ui/extensions/track-highlight";
import { cn } from "@/components/control-ui/lib/cn";
import { useSkin } from "@/components/control-ui/skin-provider";

import type { ButtonProps } from "@/components/control-ui/ui/button";
import {
  ButtonTrackContext,
  buttonContentClasses,
  buttonStructureClasses,
  buttonTrackStructureClasses,
} from "@/components/control-ui/ui/button";

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
    indicator?: HoverIndicator;
  };

export function Toggle({
  variant = "surface",
  size = "sm",
  tone = "neutral",
  active,
  iconOnly = false,
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
  const tracksHover = useContext(ButtonTrackContext);
  return (
    <TogglePrimitive
      data-track-item={tracksHover ? "" : undefined}
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
            data-icon-only={iconOnly ? "true" : undefined}
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

export function ToggleGroup<TValue extends string = string>({
  className,
  orientation = "horizontal",
  indicator,
  children,
  ...props
}: ToggleGroupProps<TValue>) {
  const skin = useSkin();
  const resolvedIndicator = indicator ?? skin.indicators?.["toggle-group"] ?? "none";
  const tracksHover = resolvedIndicator === "hover";
  return (
    <ButtonTrackContext value={tracksHover}>
      <ToggleGroupPrimitive
        data-control-ui="toggle"
        data-control-family="button"
        data-slot="group"
        data-orientation={orientation}
        data-track={resolvedIndicator}
        orientation={orientation}
        className={cn(
          buttonTrackStructureClasses,
          "inline-flex items-center data-[track=hover]:gap-0",
          orientation === "vertical" && "flex-col",
          className,
        )}
        {...props}
      >
        {children}
        {tracksHover ? <TrackHighlight className="z-0" /> : null}
      </ToggleGroupPrimitive>
    </ButtonTrackContext>
  );
}
