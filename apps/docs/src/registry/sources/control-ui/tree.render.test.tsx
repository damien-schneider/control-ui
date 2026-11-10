import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { Tree, TreeItem, TreeItemContent, TreeItemLabel, TreeItemTrigger } from "./ui/tree";

function renderTree(selectionMode: "single" | "multiple") {
  return renderToString(
    <Tree aria-label="Files" indicator="slide" selectionMode={selectionMode} defaultValue={["a", "b"]}>
      <TreeItem value="a">
        <TreeItemTrigger>
          <TreeItemLabel>a.ts</TreeItemLabel>
        </TreeItemTrigger>
      </TreeItem>
      <TreeItem value="b">
        <TreeItemTrigger>
          <TreeItemLabel>b.ts</TreeItemLabel>
        </TreeItemTrigger>
      </TreeItem>
    </Tree>,
  );
}

function WrappedFolderContent() {
  return (
    <TreeItemContent>
      <TreeItem value="src/a.ts">
        <TreeItemTrigger>
          <TreeItemLabel>a.ts</TreeItemLabel>
        </TreeItemTrigger>
      </TreeItem>
    </TreeItemContent>
  );
}

describe("Tree", () => {
  test("paints every selected row itself when several rows can be selected", () => {
    const multiple = renderTree("multiple");

    expect(multiple).toContain('aria-multiselectable="true"');
    expect(multiple.match(/aria-selected="true"/g)).toHaveLength(2);
    expect(multiple).toContain('data-indicator="none"');
    expect(multiple).not.toContain('data-control-family="track-highlight"');
  });

  test("keeps the sliding highlight for single selection", () => {
    const single = renderTree("single");

    expect(single).toContain('data-indicator="slide"');
    expect(single).toContain('data-control-family="track-highlight"');
  });

  test("treats an item marked expandable as a branch when its content is wrapped in another component", () => {
    const html = renderToString(
      <Tree aria-label="Files" defaultExpandedValue={["src"]}>
        <TreeItem value="src" expandable>
          <TreeItemTrigger>
            <TreeItemLabel>src</TreeItemLabel>
          </TreeItemTrigger>
          <WrappedFolderContent />
        </TreeItem>
      </Tree>,
    );

    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain("a.ts");
  });
});
