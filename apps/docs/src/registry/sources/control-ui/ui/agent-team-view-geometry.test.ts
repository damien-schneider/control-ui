import { describe, expect, test } from "bun:test";
import { agentTeamViewPositionFromDrag, clampAgentTeamViewZonePosition } from "./agent-team-view-geometry";

describe("agent team view geometry", () => {
  test("applies ordinary canvas pointer deltas without projection math", () => {
    expect(agentTeamViewPositionFromDrag({ x: 100, y: 200 }, { x: 50, y: 40 }, { x: 146, y: 104 })).toEqual({
      x: 196,
      y: 264,
    });
  });

  test("clamps movement against every canvas edge", () => {
    const canvas = { width: 1040, height: 640 };
    const zone = { width: 256, height: 188 };

    expect(clampAgentTeamViewZonePosition({ x: -1, y: 100 }, canvas, zone)).toEqual({ x: 24, y: 100 });
    expect(clampAgentTeamViewZonePosition({ x: 1000, y: 100 }, canvas, zone)).toEqual({ x: 760, y: 100 });
    expect(clampAgentTeamViewZonePosition({ x: 100, y: -1 }, canvas, zone)).toEqual({ x: 100, y: 24 });
    expect(clampAgentTeamViewZonePosition({ x: 100, y: 900 }, canvas, zone)).toEqual({ x: 100, y: 428 });
  });

  test("keeps an oversized zone at the canvas inset", () => {
    expect(
      clampAgentTeamViewZonePosition(
        { x: 80, y: 90 },
        { width: 200, height: 100 },
        { width: 256, height: 188 },
      ),
    ).toEqual({ x: 24, y: 24 });
  });
});
