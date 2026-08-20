"use client";

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";
import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import type { MorphingPanelContentProps, MorphingPanelProps, MorphingPanelTriggerProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";

export type {
  MorphingPanelContentProps,
  MorphingPanelDimensions,
  MorphingPanelProps,
  MorphingPanelTriggerProps,
} from "@/components/control-ui/contracts";

type MorphingPanelStyle = CSSProperties & {
  "--_morphing-panel-collapsed-height": string;
  "--_morphing-panel-collapsed-width": string;
  "--_morphing-panel-expanded-height": string;
  "--_morphing-panel-expanded-width": string;
};

function MorphingPanelTriggerElement({
  triggerProps,
  open,
  render,
  className,
  children,
}: {
  triggerProps: ComponentProps<"button">;
  open: boolean;
  render: MorphingPanelTriggerProps["render"];
  className?: string;
  children: ReactNode;
}) {
  const panelState = open ? "open" : "closed";

  return useRender({
    defaultTagName: "button",
    render,
    state: { open },
    props: {
      ...triggerProps,
      "data-control-ui": "morphing-panel",
      "data-control-family": "morphing-panel",
      "data-slot": "trigger",
      "data-state": panelState,
      className: cn(triggerProps.className, className),
      children,
    },
  });
}

export function MorphingPanel({ collapsedSize, expandedSize, className, style, ...props }: MorphingPanelProps) {
  const dimensions = {
    "--_morphing-panel-collapsed-height": collapsedSize.height,
    "--_morphing-panel-collapsed-width": collapsedSize.width,
    "--_morphing-panel-expanded-height": expandedSize.height,
    "--_morphing-panel-expanded-width": expandedSize.width,
    ...style,
  } satisfies MorphingPanelStyle;

  return (
    <CollapsiblePrimitive.Root
      className={className}
      style={dimensions}
      render={(renderProps, state) => {
        const panelState = state.open ? "open" : "closed";
        const panelSize = state.open ? "expanded" : "collapsed";
        const panelStyle: CSSProperties = {
          ...renderProps.style,
          height: `var(--_morphing-panel-${panelSize}-height)`,
          width: `min(var(--_morphing-panel-${panelSize}-width), 100%)`,
        };
        return (
          <div
            {...renderProps}
            data-control-ui="morphing-panel"
            data-control-family="morphing-panel"
            data-slot="root"
            data-state={panelState}
            data-surface="panel"
            style={panelStyle}
            className={cn("relative isolate max-w-full overflow-hidden", renderProps.className)}
          />
        );
      }}
      {...props}
    />
  );
}

export function MorphingPanelTrigger({ render, className, children, ...props }: MorphingPanelTriggerProps) {
  return (
    <CollapsiblePrimitive.Trigger
      className="group/morphing-panel-trigger absolute top-0 right-0 z-10 flex size-full cursor-pointer items-center justify-between gap-2 px-4 data-[state=open]:top-2 data-[state=open]:right-2 data-[state=open]:size-9 data-[state=open]:justify-center data-[state=open]:p-0 pointer-coarse:data-[state=open]:size-11 [&>svg]:shrink-0"
      {...props}
      render={(triggerProps, state) => (
        <MorphingPanelTriggerElement triggerProps={triggerProps} open={state.open} render={render} className={className}>
          {children}
        </MorphingPanelTriggerElement>
      )}
    />
  );
}

export function MorphingPanelContent({ className, ...props }: MorphingPanelContentProps) {
  return (
    <CollapsiblePrimitive.Panel
      className={className}
      render={(renderProps, state) => {
        const panelState = state.open ? "open" : "closed";
        return (
          <div
            {...renderProps}
            data-control-ui="morphing-panel"
            data-control-family="morphing-panel"
            data-slot="content"
            data-state={panelState}
            className={cn("absolute inset-0 overflow-hidden", renderProps.className)}
          />
        );
      }}
      {...props}
    />
  );
}
