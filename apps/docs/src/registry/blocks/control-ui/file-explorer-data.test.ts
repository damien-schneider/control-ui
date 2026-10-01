import { describe, expect, test } from "bun:test";
import { type FileExplorerLocation, orderFileExplorerEntries, resolveFileExplorer, searchFileExplorer } from "./file-explorer-data";

const location: FileExplorerLocation = {
  id: "workspace",
  label: "Workspace",
  entries: [
    {
      id: "src",
      name: "src",
      kind: "folder",
      children: [
        {
          id: "components",
          name: "components",
          kind: "folder",
          children: [{ id: "button", name: "button.tsx", kind: "file" }],
        },
      ],
    },
    { id: "readme", name: "README.md", kind: "file" },
  ],
};

describe("file explorer data", () => {
  test("resolves a nested selection into browsable columns and breadcrumbs", () => {
    const result = resolveFileExplorer(location, ["src", "components", "button"]);

    expect(result.columns.map((column) => column.label)).toEqual(["Workspace", "src", "components"]);
    expect(result.breadcrumbs.map((breadcrumb) => breadcrumb.label)).toEqual(["Workspace", "src", "components", "button.tsx"]);
    expect(result.selectedEntry?.name).toBe("button.tsx");
    expect(result.validPath).toEqual(["src", "components", "button"]);
  });

  test("returns nested search results with their selectable path", () => {
    const results = searchFileExplorer(location, "button");

    expect(results).toHaveLength(1);
    expect(results[0]?.path).toEqual(["src", "components", "button"]);
    expect(results[0]?.parents).toEqual(["src", "components"]);
  });

  test("orders entries the way grouped columns render them so arrow keys follow the visual order", () => {
    const ordered = orderFileExplorerEntries([
      { id: "a", name: "a", kind: "file", group: "Today" },
      { id: "b", name: "b", kind: "file", group: "Yesterday" },
      { id: "c", name: "c", kind: "file", group: "Today" },
    ]);

    expect(ordered.map((entry) => entry.id)).toEqual(["a", "c", "b"]);
  });
});
