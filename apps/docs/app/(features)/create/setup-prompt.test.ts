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

  test("continues through installation instead of treating the repository report as an approval checkpoint", () => {
    expect(prompt).toContain("then continue directly to Choose the direction with me");
    expect(prompt).toContain("This is a status update, not an approval checkpoint");
  });

  test("settles the direction before the skin pack it decides is installed", () => {
    const directionChoice = prompt.indexOf("Ask me this before you install anything, and wait for my answer");
    const packChoice = prompt.indexOf("pick the skin pack whose defaults land closest to that direction");
    const install = prompt.indexOf("Install exactly one skin pack: the one you picked above");

    expect(directionChoice).toBeGreaterThan(-1);
    expect(packChoice).toBeGreaterThan(directionChoice);
    expect(install).toBeGreaterThan(packChoice);
    expect(prompt).toContain("Never pick one silently");
    expect(prompt).toContain("List every package it added or changed");
    expect(prompt).toContain("attach reference images if you have any");
  });

  test("leaves the base skin for the agent to fill, since it installs the pack itself", () => {
    expect(prompt).toContain("Set baseSkin to the id of the skin pack you installed");
    expect(prompt).toContain('"baseSkin": "<installed skin id>"');
    expect(prompt).not.toContain("undefined");
  });

  test("resumes the chosen direction after setup instead of re-asking for it", () => {
    const setupComplete = prompt.indexOf("Do not move on until both do");
    const discoveryGate = prompt.indexOf("Do not start discovery until every Install and Wire it step above has completed successfully");

    expect(setupComplete).toBeGreaterThan(-1);
    expect(discoveryGate).toBeGreaterThan(setupComplete);
    expect(prompt).toContain("Continue from the direction I already chose; never ask me to choose it again");
    expect(prompt).toContain(
      "If I chose to match the existing look, use its theme tokens, CSS, typography, spacing, components, and representative screens",
    );
    expect(prompt).toContain("If I chose a new direction, deepen the brief I already gave you");
  });
});
