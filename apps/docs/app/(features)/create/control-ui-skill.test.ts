import { describe, expect, test } from "bun:test";
import { buildControlUiSkill } from "./control-ui-skill";

describe("control-ui skill", () => {
  const skill = buildControlUiSkill({ origin: "https://control-ui.example/" });

  test("is a claude skill with the token contract inside", () => {
    expect(skill.startsWith("---\nname: control-ui\n")).toBe(true);
    expect(skill).toContain("--background [light+dark]");
    expect(skill).toContain("--radius [shared]");
    expect(skill).not.toContain("https://control-ui.example//");
  });
});
