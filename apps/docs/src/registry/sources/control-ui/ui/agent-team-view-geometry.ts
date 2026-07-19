import type { AgentTeamViewPosition } from "@/components/control-ui/contracts";

export type AgentTeamViewSize = { width: number; height: number };

export function clampAgentTeamViewZonePosition(
  position: AgentTeamViewPosition,
  canvasSize: AgentTeamViewSize,
  zoneSize: AgentTeamViewSize,
  inset = 24,
): AgentTeamViewPosition {
  const maxX = Math.max(inset, canvasSize.width - zoneSize.width - inset);
  const maxY = Math.max(inset, canvasSize.height - zoneSize.height - inset);

  return {
    x: Math.min(Math.max(position.x, inset), maxX),
    y: Math.min(Math.max(position.y, inset), maxY),
  };
}

export function agentTeamViewPositionFromDrag(
  startPosition: AgentTeamViewPosition,
  startPointer: AgentTeamViewPosition,
  currentPointer: AgentTeamViewPosition,
): AgentTeamViewPosition {
  return {
    x: startPosition.x + currentPointer.x - startPointer.x,
    y: startPosition.y + currentPointer.y - startPointer.y,
  };
}
