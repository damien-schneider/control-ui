"use client";

import type { TooltipPopupProps, TooltipPositionerProps } from "@base-ui/react/tooltip";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { type ComponentProps, type CSSProperties, createContext, type Ref, useContext, useEffect, useId, useMemo, useState } from "react";
import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts/popup-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { PopupArrowShape } from "@/components/control-ui/popup-parts";
import { skinScopeAttributes } from "@/components/control-ui/skin";
import { useSkin } from "@/components/control-ui/skin-provider";

export function TooltipProvider({ delay = 500, ...props }: ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider delay={delay} {...props} />;
}

type TooltipDescriptionContextValue = { contentId: string | undefined; setContentId: (contentId: string | undefined) => void };

// The popup only exists while the tooltip is open, so it names itself here and the trigger never points at a missing id.
const TooltipDescriptionContext = createContext<TooltipDescriptionContextValue | null>(null);

export function Tooltip(props: ComponentProps<typeof TooltipPrimitive.Root>) {
  const [contentId, setContentId] = useState<string>();
  const description = useMemo(() => ({ contentId, setContentId }), [contentId]);
  return (
    <TooltipDescriptionContext value={description}>
      <TooltipPrimitive.Root {...props} />
    </TooltipDescriptionContext>
  );
}

export type TooltipTriggerProps = ComponentProps<typeof TooltipPrimitive.Trigger> & {
  ref?: Ref<HTMLButtonElement>;
};

export function TooltipTrigger({ render, children, ref, "aria-describedby": describedBy, ...props }: TooltipTriggerProps) {
  const contentId = useContext(TooltipDescriptionContext)?.contentId;
  return (
    <TooltipPrimitive.Trigger
      ref={ref}
      render={render}
      aria-describedby={[describedBy, contentId].filter(Boolean).join(" ") || undefined}
      {...props}
    >
      {children}
    </TooltipPrimitive.Trigger>
  );
}

function TooltipDescriptionLink({ id }: { id: string }) {
  const setContentId = useContext(TooltipDescriptionContext)?.setContentId;
  useEffect(() => {
    if (!setContentId) return;
    setContentId(id);
    return () => setContentId(undefined);
  }, [id, setContentId]);
  return null;
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
  id,
  ref,
  ...props
}: TooltipContentProps) {
  const skin = useSkin();
  const generatedId = useId();
  const contentId = id ?? generatedId;
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
        {...skinScopeAttributes(skin)}
        className="z-(--z-tooltip)"
        {...positionerProps}
      >
        <TooltipPrimitive.Popup
          ref={ref}
          id={contentId}
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
          <TooltipDescriptionLink id={contentId} />
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
