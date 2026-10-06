import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";

const uiDirectory = new URL("./ui/", import.meta.url);
const colorPickerSource = readdirSync(uiDirectory)
  .filter((file) => file.startsWith("color-picker") && file.endsWith(".tsx"))
  .map((file) => readFileSync(new URL(file, uiDirectory), "utf8"))
  .join("\n");
const gradientEditorSource = readFileSync(new URL("./ui/gradient-editor.tsx", import.meta.url), "utf8");
const inputExampleSource = readFileSync(new URL("../../examples/control-ui/primitives/input.tsx", import.meta.url), "utf8");

describe("Control UI accessibility contracts", () => {
  test("color picker controls have default accessible names", () => {
    expect(colorPickerSource).toMatch(/Choose color \(\$\{valueString\}\)/);
    expect(colorPickerSource).toContain("ariaLabel ?? label");
    expect(colorPickerSource).toContain('label: "Hue"');
    expect(colorPickerSource).toContain('label: "Opacity"');
    expect(colorPickerSource).toContain('aria-label="Wheel hue"');
    expect(colorPickerSource).toContain('aria-label="Wheel saturation"');
    expect(colorPickerSource).toContain('ariaLabel ?? "Color value"');
    expect(colorPickerSource).toContain('ariaLabel ?? "Color format"');
    expect(colorPickerSource).toMatch(/ariaLabel \?\? `\$\{CHANNEL_NAMES\[channel\]\} channel`/);
    expect(colorPickerSource).not.toContain("typeof label");
    expect(colorPickerSource).toMatch(/`Set color \$\{color\}`/);
  });

  test("gradient editor exposes keyboard operations for stops", () => {
    expect(gradientEditorSource).toContain("<fieldset");
    expect(gradientEditorSource).toContain('ariaLabel ?? "Gradient stops"');
    expect(gradientEditorSource).toContain('case "ArrowLeft":');
    expect(gradientEditorSource).toContain('case "ArrowRight":');
    expect(gradientEditorSource).toContain('case "Home":');
    expect(gradientEditorSource).toContain('case "End":');
    expect(gradientEditorSource).toContain('case "Delete":');
  });

  test("input primitive example demonstrates associated labels", () => {
    expect(inputExampleSource).toContain("FieldLabel");
    expect(inputExampleSource).toContain("FieldControl");
    expect(inputExampleSource).not.toContain("<span");
  });
});
