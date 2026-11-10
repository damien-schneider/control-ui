"use client";

import type { ComponentProps, CSSProperties } from "react";
import { createContext, useContext } from "react";
import type { HoverIndicator } from "@/components/control-ui/control-props";
import type { ControlSize } from "@/components/control-ui/control-variants";
import { TrackHighlight } from "@/components/control-ui/extensions/track-highlight";
import type { ButtonGroupKnobStyle } from "@/components/control-ui/knob-contracts/button-group-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { useSkin } from "@/components/control-ui/skin-provider";

import { ButtonTrackContext, buttonTrackStructureClasses } from "@/components/control-ui/ui/button";

export type ButtonGroupTextProps = Omit<
  ComponentProps<"div"> & {
    size?: ControlSize;
  },
  "style"
> & { style?: CSSProperties & ButtonGroupKnobStyle };

export type ButtonGroupProps = ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical";
  indicator?: HoverIndicator;
} & { style?: CSSProperties & ButtonGroupKnobStyle };

export type ButtonGroupSeparatorProps = Omit<
  ComponentProps<"div"> & {
    orientation?: "horizontal" | "vertical";
  },
  "style"
> & { style?: CSSProperties & ButtonGroupKnobStyle };

const ButtonGroupOrientationContext = createContext<"horizontal" | "vertical">("horizontal");

export function ButtonGroup({ orientation = "horizontal", indicator, className, children, ...props }: ButtonGroupProps) {
  const skin = useSkin();
  const resolvedIndicator = indicator ?? skin.indicators?.["button-group"] ?? "none";
  const tracksHover = resolvedIndicator === "hover";
  return (
    <ButtonGroupOrientationContext value={orientation}>
      <ButtonTrackContext value={tracksHover}>
        {/* biome-ignore lint/a11y/useSemanticElements: a segmented control is a labelled group, not a fieldset form group. */}
        <div
          role="group"
          data-control-ui="button-group"
          data-control-family="button-group"
          data-slot="root"
          data-orientation={orientation}
          data-track={resolvedIndicator}
          className={cn(buttonTrackStructureClasses, "inline-flex w-fit items-stretch data-[orientation=vertical]:flex-col", className)}
          {...props}
        >
          {children}
          {tracksHover ? <TrackHighlight className="z-0" /> : null}
        </div>
      </ButtonTrackContext>
    </ButtonGroupOrientationContext>
  );
}

export function ButtonGroupText({ size = "sm", className, ...props }: ButtonGroupTextProps) {
  return (
    <div
      data-control-ui="button-group"
      data-control-family="button-group"
      data-slot="text"
      data-size={size}
      className={cn("inline-flex items-center whitespace-nowrap", className)}
      {...props}
    />
  );
}

export function ButtonGroupSeparator({ orientation, className, ...props }: ButtonGroupSeparatorProps) {
  const groupOrientation = useContext(ButtonGroupOrientationContext);
  const resolvedOrientation = orientation ?? (groupOrientation === "vertical" ? "horizontal" : "vertical");
  return (
    <div
      aria-hidden="true"
      data-control-ui="button-group"
      data-control-family="button-group"
      data-slot="separator"
      data-orientation={resolvedOrientation}
      className={cn("shrink-0 self-stretch", resolvedOrientation === "vertical" ? "w-px" : "h-px w-full", className)}
      {...props}
    />
  );
}
