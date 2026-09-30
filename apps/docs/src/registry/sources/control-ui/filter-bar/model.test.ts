import { describe, expect, test } from "bun:test";
import { formatFilterValue, parseCustomValue } from "./model";
import type { FilterBarField, FilterBarItem } from "./types";

const numericField: FilterBarField = { id: "votes", label: "Votes", type: "number" };

describe("filter value input", () => {
  test("keeps zero, negative decimals and scientific notation numeric", () => {
    expect(parseCustomValue(numericField, "0")).toBe(0);
    expect(parseCustomValue(numericField, " -.25 ")).toBe(-0.25);
    expect(parseCustomValue(numericField, "1e3")).toBe(1000);
  });
  test("rejects empty, incomplete, non-decimal and non-finite numbers", () => {
    for (const input of ["", " ", "-", "1e", "Infinity", "1e999", "NaN", "0xff", "12px"])
      expect(parseCustomValue(numericField, input)).toBeUndefined();
  });
  test("false stays a boolean and unknown boolean text is rejected", () => {
    const field: FilterBarField = { id: "featured", label: "Featured", type: "boolean" };
    expect(parseCustomValue(field, "false")).toBe(false);
    expect(parseCustomValue(field, "TRUE")).toBe(true);
    expect(parseCustomValue(field, "yes")).toBeUndefined();
  });
  test("keeps selected remote labels when search results no longer contain them", () => {
    const field: FilterBarField = {
      id: "assignee",
      label: "Assignee",
      options: [],
      formatValue: (value) => (value === "maya" ? "Maya Chen" : String(value)),
    };
    const item: FilterBarItem = { id: "filter", fieldId: "assignee", operatorId: "in", value: ["maya"] };
    expect(formatFilterValue(item, field)).toBe("Maya Chen");
  });
  test("renders zero, false and zero-value operators without treating them as missing", () => {
    const item: FilterBarItem = { id: "filter", fieldId: "votes", operatorId: "is", value: 0 };
    expect(formatFilterValue(item, numericField)).toBe("0");
    expect(formatFilterValue({ ...item, value: false }, { id: "featured", label: "Featured", type: "boolean" })).toBe("False");
    expect(formatFilterValue({ ...item, value: null }, numericField)).toBe("");
  });
});
