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
    expect(prompt).toContain("then continue directly to Install");
    expect(prompt).toContain("This is a status update, not an approval checkpoint");
    expect(prompt).toContain("List every package it added or changed");
  });

  test("leaves the base skin for the agent to fill, since it installs the pack itself", () => {
    expect(prompt).toContain("Set baseSkin to the id of the skin pack you installed");
    expect(prompt).toContain('"baseSkin": "<installed skin id>"');
    expect(prompt).not.toContain("undefined");
  });

  test("settles the direction after the install it can overwrite", () => {
    const startingPack = prompt.indexOf("tell me it is a starting point, not the answer");
    const setupComplete = prompt.indexOf("Do not move on until both do");
    const discoveryGate = prompt.indexOf("Do not start discovery until every Install and Wire it step above has completed successfully");
    const directionChoice = prompt.indexOf("Should Control UI match this app's existing look, or do you want a new direction?");

    expect(startingPack).toBeGreaterThan(-1);
    expect(setupComplete).toBeGreaterThan(startingPack);
    expect(discoveryGate).toBeGreaterThan(setupComplete);
    expect(directionChoice).toBeGreaterThan(discoveryGate);
    expect(prompt).toContain("attach reference images if you have any");
    expect(prompt).toContain("install the pack whose defaults land closest to it with --overwrite and update data-skin");
  });
});
