"use client";

import { Code, CodeContent } from "@/components/control-ui/ui/code";

const SAMPLE = `const steps = [
  "Read registry metadata",
  "Install owned source",
  "Customize in place",
];

export function installSummary() {
  return steps.join(" -> ");
}`;

export function PrimitiveCodeHeaderlessExample() {
  return (
    <Code overflow="wrap" className="my-0 w-full max-w-2xl">
      <CodeContent code={SAMPLE} lang="tsx" />
    </Code>
  );
}
