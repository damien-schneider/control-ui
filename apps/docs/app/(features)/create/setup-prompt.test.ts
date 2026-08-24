import { describe, expect, test } from "bun:test";
import { buildSetupPrompt } from "./setup-prompt";

describe("agent setup prompt", () => {
  const prompt = buildSetupPrompt({ origin: "https://control-ui.example/" });

  test("carries the scaffold command and the catalog the agent installs from", () => {
    expect(prompt).toContain("https://control-ui.example/r/next-app.json");
    expect(prompt).toContain("https://control-ui.example/r/agent-index.json");
    expect(prompt).not.toContain("https://control-ui.example//");
  });

  test("names the wiring steps that fail silently instead of loudly", () => {
    expect(prompt).toContain("../src/components/…");
    expect(prompt).toContain("Stamp data-skin on the root element");
  });

  test("leaves the base skin for the agent to fill, since it installs the pack itself", () => {
    expect(prompt).toContain("Set baseSkin to the id of the skin pack you installed");
    expect(prompt).toContain('"baseSkin": "<installed skin id>"');
    expect(prompt).not.toContain("undefined");
  });

  test("chooses between the existing visual language and a new direction after setup", () => {
    const setupComplete = prompt.indexOf("Do not move on until both do");
    const directionChoice = prompt.indexOf("After installation and wiring are verified, if this project already had an interface, ask me");

    expect(setupComplete).toBeGreaterThan(-1);
    expect(directionChoice).toBeGreaterThan(setupComplete);
    expect(prompt).toContain("inspect its theme tokens, CSS, typography, spacing, components, and representative screens");
    expect(prompt).toContain("If I choose a new direction, or this project was newly scaffolded, ask me to describe the style I want");
    expect(prompt).toContain("attach one or more reference images");
  });
});
