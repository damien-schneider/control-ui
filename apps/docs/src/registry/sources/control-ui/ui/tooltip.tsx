"use client";

import type { TooltipPopupProps, TooltipPositionerProps } from "@base-ui/react/tooltip";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { type ComponentProps, isValidElement, type Ref } from "react";
import { cn } from "@/components/control-ui/lib/cn";
import { skinEffects, skinId, skinSlot } from "@/components/control-ui/skin";

type TooltipProviderProps = Omit<ComponentProps<typeof TooltipPrimitive.Provider>, "delay" | "timeout"> & {
  delay?: number;
  timeout?: number;
  delayDuration?: number;
  skipDelayDuration?: number;
};

export function TooltipProvider({ delay, delayDuration, timeout, skipDelayDuration, ...props }: TooltipProviderProps) {
  const resolvedDelay = delay ?? delayDuration;
  const resolvedTimeout = timeout ?? skipDelayDuration;

  return (
    <TooltipPrimitive.Provider
      {...(resolvedDelay !== undefined ? { delay: resolvedDelay } : {})}
      {...(resolvedTimeout !== undefined ? { timeout: resolvedTimeout } : {})}
      {...props}
    />
  );
}

export function Tooltip(props: ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root {...props} />;
}

type TooltipTriggerProps = ComponentProps<typeof TooltipPrimitive.Trigger> & {
  /** @deprecated Use Base UI's `render` prop instead. */
  asChild?: boolean;
  ref?: Ref<HTMLButtonElement>;
};

export function TooltipTrigger({ asChild, render, children, ref, ...props }: TooltipTriggerProps) {
  if (asChild && isValidElement(children)) {
    return <TooltipPrimitive.Trigger ref={ref} render={children} {...props} />;
  }

  return (
    <TooltipPrimitive.Trigger ref={ref} render={render} {...props}>
      {children}
    </TooltipPrimitive.Trigger>
  );
}

type TooltipContentPositionerProps = Omit<TooltipPositionerProps, keyof TooltipPopupProps>;

type TooltipContentProps = TooltipPopupProps &
  TooltipContentPositionerProps & {
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
      <TooltipPrimitive.Positioner data-skin={skinId()} data-effects={skinEffects()} className="z-[90] outline-none" {...positionerProps}>
        <TooltipPrimitive.Popup
          ref={ref}
          role="tooltip"
          data-control-ui="tooltip"
          data-slot="content"
          data-surface="floating"
          className={cn(
            "relative flex w-fit max-w-xs origin-[var(--transform-origin)] flex-col bg-foreground px-2.5 py-1 text-xs text-balance text-background shadow-pop outline-none transition-[opacity,scale] duration-[var(--duration-fast)] data-[instant]:transition-none data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            !arrow && "rounded-[var(--radius-control)]",
            skinSlot("tooltip", "content", {}),
            arrow && "rounded-[clamp(0px,var(--radius-control),3px)]",
            className,
          )}
          {...props}
        >
          {children}
          {arrow ? (
            <TooltipPrimitive.Arrow
              className={cn(
                "flex text-foreground",
                "data-[side=top]:-bottom-[8px] data-[side=top]:rotate-180",
                "data-[side=bottom]:-top-[8px]",
                "data-[side=left]:-right-[10px] data-[side=left]:rotate-90",
                "data-[side=right]:-left-[10px] data-[side=right]:-rotate-90",
              )}
            >
              <TooltipArrowSvg />
            </TooltipPrimitive.Arrow>
          ) : null}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

function TooltipArrowSvg() {
  return (
    <svg aria-hidden="true" focusable="false" width="12" height="8" viewBox="0 0 12 8" fill="none" overflow="visible">
      <path d="M0 7L4 2Q6 0 8 2L12 7L12 8L0 8Z" className="fill-current" />
    </svg>
  );
}
