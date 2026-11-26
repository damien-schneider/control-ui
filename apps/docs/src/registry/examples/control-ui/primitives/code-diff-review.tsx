"use client";

import { useState } from "react";
import { Button } from "@/components/control-ui/ui/button";
import { CodeDiff, type CodeDiffAnnotation, type DiffLineRange } from "@/components/control-ui/ui/code-diff";

const OLD = `export function cartTotal(cart: Cart) {
  const items = cart.items;
  const total = sum(items);
  return total;
}`;

const NEW = `export function cartTotal(cart: Cart, discount = 0) {
  const items = cart.items;
  const total = sum(items) * (1 - discount);
  return Math.round(total * 100) / 100;
}`;

const INITIAL_SELECTION: DiffLineRange[] = [{ from: { side: "old", line: 3 }, to: { side: "new", line: 4 } }];

export function PrimitiveCodeDiffReviewExample() {
  const [selectedLines, setSelectedLines] = useState(INITIAL_SELECTION);
  const lastSelected = selectedLines.at(-1)?.to;
  const annotations: CodeDiffAnnotation<string>[] = lastSelected ? [{ at: lastSelected, key: "ask", data: "selection" }] : [];

  return (
    <div className="w-full max-w-2xl">
      <CodeDiff
        name="cart.ts"
        lang="ts"
        oldText={OLD}
        newText={NEW}
        selectedLines={selectedLines}
        onSelectedLinesChange={setSelectedLines}
        annotations={annotations}
        renderAnnotation={() => (
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" size="xs" variant="surface">
              Explain
            </Button>
            <Button type="button" size="xs" variant="surface">
              What could break?
            </Button>
            <Button type="button" size="xs" variant="quiet" onClick={() => setSelectedLines([])}>
              Clear
            </Button>
          </div>
        )}
      />
    </div>
  );
}
