import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { collectSkinContract, collectThemeContract, stateShapeFromType } from "./collect";

function stateAt(contract: ReturnType<typeof collectSkinContract>, scope: string, part: string, attribute: string) {
  return contract.scopes[scope]?.parts[part]?.states.find((state) => state.attribute === attribute);
}

describe("skin contract generation", () => {
  test("is deterministic and keeps root first", () => {
    const first = collectSkinContract();
    const second = collectSkinContract();
    expect(second).toEqual(first);
    expect(Object.keys(first.scopes.button.parts)[0]).toBe("root");
    expect(Object.keys(first.scopes)).toEqual([...Object.keys(first.scopes)].sort());
  });

  test("resolves ownership, adornments, and semantic families", () => {
    const contract = collectSkinContract();
    expect(contract.version).toBe(8);
    expect(contract.selectorPattern).toBe('[data-skin="{skin}"] :where([data-slot="{part}"][data-control-family="{family}"])');
    expect(contract.scopes.button.parts.root.family).toBe("button");
    expect(contract.scopes["code-diff"].registryItems).toContain("code-diff");
    expect(contract.scopes.button.parts.root.registryItems).toEqual(["button"]);
    expect(contract.scopes.button.parts.content.registryItems).toEqual(["button", "dropdown-menu", "select"]);
    expect(contract.scopes.button.parts.root.states).toContainEqual({
      attribute: "data-variant",
      source: "control-ui",
      valueKind: "enum",
      values: ["ghost", "quiet", "solid", "surface"],
    });
    expect(contract.scopes.tree.parts.root.states.some((state) => state.attribute === "data-selection-mode")).toBe(false);
    expect(contract.scopes["dropdown-menu"].parts.item.states).toContainEqual({
      attribute: "data-highlighted",
      source: "external",
      valueKind: "presence",
      values: [],
    });
    expect(contract.adornments["chat-composer"]["send-layer"].context.sendCount).toBe("number");
    expect(contract.scopes.skeleton?.parts.paint).toBeUndefined();
    expect(contract.semanticFamilies.surfaces.floating).toContainEqual({ scope: "dropdown-menu", part: "content" });
    expect(contract.semanticFamilies.popup["list-surface"]).toContainEqual({ scope: "dropdown-menu", part: "content" });
    expect(contract.semanticFamilies.popup["list-surface"]).toContainEqual({ scope: "context-menu", part: "sub-content" });
    expect(contract.semanticFamilies.popup.surface).toContainEqual({ scope: "popover", part: "content" });
    expect(contract.semanticFamilies.popup.item).toContainEqual({ scope: "select", part: "item" });
    expect(contract.semanticFamilies.popup.label).toContainEqual({ scope: "autocomplete", part: "group-label" });
    expect(contract.semanticFamilies.surfaces.modal).toContainEqual({ scope: "dialog", part: "content" });
    expect(contract.semanticFamilies.surfaces.panel).toContainEqual({ scope: "code-diff", part: "root" });
    expect(["toggle", "dock", "close"].filter((part) => contract.scopes["dockable-panel"].parts[part])).toEqual([]);
  });

  test("publishes every registered knob with its recipe default", () => {
    const contract = collectSkinContract();
    expect(Object.keys(contract.knobs)).toEqual([...Object.keys(contract.knobs)].sort());
    expect(contract.knobs.button).toContainEqual({
      name: "--cui-button-radius",
      syntax: expect.any(String),
      initialValue: expect.any(String),
      defaultValue: expect.any(String),
    });
    expect(contract.knobs.popup?.length).toBeGreaterThan(0);
    for (const knobs of Object.values(contract.knobs)) {
      for (const knob of knobs) {
        expect(knob.name).toStartWith("--cui-");
        expect(knob.defaultValue).not.toBe("");
      }
    }
  });

  test("derives only emitted external states and preserves finite Control UI state values", () => {
    const contract = collectSkinContract();
    const nativeSelectStates = contract.scopes["native-select"].parts.root.states.map((state) => state.attribute);
    expect(nativeSelectStates).not.toContain("data-active");
    expect(nativeSelectStates).not.toContain("data-popup-open");
    expect(contract.scopes.select.parts.trigger.states).toContainEqual({
      attribute: "data-popup-side",
      source: "external",
      valueKind: "enum",
      values: ["bottom", "inline-end", "inline-start", "left", "right", "top"],
    });
    expect(contract.scopes["code-diff"].parts.line.states).toContainEqual({
      attribute: "data-line-type",
      source: "control-ui",
      valueKind: "enum",
      values: ["add", "context", "del"],
    });
    expect(stateAt(contract, "item", "separator", "data-separator")).toBeUndefined();
    expect(stateAt(contract, "resizable", "handle", "data-separator")).toEqual({
      attribute: "data-separator",
      source: "external",
      valueKind: "enum",
      values: ["active", "disabled", "focus", "hover"],
    });
  });

  test("preserves exact finite and presence-only emitted state types", () => {
    const contract = collectSkinContract();
    const activityStatus: NonNullable<ReturnType<typeof stateAt>> = {
      attribute: "data-status",
      source: "control-ui",
      valueKind: "enum",
      values: ["error", "pending", "running", "success"],
    };
    const presenceState = (attribute: string): NonNullable<ReturnType<typeof stateAt>> => ({
      attribute,
      source: "control-ui",
      valueKind: "presence",
      values: [],
    });

    expect(stateAt(contract, "activity", "root", "data-activity-state")).toEqual({ ...activityStatus, attribute: "data-activity-state" });
    expect(stateAt(contract, "activity", "announcement", "data-status")).toEqual(activityStatus);
    expect(stateAt(contract, "activity", "status", "data-status")).toEqual(activityStatus);
    expect(stateAt(contract, "activity", "root", "data-activity-kind")).toEqual({
      attribute: "data-activity-kind",
      source: "control-ui",
      valueKind: "enum",
      values: ["default", "reasoning", "signal", "tool"],
    });
    expect(stateAt(contract, "activity", "root", "data-activity-name")).toEqual({
      attribute: "data-activity-name",
      source: "control-ui",
      valueKind: "open",
      values: [],
    });
    expect(stateAt(contract, "chat-composer", "root", "data-state")).toEqual({
      attribute: "data-state",
      source: "control-ui",
      valueKind: "enum",
      values: ["disabled", "idle", "submitting"],
    });
    expect(stateAt(contract, "code-block-editor", "root", "data-variant")).toEqual({
      attribute: "data-variant",
      source: "control-ui",
      valueKind: "enum",
      values: ["command", "default"],
    });
    expect(stateAt(contract, "sidebar", "root", "data-state")).toEqual({
      attribute: "data-state",
      source: "control-ui",
      valueKind: "enum",
      values: ["collapsed", "expanded"],
    });
    expect(stateAt(contract, "sidebar", "root", "data-collapsible")).toEqual({
      attribute: "data-collapsible",
      source: "control-ui",
      valueKind: "enum",
      values: ["icon", "none", "offcanvas"],
    });
    expect(stateAt(contract, "sidebar", "menu-button", "data-size")).toEqual({
      attribute: "data-size",
      source: "control-ui",
      valueKind: "enum",
      values: ["default", "lg", "sm"],
    });
    expect(stateAt(contract, "sidebar", "menu-button", "data-variant")).toEqual({
      attribute: "data-variant",
      source: "control-ui",
      valueKind: "enum",
      values: ["default", "outline"],
    });
    expect(stateAt(contract, "audio-recorder", "root", "data-disabled")).toEqual({
      attribute: "data-disabled",
      source: "control-ui",
      valueKind: "presence",
      values: [],
    });

    expect(stateAt(contract, "environment-variables", "root", "data-readonly")).toEqual({
      attribute: "data-readonly",
      source: "control-ui",
      valueKind: "presence",
      values: [],
    });
    expect(stateAt(contract, "table-of-contents", "item", "data-active")).toEqual(presenceState("data-active"));
    expect(stateAt(contract, "tree", "item", "data-disabled")).toEqual(presenceState("data-disabled"));
    expect(stateAt(contract, "tree", "item", "data-selected")).toEqual(presenceState("data-selected"));
    expect(stateAt(contract, "tree", "item-trigger", "data-selected")).toEqual(presenceState("data-selected"));
    expect(stateAt(contract, "sidebar", "menu-button", "data-active")).toEqual(presenceState("data-active"));
  });
  test("does not infer enums from quoted utility keys", () => {
    const aliases = new Map<string, string>();
    expect(stateShapeFromType('Pick<Foo, "variant">', aliases)).toEqual({ valueKind: "open", values: [] });
    expect(stateShapeFromType('"solid" | "quiet"', aliases)).toEqual({ valueKind: "enum", values: ["quiet", "solid"] });
    expect(stateShapeFromType('["default", "outline"]', aliases)).toEqual({ valueKind: "enum", values: ["default", "outline"] });
  });

  test("keeps guide copy synchronized with the generated contract version", () => {
    const version = collectSkinContract().version;
    const copy = [
      "content/guides/architecture.mdx",
      "content/guides/get-started.mdx",
      "content/guides/contract-versions.mdx",
      "app/(features)/catalog/guides.ts",
    ];
    for (const relativePath of copy) {
      const source = readFileSync(path.join(process.cwd(), relativePath), "utf8");
      expect(source).toContain(`contract is version ${version}`);
      expect(source).not.toMatch(new RegExp(`contract is version (?!${version}\\b)\\d+`));
    }
  });

  test("keeps emitted state metadata type-only", () => {
    const source = readFileSync(path.join(import.meta.dir, "emitted-states.ts"), "utf8");
    expect(source).toContain("export type EmittedStateContract");
    expect(source).not.toMatch(/\b(?:const|let|var|function|class)\b/);
  });

  test("projects the complete theme token contract", () => {
    const contract = collectThemeContract();
    expect(contract.tokens.length).toBeGreaterThan(100);
    expect(contract.tokens.find((token) => token.name === "--primary")?.tier).toBe("core");
  });

  test("generated files pass the check mode", () => {
    const result = Bun.spawnSync(["bun", "scripts/gen-skin-contract.ts", "--check"], { cwd: process.cwd() });
    expect(result.exitCode).toBe(0);
  });
});
