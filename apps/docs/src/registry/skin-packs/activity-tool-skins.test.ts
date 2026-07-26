import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { ActivityKind, ActivityState } from "../contracts";
import type { ControlUiSkin, SlotOverride } from "../skin";
import { skin as cuicui } from "./cuicui/skin.config";
import { skin as linear } from "./linear/skin.config";
import { skin as modernApple } from "./modern-apple/skin.config";
import { skin as xp } from "./xp/skin.config";

type ActivitySlotPart = "root" | "status" | "trigger";

// Every part listed in ActivitySlotPart reads `kind`, and root/status also read `state`, so one ctx serves all
// three: an override declared over the narrower ctx still accepts the wider one.
function resolveActivitySlot(skin: ControlUiSkin, part: ActivitySlotPart, kind: ActivityKind) {
  const slot: SlotOverride<{ kind: ActivityKind; state: ActivityState }> | undefined = skin.slots?.activity?.[part];
  if (typeof slot !== "function") return slot;
  return slot({ kind, state: "success" });
}

describe("tool Activity skin treatments", () => {
  test.each([
    ["Cuicui", cuicui, ["root", "trigger", "status"]],
    ["Linear", linear, ["root", "trigger"]],
    ["Modern Apple", modernApple, ["root", "trigger"]],
    ["XP", xp, ["root", "trigger"]],
  ] as const)("%s preserves its tool-only slots", (_name, skin, parts) => {
    for (const part of parts) {
      expect(resolveActivitySlot(skin, part, "tool")).toBeTruthy();
      expect(resolveActivitySlot(skin, part, "default")).toBeUndefined();
    }
  });

  test("Rig targets the typed tool Activity selector and state", () => {
    const css = readFileSync(path.join(import.meta.dir, "rig/skin.css"), "utf8");
    expect(css).toContain('[data-control-ui="activity"][data-slot="root"][data-activity-kind="tool"]');
    expect(css).toContain('[data-activity-state="running"]');
    expect(css).toContain('[data-activity-state="error"]');
    expect(css).not.toContain('[data-control-ui="tool-call"]');
    expect(css).not.toContain("data-tool-state");
  });
});
