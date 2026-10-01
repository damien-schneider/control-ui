import { describe, expect, test } from "bun:test";

import { shouldAcceptComboboxValueChange } from "./combobox-disabled-selection";

const disabled = { value: "studio-mic", label: "Studio Mic" };
const enabled = { value: "built-in", label: "Built-in Mic" };
const other = { value: "usb", label: "USB Mic" };
const disabledValues = new Set<unknown>([disabled]);

describe("Combobox disabled selection guard", () => {
  test("single selection rejects a disabled item and accepts enabled values and clearing", () => {
    expect(shouldAcceptComboboxValueChange(disabled, enabled, disabledValues)).toBe(false);
    expect(shouldAcceptComboboxValueChange(enabled, null, disabledValues)).toBe(true);
    expect(shouldAcceptComboboxValueChange(null, enabled, disabledValues)).toBe(true);
  });

  test("single selection keeps working when a disabled item is pre-selected", () => {
    expect(shouldAcceptComboboxValueChange(enabled, disabled, disabledValues)).toBe(true);
    expect(shouldAcceptComboboxValueChange(disabled, disabled, disabledValues)).toBe(true);
  });

  test("multiple selection rejects only newly added disabled items", () => {
    expect(shouldAcceptComboboxValueChange([enabled, disabled], [enabled], disabledValues)).toBe(false);
    expect(shouldAcceptComboboxValueChange([enabled], [], disabledValues)).toBe(true);
    expect(shouldAcceptComboboxValueChange([], [enabled], disabledValues)).toBe(true);
  });

  test("multiple selection with a pre-selected disabled item still accepts other changes", () => {
    expect(shouldAcceptComboboxValueChange([disabled, enabled], [disabled], disabledValues)).toBe(true);
    expect(shouldAcceptComboboxValueChange([disabled, enabled, other], [disabled, enabled], disabledValues)).toBe(true);
    expect(shouldAcceptComboboxValueChange([enabled], [disabled, enabled], disabledValues)).toBe(true);
  });
});
