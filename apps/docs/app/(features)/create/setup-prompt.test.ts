import { describe, expect, test } from "bun:test";
import { buildSetupPrompt } from "./setup-prompt";

describe("agent setup prompt", () => {
  const prompt = buildSetupPrompt({ origin: "https://control-ui.example/" });

  test("hands over the runner for a package manager that is not npm", () => {
    expect(prompt).toContain("pnpm → pnpm dlx shadcn@latest");
    expect(prompt).toContain("bun → bunx --bun shadcn@latest");
    expect(prompt).toContain("Read the lockfile and run mine instead");
  });

  test("carries the scaffold command and the catalog the agent installs from", () => {
    expect(prompt).toContain("https://control-ui.example/r/next-app.json");
    expect(prompt).toContain("https://control-ui.example/r/agent-index.json");
    expect(prompt).not.toContain("https://control-ui.example//");
  });

  test("names the wiring steps that fail silently instead of loudly", () => {
    expect(prompt).toContain("Stamp data-skin on the root element");
    expect(prompt).toContain("not a multi-skin switch, so one skin still needs it");
    expect(prompt).toContain("the skin out-specifies that block on purpose and wins");
  });

  test("makes the agent resolve the css imports the registry cannot address", () => {
    expect(prompt).toContain("The registry cannot know this app's layout");
    expect(prompt).toContain("Check every line resolves before moving on");
    expect(prompt).toContain("Never edit or reorder the imported stylesheets themselves");
  });

  test("keeps the verification out of my app and out of shared files", () => {
    expect(prompt).toContain("Do that on a throwaway route, then delete the route and its directory");
    expect(prompt).toContain("Stay inside the app you are installing into");
    expect(prompt).toContain("propose the edit and wait");
    // The lockfile is written by the install, not chosen: stopping on it turns every workspace install into a checkpoint.
    expect(prompt).toContain("the install writes the shared lockfile itself");
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

  test("starts on the neutral reset pack the theme can fully own", () => {
    expect(prompt).toContain("npx shadcn@latest add https://control-ui.example/r/all-flat.json");
    expect(prompt).toContain("an empty skin.css and no adornments");
    expect(prompt).toContain("Resemblance is not a reason to switch packs");
  });

  test("settles the direction after the install it can overwrite", () => {
    const setupComplete = prompt.indexOf("Do not move on until both do");
    const discoveryGate = prompt.indexOf("Do not start discovery until every Install and Wire it step above has completed successfully");
    const directionChoice = prompt.indexOf("Should Control UI match this app's existing look, or do you want a new direction?");

    expect(setupComplete).toBeGreaterThan(-1);
    expect(discoveryGate).toBeGreaterThan(setupComplete);
    expect(directionChoice).toBeGreaterThan(discoveryGate);
    expect(prompt).toContain("attach reference images if you have any");
  });

  test("leaves an update path that matches what was installed", () => {
    expect(prompt).toContain("control-ui:diff");
    expect(prompt).toContain("control-ui:update");
    expect(prompt).toContain("https://control-ui.example/r/update.json`, the complete component set with no skin");
  });

  test("offers the shadcn call sites instead of migrating them silently", () => {
    expect(prompt).toContain("Never migrate without my answer");
    expect(prompt).toContain("read the exported prop types of the installed Control UI component");
    expect(prompt).toContain("Leave the shadcn source in place");
  });
});
