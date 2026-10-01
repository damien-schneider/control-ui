"use client";

import type { TooltipPopupProps, TooltipPositionerProps } from "@base-ui/react/tooltip";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import type { ComponentProps, CSSProperties, Ref } from "react";
import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts/popup-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { PopupArrowShape } from "@/components/control-ui/popup-parts";
import { controlEffectsAttribute } from "@/components/control-ui/skin";
import { useSkin } from "@/components/control-ui/skin-provider";

export function TooltipProvider({ delay = 500, ...props }: ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider delay={delay} {...props} />;
}

export function Tooltip(props: ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root {...props} />;
}

type TooltipTriggerProps = ComponentProps<typeof TooltipPrimitive.Trigger> & {
  ref?: Ref<HTMLButtonElement>;
};

export function TooltipTrigger({ render, children, ref, ...props }: TooltipTriggerProps) {
  return (
    <TooltipPrimitive.Trigger ref={ref} render={render} {...props}>
      {children}
    </TooltipPrimitive.Trigger>
  );
}

type TooltipContentPositionerProps = Omit<TooltipPositionerProps, keyof TooltipPopupProps>;

export type TooltipContentProps = Omit<TooltipPopupProps & Omit<TooltipContentPositionerProps, "style">, "style"> & {
  style?: CSSProperties & PopupKnobStyle;
} & {
  arrow?: boolean;
  hidden?: boolean;
  ref?: Ref<HTMLDivElement>;
};

export function TooltipContent({
  className,
  children,
  side = "top",
  sideOffset = 8,
  align = "center",
  alignOffset = 0,
  arrowPadding = 10,
  anchor,
  positionMethod,
  collisionBoundary,
  collisionPadding,
  sticky,
  disableAnchorTracking,
  collisionAvoidance,
  arrow = true,
  hidden = false,
  ref,
  ...props
}: TooltipContentProps) {
  const skin = useSkin();
  if (hidden) return null;

  const positionerProps: TooltipContentPositionerProps = {
    side,
    sideOffset,
    align,
    alignOffset,
    arrowPadding,
    anchor,
    positionMethod,
    collisionBoundary,
    collisionPadding,
    sticky,
    disableAnchorTracking,
    collisionAvoidance,
  };

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        data-control-ui="tooltip"
        data-popup-kind="tooltip"
        data-control-family="popup"
        data-slot="positioner"
        data-skin={skin.id}
        data-effects={controlEffectsAttribute(skin.effects)}
        className="z-(--z-tooltip)"
        {...positionerProps}
      >
        <TooltipPrimitive.Popup
          ref={ref}
          role="tooltip"
          data-control-ui="tooltip"
          data-popup-kind="tooltip"
          data-control-family="popup"
          data-popup-part="surface"
          data-slot="content"
          data-arrow={arrow ? "true" : undefined}
          className={cn("relative flex w-fit max-w-xs flex-col", className)}
          {...props}
        >
          {children}
          {arrow ? (
            <TooltipPrimitive.Arrow
              data-control-ui="tooltip"
              data-control-family="popup"
              data-popup-kind="tooltip"
              data-slot="arrow"
              className="flex"
            >
              <PopupArrowShape />
            </TooltipPrimitive.Arrow>
          ) : null}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}
