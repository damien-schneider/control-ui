import { describe, expect, test } from "bun:test";
import { buildSetupPrompt } from "./setup-prompt";

describe("agent setup prompt", () => {
  const prompt = buildSetupPrompt({ origin: "https://control-ui.example/" });

  test("joins every registry URL onto the origin without a doubled slash", () => {
    for (const item of ["next-app", "agent-index", "all", "theme-contract", "control-ui-skill"]) {
      expect(prompt).toContain(`https://control-ui.example/r/${item}.json`);
    }
    expect(prompt).not.toContain("https://control-ui.example//");
  });

  test("leaves no unfilled template value", () => {
    expect(prompt).not.toContain("undefined");
  });

  test("settles the direction after the install it can overwrite", () => {
    const setupComplete = prompt.indexOf("Do not move on until both do");
    const discoveryGate = prompt.indexOf("Do not start discovery until every Install and Wire it step above has completed successfully");
    const directionChoice = prompt.indexOf("Should Control UI match this app's existing look, or do you want a new direction?");

    expect(setupComplete).toBeGreaterThan(-1);
    expect(discoveryGate).toBeGreaterThan(setupComplete);
    expect(directionChoice).toBeGreaterThan(discoveryGate);
  });
});
