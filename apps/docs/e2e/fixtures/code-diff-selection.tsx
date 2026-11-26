import { useState } from "react";
import { createRoot } from "react-dom/client";
import { CodeDiff, type DiffLineRange } from "@/components/control-ui/ui/code-diff";

const before = ["const a = 1;", "const b = 2;", "const c = 3;", "const d = 4;", "const e = 5;", "const f = 6;"].join("\n");

const after = ["const a = 1;", "const b = 2;", "const c = 30;", "const d = 4;", "const e = 5;", "const e2 = 55;", "const f = 6;"].join(
  "\n",
);

const parameters = new URLSearchParams(location.search);

function formatRanges(ranges: readonly DiffLineRange[]): string {
  return ranges.map(({ from, to }) => `${from.side}${from.line}-${to.side}${to.line}`).join(",");
}

function Fixture() {
  const [selectedLines, setSelectedLines] = useState<DiffLineRange[]>([]);
  return (
    <div style={{ inlineSize: 720, padding: 24 }}>
      <CodeDiff
        name="values.ts"
        oldText={before}
        newText={after}
        diffStyle={parameters.get("style") === "split" ? "split" : "unified"}
        selectedLines={selectedLines}
        onSelectedLinesChange={setSelectedLines}
      />
      <output data-testid="selection">{formatRanges(selectedLines)}</output>
    </div>
  );
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<Fixture />);
