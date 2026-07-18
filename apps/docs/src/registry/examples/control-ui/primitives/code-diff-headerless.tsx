"use client";

import { CodeDiff } from "@/components/control-ui/ui/code-diff";

const OLD = `export function formatRun(status: string) {
  return status.toUpperCase();
}`;

const NEW = `export function formatRun(status: string) {
  return status.trim().toUpperCase();
}`;

export function PrimitiveCodeDiffHeaderlessExample() {
  return (
    <div className="w-full max-w-2xl">
      <CodeDiff
        name="format-run.ts"
        lang="ts"
        oldText={OLD}
        newText={NEW}
        diffStyle="unified"
        diffIndicators="classic"
        header={false}
        className="my-0"
      />
    </div>
  );
}
