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

  test("explains optional skin scope and preserves app-owned tokens", () => {
    expect(prompt).toContain("No data-skin stamp or provider is required");
    expect(prompt).toContain("SkinProvider");
    expect(prompt).toContain("Application :root and .dark tokens override");
    expect(prompt).toContain("scripts/control-ui-doctor.mjs");
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

    expect(prompt).toContain("the install writes the shared lockfile itself");
  });

  test("names the workspace target and makes the per-app-versus-shared choice mine", () => {
    expect(prompt).toContain("run every command from that app's directory");
    expect(prompt).toContain("A second Control UI install in the same workspace is an architecture decision");

    expect(prompt).toContain("@source the package");
  });

  test("continues through installation instead of treating the repository report as an approval checkpoint", () => {
    expect(prompt).toContain("then continue directly to Install");
    expect(prompt).toContain("This is a status update, not an approval checkpoint");
    expect(prompt).toContain("List every package it added or changed");
  });

  test("leaves the base skin for the agent to fill, since it installs the pack itself", () => {
    expect(prompt).toContain('Set baseSkin to "none" for the library defaults');
    expect(prompt).toContain('"baseSkin": "<installed skin id>"');
    expect(prompt).not.toContain("undefined");
  });

  test("starts on the neutral reset pack the theme can fully own", () => {
    expect(prompt).toContain("npx shadcn@latest add https://control-ui.example/r/all.json");
    expect(prompt).toContain("no skin config or provider");
    expect(prompt).toContain("The application owns its theme");
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

    expect(prompt).toContain("scripts/fix-css-imports.mjs");
    expect(prompt).toContain("control-ui:doctor");
  });

  test("offers the shadcn call sites instead of migrating them silently", () => {
    expect(prompt).toContain("Never migrate without my answer");
    expect(prompt).toContain("read the exported prop types of the installed Control UI component");
    expect(prompt).toContain("Leave the shadcn source in place");

    expect(prompt).toContain("Migrating the call sites without migrating the token plumbing");
  });

  test("inventories the app's own components instead of naming four obvious ones", () => {
    expect(prompt).toContain("inventory that directory, look every component up in the catalog index");

    expect(prompt).toContain("A tree or a scroll area counts as much as a button");
    expect(prompt).toContain("sheds its styling ones");
  });

  test("carries the theme into every installed app instead of ending at the docs site", () => {
    expect(prompt).toContain("Apply it");

    expect(prompt).toContain("<short-name>.control-ui-theme.css");
    expect(prompt).toContain("Import that file on the last line of the entry's import block");
    expect(prompt).toContain("Every app this run installed into gets the same theme");
    expect(prompt).toContain('stamp data-motion="reduced"');

    expect(prompt).not.toContain("Embedded canonical contract fallback");
    expect(prompt).toContain("https://control-ui.example/r/theme-contract.json");
  });

  test("says the reset visibly degrades the app until the theme lands", () => {
    expect(prompt).toContain("The reset is scaffolding, never the state you leave me in");
  });

  test("ships the skill with the install instead of offering a manual fetch", () => {
    expect(prompt).toContain("The install already wrote .claude/skills/control-ui/SKILL.md");
    expect(prompt).toContain("control-ui:update keeps it current");
    expect(prompt).toContain("https://control-ui.example/r/control-ui-skill.json");
  });
});
