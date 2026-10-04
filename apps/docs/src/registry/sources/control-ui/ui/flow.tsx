"use client";

import {
  Background,
  BackgroundVariant,
  BaseEdge,
  type BaseEdgeProps,
  type Edge,
  EdgeLabelRenderer,
  type FitViewOptions,
  Handle,
  type Node,
  Panel,
  ReactFlow,
  type ReactFlowProps,
  useReactFlow,
  useStore,
} from "@xyflow/react";
import { MaximizeIcon, MinusIcon, PlusIcon } from "lucide-react";
import type { ComponentProps, CSSProperties } from "react";
import type { FlowKnobStyle } from "@/components/control-ui/knob-contracts/flow-knobs";
import { CANVAS_GRID_DOT_RADIUS, CANVAS_GRID_GAP } from "@/components/control-ui/lib/canvas-grid";
import { cn } from "@/components/control-ui/lib/cn";
import { prefersReducedMotion, readDurationMs } from "@/components/control-ui/lib/motion";
import { Button } from "@/components/control-ui/ui/button";

export type FlowProps<NodeType extends Node = Node, EdgeType extends Edge = Edge> = Omit<
  ReactFlowProps<NodeType, EdgeType>,
  "colorMode" | "style"
> & { style?: CSSProperties & FlowKnobStyle };

export type FlowBackgroundProps = { id?: string; className?: string };

export type FlowPanelProps = Omit<ComponentProps<typeof Panel>, "style"> & { style?: CSSProperties & FlowKnobStyle };

export type FlowControlsProps = Omit<FlowPanelProps, "children"> & { fitViewOptions?: FitViewOptions };

export type FlowNodeProps = Omit<ComponentProps<"div">, "style"> & {
  selected?: boolean;
  style?: CSSProperties & FlowKnobStyle;
};

export type FlowNodePartProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & FlowKnobStyle };

export type FlowHandleProps = Omit<ComponentProps<typeof Handle>, "style"> & { style?: CSSProperties & FlowKnobStyle };

export type FlowEdgeProps = Omit<BaseEdgeProps, "style"> & { dashed?: boolean; style?: CSSProperties & FlowKnobStyle };

export type FlowEdgeLabelProps = Omit<ComponentProps<"div">, "style"> & {
  x: number;
  y: number;
  style?: CSSProperties & FlowKnobStyle;
};

export type FlowEdgeLabelChipProps = Omit<ComponentProps<"span">, "style"> & { style?: CSSProperties & FlowKnobStyle };

function viewportTransitionMs(element: Element) {
  return prefersReducedMotion(element) ? 0 : readDurationMs(element, "--duration-base");
}

export function Flow<NodeType extends Node = Node, EdgeType extends Edge = Edge>(props: FlowProps<NodeType, EdgeType>) {
  return (
    <ReactFlow<NodeType, EdgeType>
      defaultMarkerColor={null}
      {...props}
      data-control-ui="flow"
      data-control-family="flow"
      data-slot="root"
    />
  );
}

export function FlowBackground(props: FlowBackgroundProps) {
  return <Background {...props} variant={BackgroundVariant.Dots} gap={CANVAS_GRID_GAP} size={CANVAS_GRID_DOT_RADIUS * 2} />;
}

export function FlowPanel(props: FlowPanelProps) {
  return <Panel {...props} data-control-ui="flow" data-control-family="flow" data-slot="panel" />;
}

export function FlowControls({ position = "bottom-left", fitViewOptions, className, ...props }: FlowControlsProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const atMinZoom = useStore((state) => state.transform[2] <= state.minZoom);
  const atMaxZoom = useStore((state) => state.transform[2] >= state.maxZoom);
  return (
    <Panel
      {...props}
      position={position}
      data-control-ui="flow"
      data-control-family="flow"
      data-slot="controls"
      className={cn("flex items-center", className)}
    >
      <Button
        type="button"
        size="sm"
        variant="ghost"
        iconOnly
        disabled={atMinZoom}
        aria-label="Zoom out"
        onClick={(event) => zoomOut({ duration: viewportTransitionMs(event.currentTarget) })}
      >
        <MinusIcon />
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        iconOnly
        disabled={atMaxZoom}
        aria-label="Zoom in"
        onClick={(event) => zoomIn({ duration: viewportTransitionMs(event.currentTarget) })}
      >
        <PlusIcon />
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        iconOnly
        aria-label="Fit view"
        onClick={(event) => fitView({ ...fitViewOptions, duration: viewportTransitionMs(event.currentTarget) })}
      >
        <MaximizeIcon />
      </Button>
    </Panel>
  );
}

export function FlowNode({ selected, className, ...props }: FlowNodeProps) {
  return (
    <div
      {...props}
      data-control-ui="flow"
      data-control-family="flow"
      data-slot="node"
      data-selected={selected || undefined}
      className={cn("flex flex-col", className)}
    />
  );
}

export function FlowNodeHeader({ className, ...props }: FlowNodePartProps) {
  return (
    <div
      {...props}
      data-control-ui="flow"
      data-control-family="flow"
      data-slot="node-header"
      className={cn("flex items-center", className)}
    />
  );
}

export function FlowNodeBody({ className, ...props }: FlowNodePartProps) {
  return (
    <div {...props} data-control-ui="flow" data-control-family="flow" data-slot="node-body" className={cn("flex flex-col", className)} />
  );
}

export function FlowHandle(props: FlowHandleProps) {
  return <Handle {...props} data-control-ui="flow" data-control-family="flow" data-slot="handle" />;
}

export function FlowEdge({ dashed, ...props }: FlowEdgeProps) {
  return <BaseEdge {...props} data-control-ui="flow" data-control-family="flow" data-slot="edge" data-dashed={dashed || undefined} />;
}

export function FlowEdgeLabel({ x, y, className, style, ...props }: FlowEdgeLabelProps) {
  return (
    <EdgeLabelRenderer>
      <div
        {...props}
        data-control-ui="flow"
        data-control-family="flow"
        data-slot="edge-label"
        className={cn("nodrag nopan pointer-events-auto absolute flex items-center", className)}
        style={{ ...style, transform: `translate(-50%, -50%) translate(${x}px, ${y}px)` }}
      />
    </EdgeLabelRenderer>
  );
}

export function FlowEdgeLabelChip({ className, ...props }: FlowEdgeLabelChipProps) {
  return (
    <span
      {...props}
      data-control-ui="flow"
      data-control-family="flow"
      data-slot="edge-label-chip"
      className={cn("inline-flex max-w-40 items-center truncate", className)}
    />
  );
}
