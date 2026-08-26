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

  test("repeats the rules that failed silently in the field", () => {
    expect(skill).toContain("data-skin with the installed skin's id stays on the root element");
    expect(skill).toContain("rewrite the prefix where it points at no file");
    expect(skill).toContain("scripts/fix-css-imports.mjs");
    expect(skill).toContain("scripts/control-ui-doctor.mjs");
    expect(skill).toContain("Tailwind merges every @theme in the build and the last declaration wins");
    expect(skill).toContain("sheds its styling ones");
    // Same emitter as the setup prompt's Apply section, so the two lanes cannot drift apart.
    expect(skill).toContain("Import that file on the last line of the entry's import block");
  });
});
