"use client";

import { Code, CodeActions, CodeContent, CodeCopy, CodeHeader, CodeTitle } from "@/components/control-ui/ui/code";

const SAMPLE = `import { useState } from "react";

export function Counter({ start = 0 }: { start?: number }) {
  const [count, setCount] = useState(start);
  return <button onClick={() => setCount((n) => n + 1)}>{count}</button>;
}`;

export function PrimitiveCodeExample() {
  return (
    <Code className="w-full max-w-2xl">
      <CodeHeader>
        <CodeTitle>counter.tsx</CodeTitle>
        <CodeActions>
          <CodeCopy value={SAMPLE} />
        </CodeActions>
      </CodeHeader>
      <CodeContent code={SAMPLE} lang="tsx" showLineNumbers />
    </Code>
  );
}
