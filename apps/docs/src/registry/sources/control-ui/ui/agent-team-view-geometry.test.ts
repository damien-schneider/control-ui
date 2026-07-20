import { describe, expect, test } from "bun:test";
import { agentTeamViewPositionFromDrag } from "./agent-team-view-geometry";

describe("agent team view geometry", () => {
  test("applies pointer movement in canvas coordinates", () => {
    expect(agentTeamViewPositionFromDrag({ x: 80, y: 90 }, { x: 10, y: 20 }, { x: 34, y: 4 })).toEqual({
      x: 104,
      y: 74,
    });
  });

  test("accounts for canvas zoom while dragging", () => {
    expect(agentTeamViewPositionFromDrag({ x: 80, y: 90 }, { x: 10, y: 20 }, { x: 34, y: 4 }, 0.5)).toEqual({
      x: 128,
      y: 58,
    });
  });
});
