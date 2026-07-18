"use client";

import { useState } from "react";

import type { DiffStyle } from "@/components/control-ui/contracts";
import { Button } from "@/components/control-ui/ui/button";
import { CodeDiff } from "@/components/control-ui/ui/code-diff";

const OLD = `export function greet(name) {
  const message = "Hello, " + name;
  console.log(message);
  return message;
}`;

const NEW = `export function greet(name: string) {
  const message = \`Hello, \${name}!\`;
  return message;
}`;

const PATCH = `diff --git a/src/utils.ts b/src/utils.ts
--- a/src/utils.ts
+++ b/src/utils.ts
@@ -1,3 +1,3 @@ export function slugify()
 export function slugify(input: string) {
-  return input.toLowerCase().replace(/\\s+/g, "-");
+  return input.trim().toLowerCase().replace(/\\s+/g, "-");
 }
`;

export function PrimitiveCodeDiffExample() {
  const [style, setStyle] = useState<DiffStyle>("split");

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button size="xs" active={style === "split"} onClick={() => setStyle("split")}>
          Split
        </Button>
        <Button size="xs" active={style === "unified"} onClick={() => setStyle("unified")}>
          Unified
        </Button>
      </div>
      <CodeDiff name="greet.ts" lang="ts" oldText={OLD} newText={NEW} diffStyle={style} />
      <CodeDiff lang="ts" patch={PATCH} diffStyle="unified" diffIndicators="classic" />
    </div>
  );
}
