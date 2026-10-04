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
import {
  Flow,
  FlowBackground,
  FlowControls,
  FlowEdge,
  FlowEdgeLabel,
  FlowEdgeLabelChip,
  FlowHandle,
  FlowNode,
  FlowNodeBody,
  FlowNodeHeader,
} from "@/components/control-ui/ui/flow";

type StepNode = Node<{ title: string; detail: string }, "step">;

type StepEdge = Edge<{ label?: string; dashed?: boolean }, "step">;

function StepNodeCard({ data, selected }: NodeProps<StepNode>) {
  return (
    <FlowNode selected={selected} className="w-52">
      <FlowHandle type="target" position={Position.Top} />
      <FlowNodeHeader>{data.title}</FlowNodeHeader>
      <FlowNodeBody className="text-muted-foreground">{data.detail}</FlowNodeBody>
      <FlowHandle type="source" position={Position.Bottom} />
    </FlowNode>
  );
}

function StepEdgePath({ data, ...edge }: EdgeProps<StepEdge>) {
  const [path, labelX, labelY] = getBezierPath(edge);
  return (
    <>
      <FlowEdge id={edge.id} path={path} dashed={data?.dashed} />
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
  { id: "trigger", type: "step", position: { x: 160, y: 0 }, data: { title: "New ticket", detail: "Support inbox webhook" } },
  { id: "classify", type: "step", position: { x: 160, y: 140 }, data: { title: "Classify intent", detail: "Model call, 3 labels" } },
  { id: "refund", type: "step", position: { x: 0, y: 300 }, data: { title: "Draft refund", detail: "Order lookup tool" } },
  { id: "answer", type: "step", position: { x: 320, y: 300 }, data: { title: "Search docs", detail: "Retrieval, top 5" } },
  { id: "respond", type: "step", position: { x: 160, y: 460 }, data: { title: "Send reply", detail: "Waits for approval" } },
];

const edges: StepEdge[] = [
  { id: "trigger-classify", type: "step", source: "trigger", target: "classify", data: {} },
  { id: "classify-refund", type: "step", source: "classify", target: "refund", data: { label: "Billing" } },
  { id: "classify-answer", type: "step", source: "classify", target: "answer", data: { label: "How-to" } },
  { id: "refund-respond", type: "step", source: "refund", target: "respond", data: {} },
  { id: "answer-respond", type: "step", source: "answer", target: "respond", data: { dashed: true } },
];

const FIT_VIEW_OPTIONS = { padding: 0.2 };

export function PrimitiveFlowExample() {
  return (
    <div className="h-140 w-full overflow-hidden rounded-[var(--radius-panel)] ring-1 ring-border sm:h-150">
      <Flow<StepNode, StepEdge>
        aria-label="Support agent workflow"
        defaultNodes={nodes}
        defaultEdges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={FIT_VIEW_OPTIONS}
      >
        <FlowBackground />
        <FlowControls fitViewOptions={FIT_VIEW_OPTIONS} />
      </Flow>
    </div>
  );
}
