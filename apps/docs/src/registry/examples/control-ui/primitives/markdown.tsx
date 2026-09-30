"use client";

import { Markdown } from "@/components/control-ui/ui/markdown";

const SAMPLE = `## Deploy checklist

Here's the **plan** and a quick fix.

1. Run the migration
2. Restart the worker
3. Verify \`GET /health\`

A change to \`greet.ts\`:

\`\`\`diff
@@ -1,3 +1,3 @@ export function greet()
 export function greet(name) {
-  return "Hello " + name;
+  return \`Hello \${name}!\`;
 }
\`\`\`

And the new helper:

\`\`\`ts
export const slugify = (s: string) => s.trim().toLowerCase().replace(/\\s+/g, "-");
\`\`\`

| Env | Status |
| --- | ------ |
| prod | ✅ |
| staging | ⏳ |
`;

export function PrimitiveMarkdownExample() {
  return (
    <div className="w-full max-w-2xl rounded-panel border bg-background p-4">
      <Markdown content={SAMPLE} />
    </div>
  );
}
