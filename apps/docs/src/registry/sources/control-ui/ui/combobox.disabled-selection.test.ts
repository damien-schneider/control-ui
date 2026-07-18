import { describe, expect, test } from "bun:test";

import { emitComboboxValueChange, shouldAcceptComboboxValueChange } from "./combobox-disabled-selection";

describe("Combobox disabled selection guard", () => {
  test("rejects value changes emitted from disabled items", () => {
    const disabledValue = { value: "studio-mic", label: "Studio Mic" };
    const selectedValue = { value: "built-in", label: "Built-in Mic" };
    const disabledValues = new Set<unknown>([disabledValue]);
    let currentValue = selectedValue;

    expect(shouldAcceptComboboxValueChange(disabledValue, disabledValues)).toBe(false);
    expect(
      emitComboboxValueChange(disabledValue, disabledValues, (value) => {
        currentValue = value ?? selectedValue;
      }),
    ).toBe(false);
    expect(currentValue).toBe(selectedValue);
  });

  test("accepts enabled values and clearing the selection", () => {
    const disabledValue = { value: "studio-mic", label: "Studio Mic" };
    const enabledValue = { value: "built-in", label: "Built-in Mic" };
    const disabledValues = new Set<unknown>([disabledValue]);

    expect(shouldAcceptComboboxValueChange(enabledValue, disabledValues)).toBe(true);
    expect(shouldAcceptComboboxValueChange(null, disabledValues)).toBe(true);
  });
});
