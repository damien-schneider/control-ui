"use client";

import {
  type Edge,
  type EdgeProps,
  type EdgeTypes,
  getBezierPath,
  type Node,
  type NodeProps,
  type NodeTypes,
  Position,
} from "@xyflow/react";
import { BugIcon, CreditCardIcon, type LucideIcon, SparklesIcon, WebhookIcon } from "lucide-react";
import { cn } from "@/components/control-ui/lib/cn";
import {
  Flow,
  FlowControls,
  FlowEdge,
  FlowEdgeLabel,
  FlowEdgeLabelChip,
  FlowHandle,
  FlowNode,
  FlowNodeHeader,
} from "@/components/control-ui/ui/flow";
import { Text } from "@/components/control-ui/ui/typography";
import { PreviewPanel } from "./preview-panel";

type StepKind = "trigger" | "model" | "billing" | "engineering";

type StepNode = Node<{ title: string; detail: string; kind: StepKind; target?: Position; source?: Position }, "step">;

type StepEdge = Edge<{ label?: string }, "step">;

const stepIcons: Record<StepKind, { icon: LucideIcon; className: string }> = {
  trigger: { icon: WebhookIcon, className: "bg-warning/15 text-warning-text" },
  model: { icon: SparklesIcon, className: "bg-info/15 text-info-text" },
  billing: { icon: CreditCardIcon, className: "bg-success/15 text-success-text" },
  engineering: { icon: BugIcon, className: "bg-destructive/15 text-destructive-text" },
};

function StepNodeCard({ data, selected }: NodeProps<StepNode>) {
  const { icon: Icon, className } = stepIcons[data.kind];
  return (
    <FlowNode selected={selected} className="w-32">
      {data.target ? <FlowHandle type="target" position={data.target} /> : null}
      <FlowNodeHeader>
        <span className={cn("grid size-6 shrink-0 place-items-center rounded-md", className)}>
          <Icon aria-hidden="true" className="size-3.5" />
        </span>
        <span className="grid min-w-0">
          <Text size="label" weight="medium" className="truncate">
            {data.title}
          </Text>
          <Text size="micro" tone="muted" className="truncate">
            {data.detail}
          </Text>
        </span>
      </FlowNodeHeader>
      {data.source ? <FlowHandle type="source" position={data.source} /> : null}
    </FlowNode>
  );
}

function StepEdgePath({ data, ...edge }: EdgeProps<StepEdge>) {
  const [path, labelX, labelY] = getBezierPath(edge);
  return (
    <>
      <FlowEdge id={edge.id} path={path} />
      {data?.label ? (
        <FlowEdgeLabel x={labelX} y={labelY}>
          <FlowEdgeLabelChip>{data.label}</FlowEdgeLabelChip>
        </FlowEdgeLabel>
      ) : null}
    </>
  );
}

const nodeTypes: NodeTypes = { step: StepNodeCard };

const edgeTypes: EdgeTypes = { step: StepEdgePath };

const nodes: StepNode[] = [
  {
    id: "ticket",
    type: "step",
    position: { x: 0, y: 0 },
    data: { title: "New ticket", detail: "Webhook", kind: "trigger", source: Position.Right },
  },
  {
    id: "classify",
    type: "step",
    position: { x: 188, y: 0 },
    selected: true,
    data: { title: "Classify", detail: "Model call", kind: "model", target: Position.Left, source: Position.Bottom },
  },
  {
    id: "billing",
    type: "step",
    position: { x: 188, y: 102 },
    data: { title: "Billing", detail: "Queue", kind: "billing", target: Position.Top },
  },
  {
    id: "engineering",
    type: "step",
    position: { x: 26, y: 140 },
    data: { title: "Engineering", detail: "Queue", kind: "engineering", target: Position.Top },
  },
];

const edges: StepEdge[] = [
  { id: "ticket-classify", type: "step", source: "ticket", target: "classify", data: {} },
  { id: "classify-billing", type: "step", source: "classify", target: "billing", data: { label: "billing" } },
  { id: "classify-engineering", type: "step", source: "classify", target: "engineering", data: { label: "bug" } },
];

const FIT_VIEW_OPTIONS = { padding: "6%", maxZoom: 1 } as const;

export function FlowPreview() {
  return (
    <PreviewPanel>
      <div className="h-50" onPointerDown={(event) => event.stopPropagation()}>
        <Flow<StepNode, StepEdge>
          aria-label="Ticket triage workflow"
          defaultNodes={nodes}
          defaultEdges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={FIT_VIEW_OPTIONS}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          panOnScroll={false}
          preventScrolling={false}
        >
          <FlowControls position="bottom-right" fitViewOptions={FIT_VIEW_OPTIONS} />
        </Flow>
      </div>
    </PreviewPanel>
  );
}
