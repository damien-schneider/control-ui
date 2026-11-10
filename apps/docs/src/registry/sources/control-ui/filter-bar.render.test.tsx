import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { DEFAULT_FILTER_OPERATORS, FilterBar, type FilterBarItem } from "./filter-bar";

const fields = [{ id: "tag", label: "Tag" }];

function renderChips(value: FilterBarItem[]) {
  return renderToStaticMarkup(
    <FilterBar.Root fields={fields} operators={DEFAULT_FILTER_OPERATORS} value={value} onValueChange={() => {}}>
      <FilterBar.Chips />
    </FilterBar.Root>,
  );
}

describe("FilterBar chip value segment", () => {
  test("keeps a visible, named target when a filter holds no values", () => {
    const html = renderChips([{ id: "a", fieldId: "tag", operatorId: "in", value: [] }]);

    expect(html).toContain('aria-label="Edit value: Value…"');
  });

  test("names the segment after its values", () => {
    const html = renderChips([{ id: "a", fieldId: "tag", operatorId: "in", value: ["bug", "docs"] }]);

    expect(html).toContain('aria-label="Edit value: bug, docs"');
  });
});

describe("FilterBar root", () => {
  test("renders its default filters without a controlled value", () => {
    const html = renderToStaticMarkup(
      <FilterBar.Root
        fields={fields}
        operators={DEFAULT_FILTER_OPERATORS}
        defaultValue={[{ id: "a", fieldId: "tag", operatorId: "is", value: "bug" }]}
      >
        <FilterBar.Chips />
      </FilterBar.Root>,
    );

    expect(html).toContain('aria-label="Edit value: bug"');
  });

  test("speaks the chip controls in the consumer's language", () => {
    const html = renderToStaticMarkup(
      <FilterBar.Root
        fields={fields}
        operators={DEFAULT_FILTER_OPERATORS}
        value={[{ id: "a", fieldId: "tag", operatorId: "is", value: "bug" }]}
        labels={{ editSegment: (stage, label) => `Modifier ${stage} : ${label}`, removeFilter: (filter) => `Retirer : ${filter}` }}
      >
        <FilterBar.Chips />
      </FilterBar.Root>,
    );

    expect(html).toContain('aria-label="Modifier value : bug"');
    expect(html).toContain('aria-label="Retirer : Tag is bug"');
    expect(html).not.toContain("Edit value");
  });
});
