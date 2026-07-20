import type { AgentTeamViewPosition } from "@/components/control-ui/contracts";

export function agentTeamViewPositionFromDrag(
  startPosition: AgentTeamViewPosition,
  startPointer: AgentTeamViewPosition,
  currentPointer: AgentTeamViewPosition,
  canvasScale = 1,
): AgentTeamViewPosition {
  const scale = Math.max(canvasScale, 0.01);
  return {
    x: startPosition.x + (currentPointer.x - startPointer.x) / scale,
    y: startPosition.y + (currentPointer.y - startPointer.y) / scale,
  };
}
